import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, inject, signal, viewChild } from '@angular/core';
import { prefersReducedMotion } from './gsap.directives';

const MAX_DROPS = 12;

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`;

/**
 * Pour chaque pixel : légère ondulation permanente (eau au-dessus de l'image)
 * + ondes circulaires amorties pour chaque goutte. L'image est réfractée selon la pente de l'onde,
 * avec un reflet lumineux sur les crêtes.
 */
const FRAG = `
precision highp float;
uniform sampler2D u_tex;
uniform vec2 u_res;      // taille du canvas (px)
uniform vec2 u_img;      // taille de l'image (px)
uniform float u_time;
uniform float u_scale;   // échelle des ondes (dpr)
uniform vec3 u_drops[${MAX_DROPS}]; // x, y (px, origine en bas à gauche), instant de la goutte

void main() {
  vec2 p = gl_FragCoord.xy;
  vec2 offset = vec2(0.0);
  float light = 0.0;

  // Ondulation de fond : l'eau qui bouge doucement au-dessus de l'image
  float t = u_time;
  vec2 q = p / u_scale;
  offset += vec2(sin(q.y * 0.021 + t * 1.1) + sin(q.x * 0.013 - t * 0.7),
                 cos(q.x * 0.019 + t * 0.9) + cos(q.y * 0.011 + t * 0.6)) * 1.6 * u_scale;

  for (int i = 0; i < ${MAX_DROPS}; i++) {
    vec3 d = u_drops[i];
    float age = t - d.z;
    if (d.z <= 0.0 || age < 0.0 || age > 5.0) continue;
    vec2 dir = p - d.xy;
    float dist = length(dir) / u_scale;
    float front = age * 240.0;                 // vitesse de propagation (px/s)
    float width = 20.0 + age * 26.0;           // le train d'ondes s'élargit
    float x = dist - front;
    float env = exp(-x * x / (2.0 * width * width)) * exp(-age * 1.0);
    env *= smoothstep(0.0, 0.08, age);         // impact progressif
    float k = 0.12;                            // nombre d'onde
    float wave = sin(x * k) * env;
    float slope = cos(x * k) * env;
    vec2 n = dist > 0.001 ? dir / (dist * u_scale) : vec2(0.0);
    offset += n * wave * 12.0 * u_scale;
    light += slope * 0.4;
    // éclat au point d'impact
    light += exp(-dist * dist / 140.0) * exp(-age * 8.0) * 0.9;
  }

  // Ajustement « object-cover » de l'image dans le canvas
  vec2 sp = p + offset;
  float s = max(u_res.x / u_img.x, u_res.y / u_img.y);
  vec2 size = u_img * s;
  vec2 uv = (sp - (u_res - size) * 0.5) / size;
  uv.y = 1.0 - uv.y;
  uv = clamp(uv, 0.001, 0.999);
  vec3 col = texture2D(u_tex, uv).rgb;
  col += vec3(0.85, 0.92, 1.0) * max(light, 0.0);
  col -= vec3(0.10, 0.08, 0.04) * max(-light, 0.0);
  gl_FragColor = vec4(col, 1.0);
}`;

/**
 * Effet « surface d'eau » sur une image de fond (WebGL) :
 * chaque clic / toucher sur la zone `target` fait tomber une goutte qui crée des ondes.
 * Sans WebGL ou si « réduire les animations » est activé, l'image reste simplement affichée.
 */
@Component({
  selector: 'nb-water-ripple',
  standalone: false,
  host: { class: 'absolute inset-0 block' },
  template: `
    <img [src]="src" alt="" crossorigin="anonymous" class="h-full w-full object-cover">
    <canvas #canvas class="pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-700"
            [class.opacity-0]="!ready()" aria-hidden="true"></canvas>
  `,
})
export class WaterRippleComponent implements AfterViewInit, OnDestroy {
  /** URL de l'image (doit autoriser le CORS, ex. Unsplash). */
  @Input({ required: true }) src!: string;
  /** Élément qui reçoit les clics (par défaut : le composant lui-même). */
  @Input() target?: HTMLElement;

  readonly ready = signal(false);
  private canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private host = inject(ElementRef<HTMLElement>);
  private zone = inject(NgZone);

  private gl?: WebGLRenderingContext;
  private prog?: WebGLProgram;
  private u: Record<string, WebGLUniformLocation | null> = {};
  private drops = new Float32Array(MAX_DROPS * 3);
  private nextDrop = 0;
  private imgSize: [number, number] = [1, 1];
  private start = performance.now();
  private raf = 0;
  private visible = true;
  private resizeObs?: ResizeObserver;
  private interObs?: IntersectionObserver;
  private onPointer = (e: PointerEvent) => this.drop(e.clientX, e.clientY);

  ngAfterViewInit() {
    if (prefersReducedMotion()) return;
    const canvas = this.canvas().nativeElement;
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false });
    if (!gl || !this.setup(gl)) return;
    this.gl = gl;

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      } catch { return; } // image non CORS : on garde l'image simple
      this.imgSize = [image.naturalWidth, image.naturalHeight];
      this.resize();
      this.zone.run(() => this.ready.set(true));
      (this.target ?? this.host.nativeElement).addEventListener('pointerdown', this.onPointer);
      this.loop();
    };
    image.src = this.src;

    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(canvas);
    this.interObs = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting;
      if (this.visible) this.loop();
    });
    this.interObs.observe(this.host.nativeElement);
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.resizeObs?.disconnect();
    this.interObs?.disconnect();
    (this.target ?? this.host.nativeElement).removeEventListener('pointerdown', this.onPointer);
    this.gl?.getExtension('WEBGL_lose_context')?.loseContext();
  }

  /** Fait tomber une goutte à la position (coordonnées écran). */
  drop(clientX: number, clientY: number) {
    if (!this.gl) return;
    const canvas = this.canvas().nativeElement;
    const rect = canvas.getBoundingClientRect();
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return;
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    const i = this.nextDrop++ % MAX_DROPS;
    this.drops[i * 3] = (clientX - rect.left) * sx;
    this.drops[i * 3 + 1] = canvas.height - (clientY - rect.top) * sy;
    this.drops[i * 3 + 2] = this.now();
  }

  private now() { return (performance.now() - this.start) / 1000; }

  private setup(gl: WebGLRenderingContext): boolean {
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return false;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
    gl.useProgram(prog);
    this.prog = prog;

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    for (const n of ['u_tex', 'u_res', 'u_img', 'u_time', 'u_scale', 'u_drops']) this.u[n] = gl.getUniformLocation(prog, n);
    return true;
  }

  private resize() {
    const canvas = this.canvas().nativeElement;
    // Résolution plafonnée : l'effet reste fluide sur les grands écrans
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    this.gl?.viewport(0, 0, canvas.width, canvas.height);
  }

  private loop() {
    if (this.raf || !this.gl || !this.ready()) return;
    this.zone.runOutsideAngular(() => {
      const frame = () => {
        if (!this.visible) { this.raf = 0; return; } // hors écran : pause (reprise via l'IntersectionObserver)
        this.render();
        this.raf = requestAnimationFrame(frame);
      };
      this.raf = requestAnimationFrame(frame);
    });
  }

  private render() {
    const gl = this.gl!;
    const canvas = this.canvas().nativeElement;
    gl.uniform1i(this.u['u_tex'], 0);
    gl.uniform2f(this.u['u_res'], canvas.width, canvas.height);
    gl.uniform2f(this.u['u_img'], this.imgSize[0], this.imgSize[1]);
    gl.uniform1f(this.u['u_time'], this.now());
    gl.uniform1f(this.u['u_scale'], canvas.width / Math.max(canvas.clientWidth, 1));
    gl.uniform3fv(this.u['u_drops'], this.drops);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}
