# Ubuntu Tech — Frontend

Front-end de **Ubuntu Tech**, plateforme de formation en ligne en bureautique et
informatique. Construit avec **React (Vite)** et **Tailwind CSS**, consomme l'API du dépôt
`ubuntu_tech_backend`.

---

## Sommaire

- [Stack technique](#stack-technique)
- [Fonctionnalités](#fonctionnalités)
- [Structure du projet](#structure-du-projet)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Design system](#design-system)
- [Architecture des pages](#architecture-des-pages)
- [Rôles et accès](#rôles-et-accès)
- [Limites connues / points à surveiller](#limites-connues--points-à-surveiller)

---

## Stack technique

| Composant | Choix |
|---|---|
| Framework | React 18 + Vite |
| Style | Tailwind CSS |
| Routage | React Router v6 |
| Requêtes API | Axios |
| Authentification | JWT stocké en `localStorage`, attaché automatiquement aux requêtes |

## Fonctionnalités

**Espace public (marketing)**
- Page d'accueil présentant le programme (3 modules, 24 semaines), le format hebdomadaire et
  le tarif
- Inscription, connexion, mot de passe oublié / réinitialisation

**Espace apprenant**
- Tableau de bord : modules inscrits/en cours/terminés, historique des quiz, prochaines
  rencontres, téléchargement du certificat
- Cours : liste des modules, détail d'un module (leçons vidéo, support de cours
  téléchargeable, quiz avec limite de tentatives, devoirs et suivi des rendus)
- Rencontres & bootcamps : calendrier, inscription aux bootcamps, lien de visio
- Profil : modification des informations et de la photo de profil

**Espace propriétaire (admin/formateur)**
- Vue d'ensemble : statistiques, évolution des inscriptions, progression par module, devoirs
  en attente, prochaines sessions (admin uniquement)
- Modules : création, édition, suppression, gestion des leçons/quiz/devoirs d'un module
- Rencontres : planification des sessions, liste des inscrits
- Devoirs : file de correction globale (toutes les soumissions en attente)
- Apprenants : liste avec progression détaillée par apprenant (admin uniquement)
- Équipe : ajout/retrait d'autres comptes admin ou formateur (admin uniquement)

## Structure du projet

```
ubuntu_tech_frontend/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── env.example
├── public/assets/            → logos (Ubuntu Tech, JëmTech)
└── src/
    ├── api/                   → clients axios (auth, courses, live sessions, paiement...)
    ├── context/               → AuthContext (état de connexion global)
    ├── components/
    │   ├── Navbar.jsx / Footer.jsx / PublicLayout.jsx   → habillage des pages publiques
    │   ├── AppShell.jsx                                  → sidebar de l'espace connecté
    │   ├── ProtectedRoute.jsx                             → garde d'accès par rôle
    │   └── ConfirmDialog.jsx                              → boîte de confirmation réutilisable
    ├── pages/                 → pages publiques + apprenant
    │   └── admin/              → pages de l'espace propriétaire
    ├── App.jsx                → déclaration de toutes les routes
    └── main.jsx                → point d'entrée (Router + AuthProvider)
```

## Installation

### Prérequis

- Node.js 18 ou supérieur
- npm
- Le backend Ubuntu Tech lancé sur `http://127.0.0.1:8000`, sauf configuration différente

```bash
npm install
cp env.example .env             # PowerShell : Copy-Item env.example .env
npm run dev
```

Le site tourne par défaut sur `http://localhost:3000` et s'attend à trouver le backend sur
`http://127.0.0.1:8000` (configurable via `.env`).

## Variables d'environnement

| Variable | Description | Défaut |
|---|---|---|
| `VITE_API_BASE_URL` | URL de base de l'API backend | `http://127.0.0.1:8000` |

La valeur ne doit pas se terminer par `/api` : le client ajoute automatiquement ce suffixe.

## Design system

- **Couleurs** : navy (`#10192E`), signal blue (`#2E6FB3`), or/gold (`#C9A227`), fond papier
  (`#F6F7FA`) — cohérentes avec le certificat PDF généré côté backend
- **Typographies** : Sora (titres), Inter (texte courant), IBM Plex Mono (labels/données)
- Composants transverses : cartes arrondies (`rounded-xl2`), boutons pilule, badges de statut

## Architecture des pages

Deux habillages distincts selon le contexte :

- **`PublicLayout`** (Navbar + Footer marketing) pour les pages publiques : accueil,
  connexion, inscription, mot de passe oublié
- **`AppShell`** (sidebar applicative) pour tout l'espace connecté : cours, tableau de bord,
  rencontres, profil, et tout l'espace propriétaire

Le routage (`App.jsx`) imbrique les routes de l'espace connecté sous un unique élément
`<AppShell />`, chacune protégée individuellement par `<ProtectedRoute>` (avec restriction de
rôle optionnelle).

## Rôles et accès

La navigation affichée dans `AppShell` change selon `user.role` :

- **`apprenant`** → Tableau de bord, Cours, Rencontres
- **`formateur`** → Modules, Rencontres, Devoirs (pas de Vue d'ensemble ni Apprenants/Équipe,
  réservés à l'admin)
- **`admin`** → accès complet : Vue d'ensemble, Modules, Rencontres, Devoirs, Apprenants,
  Équipe

`ProtectedRoute` redirige automatiquement vers une page adaptée au rôle en cas d'accès refusé
(pas de boucle de redirection entre rôles).

## Limites connues / points à surveiller

- **Accès aux contenus payants** : le catalogue des modules est public pour permettre la
  découverte de la formation, mais les leçons et actions pédagogiques sont protégées par
  `Enrollment.is_active` côté backend.
- **Pas de tests automatisés** pour l'instant côté front-end