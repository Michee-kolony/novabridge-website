import { AfterViewInit, Component, ElementRef, Input, NgZone, OnDestroy, inject, viewChild } from '@angular/core';
import { GeoPermissibleObjects, geoDistance, geoEquirectangular, geoGraticule10, geoInterpolate, geoOrthographic, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import { prefersReducedMotion } from './gsap.directives';

/** Point affiché sur le globe : [longitude, latitude]. */
export interface GlobePoint { name: string; coords: [number, number]; }
/** Liaison animée (arc) entre deux points. */
export interface GlobeRoute { from: [number, number]; to: [number, number]; }

const GOLD = '#C9A24B';
const GOLD_LIGHT = '#E9D9AE';

/**
 * Globe terrestre en rotation (canvas + d3-geo), sans WebGL.
 * Continents en points, pôles d'approvisionnement (or), marchés (blanc) et routes animées.
 * Déplaçable à la souris / au doigt ; animation coupée hors écran et si « réduire les animations ».
 */
@Component({
  selector: 'nb-globe',
  standalone: false,
  host: { class: 'relative block aspect-square w-full select-none' },
  template: `
    <canvas #canvas class="h-full w-full cursor-grab touch-pan-y active:cursor-grabbing" role="img" [attr.aria-label]="label"></canvas>
  `,
})
export class GlobeComponent implements AfterViewInit, OnDestroy {
  /** Pôles d'origine (mis en avant en or). */
  @Input() hubs: GlobePoint[] = [];
  /** Destinations (marchés desservis). */
  @Input() markets: GlobePoint[] = [];
  @Input() routes: GlobeRoute[] = [];
  /** Description accessible du globe. */
  @Input() label = '';

  private canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private zone = inject(NgZone);

  private ctx!: CanvasRenderingContext2D;
  private size = 0;
  private dpr = 1;
  private dots: [number, number][] = [];
  private rotation: [number, number, number] = [-20, -18, 0];
  private speed = 6; // degrés par seconde
  private raf = 0;
  private last = 0;
  private elapsed = 0;
  private visible = false;
  private dragging = false;
  private dragStart: [number, number] | null = null;
  private rotStart: [number, number] = [0, 0];
  private resizeObs?: ResizeObserver;
  private interObs?: IntersectionObserver;
  private readonly reduced = prefersReducedMotion();
  private readonly projection = geoOrthographic().clipAngle(90).precision(0.5);
  private readonly graticule = geoGraticule10();

  async ngAfterViewInit() {
    const canvas = this.canvas().nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeObs = new ResizeObserver(() => { this.resize(); this.draw(); });
    this.resizeObs.observe(canvas);
    this.resize();
    this.draw();

    this.interObs = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting;
      if (this.visible) this.start(); else this.stop();
    });
    this.interObs.observe(canvas);
    this.bindDrag(canvas);

    try {
      const topo = await fetch('geo/land-110m.json').then(r => r.json()) as Topology<{ land: GeometryCollection }>;
      this.dots = this.landDots(feature(topo, topo.objects.land) as GeoPermissibleObjects);
    } catch { /* sans données : globe sans continents */ }
    this.draw();
  }

  ngOnDestroy() {
    this.stop();
    this.resizeObs?.disconnect();
    this.interObs?.disconnect();
  }

  /** Échantillonne les terres sur une grille (via une carte équirectangulaire hors écran). */
  private landDots(land: GeoPermissibleObjects): [number, number][] {
    const w = 720, h = 360;
    const off = document.createElement('canvas');
    off.width = w; off.height = h;
    const c = off.getContext('2d', { willReadFrequently: true })!;
    const proj = geoEquirectangular().fitSize([w, h], { type: 'Sphere' });
    c.beginPath(); geoPath(proj, c)(land); c.fillStyle = '#000'; c.fill();
    const data = c.getImageData(0, 0, w, h).data;
    const dots: [number, number][] = [];
    const step = 1.6; // espacement en degrés
    for (let lat = -84; lat <= 84; lat += step) {
      const lonStep = step / Math.max(Math.cos(lat * Math.PI / 180), 0.2);
      for (let lon = -180; lon < 180; lon += lonStep) {
        const [x, y] = proj([lon, lat])!;
        if (data[(Math.floor(y) * w + Math.floor(x)) * 4 + 3] > 128) dots.push([lon, lat]);
      }
    }
    return dots;
  }

  private resize() {
    const canvas = this.canvas().nativeElement;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.size = canvas.clientWidth;
    canvas.width = Math.round(this.size * this.dpr);
    canvas.height = Math.round(this.size * this.dpr);
    const r = this.size / 2 / 1.09; // marge pour le halo
    this.projection.scale(r).translate([this.size / 2, this.size / 2]);
  }

  private start() {
    if (this.reduced || this.raf) return;
    this.last = performance.now();
    this.zone.runOutsideAngular(() => {
      const tick = (t: number) => {
        const dt = Math.min((t - this.last) / 1000, 0.1);
        this.last = t;
        this.elapsed += dt;
        if (!this.dragging) this.rotation[0] += this.speed * dt;
        this.draw();
        this.raf = requestAnimationFrame(tick);
      };
      this.raf = requestAnimationFrame(tick);
    });
  }

  private stop() { cancelAnimationFrame(this.raf); this.raf = 0; }

  private bindDrag(canvas: HTMLCanvasElement) {
    canvas.addEventListener('pointerdown', e => {
      this.dragging = true;
      this.dragStart = [e.clientX, e.clientY];
      this.rotStart = [this.rotation[0], this.rotation[1]];
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', e => {
      if (!this.dragging || !this.dragStart) return;
      const k = 180 / (this.size || 1);
      this.rotation[0] = this.rotStart[0] + (e.clientX - this.dragStart[0]) * k;
      this.rotation[1] = Math.max(-60, Math.min(60, this.rotStart[1] - (e.clientY - this.dragStart[1]) * k));
      if (this.reduced || !this.visible) this.draw();
    });
    const end = () => { this.dragging = false; this.dragStart = null; };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
  }

  /** Le point est-il sur la face visible du globe ? */
  private isVisible(p: [number, number]) {
    return geoDistance(p, [-this.rotation[0], -this.rotation[1]]) < Math.PI / 2 - 0.02;
  }

  private draw() {
    if (!this.ctx || !this.size) return;
    const c = this.ctx;
    const s = this.size;
    const r = this.projection.scale();
    const cx = s / 2, cy = s / 2;
    this.projection.rotate(this.rotation);
    const path = geoPath(this.projection, c);

    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.clearRect(0, 0, s, s);

    // Halo
    const halo = c.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.08);
    halo.addColorStop(0, 'rgba(201,162,75,0.28)');
    halo.addColorStop(1, 'rgba(201,162,75,0)');
    c.fillStyle = halo;
    c.beginPath(); c.arc(cx, cy, r * 1.08, 0, Math.PI * 2); c.fill();

    // Océan
    const ocean = c.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.1, cx, cy, r);
    ocean.addColorStop(0, '#1D4E89');
    ocean.addColorStop(0.55, '#13305A');
    ocean.addColorStop(1, '#071528');
    c.fillStyle = ocean;
    c.beginPath(); path({ type: 'Sphere' }); c.fill();

    // Méridiens et parallèles
    c.beginPath(); path(this.graticule);
    c.strokeStyle = 'rgba(255,255,255,0.07)'; c.lineWidth = 0.6; c.stroke();

    // Continents en points
    const dotR = Math.max(r / 260, 0.9);
    c.fillStyle = 'rgba(233,217,174,0.55)';
    c.beginPath();
    for (const d of this.dots) {
      if (!this.isVisible(d)) continue;
      const [x, y] = this.projection(d)!;
      c.moveTo(x + dotR, y);
      c.arc(x, y, dotR, 0, Math.PI * 2);
    }
    c.fill();

    // Routes : chaque arc se dessine puis s'efface, en décalé
    const cycle = 4.2;
    this.routes.forEach((route, i) => {
      const t = this.reduced ? 1 : ((this.elapsed / cycle + i / Math.max(this.routes.length, 1)) % 1);
      const head = Math.min(t / 0.6, 1);           // 0 → 1 : tracé
      const fade = t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4; // puis disparition
      const interp = geoInterpolate(route.from, route.to);
      const n = 48;
      const pts: [number, number][] = [];
      for (let k = 0; k <= n * head; k++) pts.push(interp(k / n) as [number, number]);
      if (pts.length < 2) return;
      c.beginPath(); path({ type: 'LineString', coordinates: pts });
      c.strokeStyle = `rgba(201,162,75,${0.85 * fade})`; c.lineWidth = 1.6; c.stroke();
      const tip = pts[pts.length - 1];
      if (head < 1 && this.isVisible(tip)) {
        const [x, y] = this.projection(tip)!;
        c.beginPath(); c.arc(x, y, 3, 0, Math.PI * 2); c.fillStyle = GOLD_LIGHT; c.fill();
      }
    });

    // Points : marchés puis pôles
    const pulse = this.reduced ? 0.5 : (this.elapsed % 2) / 2;
    c.font = `600 ${Math.max(10, Math.round(r / 22))}px Inter, "Segoe UI", Arial, sans-serif`;
    c.textBaseline = 'middle';
    const marker = (p: GlobePoint, color: string, radius: number) => {
      if (!this.isVisible(p.coords)) return;
      const [x, y] = this.projection(p.coords)!;
      c.beginPath(); c.arc(x, y, radius + pulse * 9, 0, Math.PI * 2);
      c.strokeStyle = color; c.globalAlpha = 1 - pulse; c.lineWidth = 1.2; c.stroke(); c.globalAlpha = 1;
      c.beginPath(); c.arc(x, y, radius, 0, Math.PI * 2); c.fillStyle = color; c.fill();
      if (p.name) {
        c.fillStyle = 'rgba(255,255,255,0.92)';
        c.shadowColor = 'rgba(7,21,40,0.9)'; c.shadowBlur = 4;
        c.fillText(p.name, x + radius + 5, y);
        c.shadowBlur = 0;
      }
    };
    this.markets.forEach(m => marker(m, '#FFFFFF', 3));
    this.hubs.forEach(h => marker(h, GOLD, 3.5));

    // Reflet
    const shine = c.createRadialGradient(cx - r * 0.45, cy - r * 0.5, 0, cx - r * 0.45, cy - r * 0.5, r * 1.1);
    shine.addColorStop(0, 'rgba(255,255,255,0.10)');
    shine.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = shine;
    c.beginPath(); path({ type: 'Sphere' }); c.fill();
  }
}
