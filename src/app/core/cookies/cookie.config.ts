/**
 * Configuration du système de cookies (bandeau, préférences, politique cookies).
 *
 * Tout est piloté par ce fichier :
 *  - ajouter un cookie dans une catégorie  → il apparaît automatiquement dans le panneau et sur /cookies ;
 *  - ajouter un script dans `scripts`       → il n'est chargé QUE si l'utilisateur accepte la catégorie ;
 *  - changer CONSENT_VERSION                → le bandeau est ré-affiché à tous les visiteurs.
 *
 * Les textes (nom, description, finalité) sont dans public/i18n/<langue>.json, sous « cookies. ».
 */

export type CookieCategoryId = 'necessary' | 'preferences' | 'analytics' | 'marketing';

export interface CookieDefinition {
  /** Nom exact, ou préfixe se terminant par * (ex. « _ga_* »). */
  name: string;
  provider: string;
  storage: 'cookie' | 'localStorage' | 'sessionStorage';
  /** Durée de conservation ; `session` = jusqu'à la fermeture du navigateur. */
  duration: { value: number; unit: 'days' | 'months' | 'years' } | 'session' | 'persistent';
  /** Clé de traduction de la finalité : cookies.purposes.<purpose> */
  purpose: string;
}

export interface CookieScript {
  id: string;
  /** Script externe… */
  src?: string;
  /** …ou code en ligne. */
  inline?: string;
  async?: boolean;
}

export interface CookieCategory {
  id: CookieCategoryId;
  /** Toujours actif, impossible à refuser. */
  required: boolean;
  cookies: CookieDefinition[];
  scripts: CookieScript[];
}

/** Incrémenter pour redemander le consentement à tout le monde (nouveaux cookies, nouvelle finalité…). */
export const CONSENT_VERSION = 1;
/** Durée de validité du choix de l'utilisateur (6 mois, recommandation CNIL). */
export const CONSENT_MAX_AGE_DAYS = 180;
/** Nom du cookie qui mémorise le choix. */
export const CONSENT_COOKIE = 'nb_consent';

export const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: 'necessary',
    required: true,
    cookies: [
      { name: CONSENT_COOKIE, provider: 'NovaBridge', storage: 'cookie', duration: { value: 6, unit: 'months' }, purpose: 'consent' },
      { name: 'novabridge-store-v1', provider: 'NovaBridge', storage: 'localStorage', duration: 'persistent', purpose: 'forms' },
      { name: 'novabridge-admin-session', provider: 'NovaBridge', storage: 'sessionStorage', duration: 'session', purpose: 'admin' },
    ],
    scripts: [],
  },
  {
    id: 'preferences',
    required: false,
    cookies: [
      { name: 'novabridge-lang', provider: 'NovaBridge', storage: 'localStorage', duration: 'persistent', purpose: 'language' },
    ],
    scripts: [],
  },
  {
    id: 'analytics',
    required: false,
    cookies: [
      // Exemple Google Analytics 4 — décommentez avec le script ci-dessous :
      // { name: '_ga', provider: 'Google', storage: 'cookie', duration: { value: 2, unit: 'years' }, purpose: 'analytics' },
      // { name: '_ga_*', provider: 'Google', storage: 'cookie', duration: { value: 2, unit: 'years' }, purpose: 'analytics' },
    ],
    scripts: [
      // { id: 'ga4', src: 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX', async: true },
      // { id: 'ga4-init', inline: "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-XXXXXXX');" },
    ],
  },
  {
    id: 'marketing',
    required: false,
    cookies: [],
    scripts: [],
  },
];
