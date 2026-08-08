# Ubuntu Tech — Frontend

Front-end React (Vite + Tailwind) de la plateforme de formation Ubuntu Tech.

## Démarrage

```bash
npm install
cp .env.example .env
npm run dev
```

Le site tourne sur **http://localhost:3000** (le backend Django doit tourner en parallèle
sur `http://127.0.0.1:8000`, comme configuré dans `.env`).

## Structure

```
src/
  api/client.js       → client axios pré-configuré (token JWT auto-attaché)
  components/         → Navbar, Footer (communs à toutes les pages)
  pages/
    Home.jsx           → page d'accueil (landing page)
    ComingSoon.jsx      → placeholder pour les pages pas encore construites
  App.jsx              → routes de l'application
  index.css            → tokens de design (couleurs, typographies) + styles globaux
public/assets/          → logos Ubuntu Tech et JëmTech
```

## Design system

- **Couleurs** : navy (`#10192E`), signal blue (`#2E6FB3`), or/gold (`#C9A227` — repris du
  certificat PDF pour une identité cohérente), fond papier (`#F6F7FA`)
- **Typographies** : Sora (titres), Inter (texte courant), IBM Plex Mono (labels/données)

## Pages déjà construites

- `/` — page d'accueil complète (hero, programme, format, tableau de bord, tarifs)

## Pages à venir (prochaine étape)

- `/connexion`, `/inscription` — authentification
- `/tableau-de-bord` — tableau de bord apprenant (cours inscrits/en cours/terminés, quiz)
- Tableau de bord admin/propriétaire (statistiques, évolution des participants)

## Prix affiché

Le tarif sur la page d'accueil (`PRICE_FCFA` dans `src/pages/Home.jsx`) est un **placeholder**
à remplacer par le tarif réel une fois fixé avec le propriétaire de la plateforme.
