/**
 * Outils de traitement du texte, partagés par la recherche du site et l'assistant.
 * Fonctionne entièrement dans le navigateur (aucun serveur, aucune API externe) :
 *  - normalisation (minuscules, accents, apostrophes) ;
 *  - découpage en mots, y compris le chinois (caractères + bigrammes) ;
 *  - racinisation légère (anglais, français, espagnol, portugais) ;
 *  - tolérance aux fautes de frappe (distance de Levenshtein) ;
 *  - détection de la langue d'un message.
 */

const CJK = /[㐀-鿿豈-﫿]/;
const CJK_RUN = /[㐀-鿿豈-﫿]+/g;

/** Minuscules, sans accents, apostrophes et tirets unifiés. */
export function normalize(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’`´]/g, "'")
    .replace(/[‐-―]/g, '-')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/ß/g, 'ss');
}

/** Mots vides (fréquents, peu porteurs de sens) dans les langues du site. */
const STOPWORDS = new Set(`
a an the and or of to in on at for from by with is are was be been do does did can could would should will
i you we they he she it my your our their me us them this that these those there here what which who whom how
have has had am not no yes if so as about into than then just also any some all more most very please hi
le la les un une des du de d l et ou au aux en dans sur pour par avec est sont etre ai as a avez ont je tu il
elle nous vous ils elles mon ma mes ton ta tes son sa ses notre nos votre vos leur leurs ce cet cette ces qui
que quoi quel quelle quels quelles ne pas plus se s y on si mais donc car c qu j m n t est-ce svp
el los las unos unas del al y o es son ser yo tu usted ustedes nosotros mi mis su sus nuestro que cual como
por para con sin se lo le les muy mas pero si no hay este esta estos estas ese esa eso
o os um uma uns umas do da dos das no na nos nas em e ou eu voce voces ele ela eles elas meu minha seu sua
nosso nossa que qual como por para com sem se muito mais mas nao isso este esta
`.split(/\s+/).filter(Boolean));

export const isStopword = (w: string) => STOPWORDS.has(w);

/** Racinisation légère et identique pour l'index et la requête (pluriels, suffixes courants). */
export function stem(word: string): string {
  let w = word;
  if (w.length <= 3 || /\d/.test(w) || CJK.test(w)) return w;
  const rules: [RegExp, string][] = [
    [/(ements?|ments?)$/, ''],
    [/(ations?|acions?|acoes|acao|ciones|cion)$/, 'at'],
    [/(ities|ites|idades?|idad|ite)$/, 'it'],
    [/ing$/, ''],
    [/ies$/, 'y'],
    [/(eaux|aux)$/, 'al'],
    [/(es|s|x)$/, ''],
    [/(e|o|a)$/, ''],
  ];
  for (const [re, rep] of rules) {
    if (re.test(w) && w.replace(re, rep).length >= 3) { w = w.replace(re, rep); }
  }
  return w;
}

/** Découpe un texte normalisé en mots (le chinois : caractères isolés + bigrammes). */
export function words(text: string): string[] {
  const n = normalize(text);
  const out: string[] = [];
  for (const m of n.matchAll(/[a-z0-9]+(?:['-][a-z0-9]+)*|[㐀-鿿豈-﫿]+/g)) {
    const w = m[0];
    if (CJK.test(w)) {
      for (let i = 0; i < w.length; i++) {
        out.push(w[i]);
        if (i < w.length - 1) out.push(w.slice(i, i + 2));
      }
    } else {
      for (const part of w.split(/['-]/)) if (part) out.push(part);
    }
  }
  return out;
}

/** Mots-clés significatifs (sans mots vides), racinisés. */
export function tokens(text: string): string[] {
  return words(text).filter(w => !STOPWORDS.has(w) && (w.length > 1 || CJK.test(w))).map(stem);
}

/** Distance de Levenshtein bornée (renvoie max+1 si dépassée) : rapide pour la tolérance aux fautes. */
export function distance(a: string, b: string, max = 2): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  // Damerau-Levenshtein (une inversion de deux lettres compte pour une seule faute).
  let before: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) cur[j] = Math.min(cur[j], before[j - 2] + 1);
      best = Math.min(best, cur[j]);
    }
    if (best > max) return max + 1;
    before = prev;
    prev = cur;
  }
  return prev[b.length];
}

/** Nombre de fautes tolérées selon la longueur du mot. */
export const typoBudget = (w: string) => (CJK.test(w) ? 0 : w.length >= 8 ? 2 : w.length >= 4 ? 1 : 0);

/** Vrai si le mot `w` correspond au terme `term` (égalité, racine, faute de frappe ou préfixe). */
export function fuzzyEquals(w: string, term: string, allowPrefix = false): boolean {
  if (w === term) return true;
  if (allowPrefix && w.length >= 3 && term.startsWith(w)) return true;
  const budget = Math.min(typoBudget(w), typoBudget(term));
  return budget > 0 && distance(w, term, budget) <= budget;
}

export const hasCjk = (text: string) => CJK.test(text);
export const cjkRuns = (text: string): string[] => text.match(CJK_RUN) ?? [];

/** Échappe une chaîne pour l'utiliser dans une expression régulière. */
export const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export type DetectedLang = 'en' | 'fr' | 'es' | 'pt' | 'zh';

const LANG_HINTS: Record<Exclude<DetectedLang, 'zh'>, string[]> = {
  en: ['the', 'what', 'how', 'you', 'do', 'is', 'are', 'can', 'your', 'need', 'want', 'much', 'many', 'hello', 'thanks', 'please', 'with', 'would', 'which', 'where', 'when', 'shipping', 'price'],
  fr: ['le', 'la', 'les', 'je', 'vous', 'est', 'des', 'pour', 'avec', 'quel', 'quelle', 'combien', 'bonjour', 'merci', 'livraison', 'prix', 'votre', 'vos', 'avez', 'pouvez', 'besoin', 'est-ce', 'comment', 'ou', 'quand', 'faites'],
  es: ['el', 'los', 'las', 'que', 'usted', 'ustedes', 'para', 'con', 'cual', 'cuanto', 'cuanta', 'hola', 'gracias', 'envio', 'precio', 'necesito', 'quiero', 'tienen', 'pueden', 'como', 'donde', 'cuando', 'hacen', 'puedo'],
  pt: ['o', 'os', 'voce', 'voces', 'para', 'com', 'qual', 'quanto', 'ola', 'obrigado', 'obrigada', 'envio', 'preco', 'preciso', 'quero', 'tem', 'podem', 'como', 'onde', 'quando', 'fazem', 'nao', 'sao', 'posso'],
};

/** Détecte la langue d'un message (null si incertain). */
export function detectLang(text: string): DetectedLang | null {
  const cjk = (text.match(CJK_RUN) ?? []).join('').length;
  if (cjk >= 2) return 'zh';
  const w = words(text);
  if (w.length < 3) return null;
  const scores = (Object.keys(LANG_HINTS) as (keyof typeof LANG_HINTS)[])
    .map(l => ({ l, s: w.filter(x => LANG_HINTS[l].includes(x)).length }))
    .sort((a, b) => b.s - a.s);
  if (scores[0].s >= 2 && scores[0].s > scores[1].s) return scores[0].l;
  // Indices orthographiques (sur le texte avec accents).
  const raw = text.toLowerCase();
  if (/[ñ¿¡]/.test(raw)) return 'es';
  if (/[ãõ]|ção|ções/.test(raw)) return 'pt';
  if (/[èêàùç]|qu'|j'|l'|d'/.test(raw)) return 'fr';
  return null;
}

/** Segment de texte affiché (gras ou non). */
export interface TextSegment { text: string; strong?: boolean; mark?: boolean; }

/** Mini-markdown : **gras**, lignes, puces « • ». Renvoie des lignes de segments (pas de HTML injecté). */
export function rich(text: string): TextSegment[][] {
  return text.split('\n').map(line =>
    line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map(part =>
      part.startsWith('**') && part.endsWith('**') ? { text: part.slice(2, -2), strong: true } : { text: part }));
}
