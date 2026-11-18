# NovaBridge Global Supply LLC — Site vitrine + back-office

Angular 18 (composants standalone, signals) · Tailwind CSS 3 · GSAP 3 (ScrollTrigger).
Charte graphique : `../02_Charte_Graphique`. Logos : `public/logos`.

## Lancer le projet

```bash
npm install        # la première fois seulement
npm start          # http://localhost:4200
npm run build      # version de production dans dist/novabridge-site/browser
```

## Les deux interfaces

| Interface | URL | Langue |
|---|---|---|
| Site client | `/` · `/products` · `/products/:slug` · `/markets` · `/how-it-works` · `/about` · `/news` · `/quote` · `/contact` | Anglais (marché principal : USA) |
| Back-office | `/admin` (lien « Administration » en pied de page) | Français |

**Connexion au back-office (démo)** : `admin@novabridge.local` / `NovaBridge2026`

Back-office : tableau de bord, demandes de devis (filtres, recherche, statut, notes, réponse par e-mail),
messages de contact, annonces (création, modification, publication, mise à la une), catalogue produits
(textes, liste de produits, affichage/masquage), paramètres (réinitialisation des données de démo).

## Données (statiques pour l'instant)

- Informations réelles de l'entreprise : `src/app/core/data/company.ts` (source : Company Portfolio 2026).
- Gammes de produits, annonces de départ et exemples de devis : `src/app/core/data/seed.ts`.
  Les devis et messages de départ sont **fictifs** (marqués « Donnée de démonstration »).
- `src/app/core/services/store.service.ts` garde tout dans le `localStorage` du navigateur :
  un devis envoyé sur le site apparaît dans le back-office, une annonce publiée apparaît sur le site.
  Pour brancher une API plus tard, seules les méthodes de ce service sont à remplacer par des appels HTTP.
- L'authentification (`auth.service.ts`) est une démo côté navigateur : **à remplacer par une vraie
  authentification serveur avant la mise en ligne.**

## Animations (GSAP)

`src/app/shared/gsap.directives.ts` :
- `nbReveal` (`up`, `left`, `right`, `fade`, `scale`, `stagger`) : apparition au défilement
- `[nbCountUp]` : compteurs animés des chiffres clés
- `[nbParallax]` : parallaxe des images de fond

Plus : la timeline du hero de l'accueil (arches dessinées, étoile) et la frise de progression de « How it works ».
Les animations sont désactivées si l'utilisateur a activé « réduire les animations ».

## Images

Photos hébergées sur Unsplash (licence Unsplash, usage commercial gratuit), appelées par leur identifiant
(`img('photo-…', largeur, hauteur)`). Pour mettre vos propres photos (usines, contrôle qualité, équipe),
placez-les dans `public/images/` et remplacez l'identifiant par `/images/nom-du-fichier.jpg` ou une URL complète.
