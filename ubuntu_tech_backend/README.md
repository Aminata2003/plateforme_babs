# Ubuntu Tech — Backend

API du backend de **Ubuntu Tech**, plateforme de formation en ligne en bureautique et
informatique (Word, Excel, PowerPoint), avec parcours structuré, quiz, devoirs, rencontres
en direct, bootcamps, paiement et certification.

Construit avec **Django 5.2** + **Django REST Framework**, pensé pour être consommé par le
front-end React du dépôt `ubuntu_tech_frontend`.

---

## Sommaire

- [Stack technique](#stack-technique)
- [Fonctionnalités](#fonctionnalités)
- [Structure du projet](#structure-du-projet)
- [Installation](#installation)
- [Variables d'environnement](#variables-denvironnement)
- [Rôles utilisateurs](#rôles-utilisateurs)
- [Référence API](#référence-api)
- [Paiement (PayTech)](#paiement-paytech)
- [Emails](#emails)
- [Limites connues / points à surveiller](#limites-connues--points-à-surveiller)
- [Tests](#tests)

---

## Stack technique

| Composant | Choix |
|---|---|
| Framework | Django 5.2 + Django REST Framework |
| Base de données | PostgreSQL (SQLite en secours si `DATABASE_URL` absent) |
| Authentification | JWT (SimpleJWT), connexion par email |
| Paiement | PayTech (Wave, Orange Money, Free Money, Carte Bancaire) |
| Génération de PDF | ReportLab (certificats) |
| QR code | `qrcode` |
| Stockage médias | Local en développement (`MEDIA_ROOT`), Cloudinary prêt à activer en prod |
| Emails | Console en développement, SMTP configurable en production |

## Fonctionnalités

- **Comptes & rôles** : apprenant, formateur, admin (propriétaire) — inscription publique,
  connexion JWT, réinitialisation de mot de passe par email, profil avec photo
- **Modules & leçons** : modules organisés par ordre, leçons vidéo (YouTube) avec support de
  cours téléchargeable, suivi de progression par apprenant
- **Quiz** : questions à choix multiples, correction automatique, limité à 3 tentatives par
  apprenant et par quiz, bonnes réponses jamais exposées côté apprenant avant tentative
- **Devoirs** : dépôt de fichier par l'apprenant, notation et commentaire par
  l'admin/formateur
- **Rencontres & bootcamps** : planification par l'admin, inscription (obligatoire pour les
  bootcamps), liste des participants
- **Paiement** : forfait unique pour toute la formation via PayTech, activation automatique
  de l'inscription (`Enrollment`) via webhook IPN
- **Certificats** : génération PDF avec QR code de vérification publique, logo et couleurs de
  la marque, NINEA de l'entreprise
- **Tableau de bord admin** : statistiques globales, évolution des inscriptions, liste des
  apprenants avec progression détaillée, file de devoirs à corriger

## Structure du projet

```
ubuntu_tech_backend/
├── manage.py
├── requirements.txt
├── .env.example
├── ubuntu_tech/            → configuration du projet (settings, urls)
└── apps/
    ├── accounts/            → utilisateurs, rôles, auth JWT, mot de passe oublié
    ├── courses/              → modules, leçons, quiz, devoirs, soumissions, progression
    ├── live_sessions/        → rencontres hebdomadaires et bootcamps
    ├── payments/             → intégration PayTech
    ├── certificates/         → génération PDF + vérification QR code
    └── dashboard/            → statistiques admin, vue d'ensemble des apprenants
```

## Installation

### Prérequis

- Python 3.12 ou supérieur
- Git
- PostgreSQL en production (SQLite suffit en développement)
- Node.js 18 ou supérieur et npm pour le frontend
- ngrok ou un autre tunnel HTTPS pour tester les notifications PayTech en local

### Linux/macOS

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env             # puis renseigner les variables (voir ci-dessous)

python manage.py migrate
python manage.py createsuperuser # crée automatiquement un compte role=admin
python manage.py runserver
```

### Windows PowerShell

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Sous CMD, activez l’environnement avec `venv\Scripts\activate` et copiez l’exemple avec
`copy .env.example .env`.

Le serveur écoute par défaut sur `http://127.0.0.1:8000`.

> Sans `DATABASE_URL` défini, le projet utilise SQLite pour tester rapidement en local.
> Pour la production, définir `DATABASE_URL` vers une base PostgreSQL.
>
> Les migrations ne créent aucun contenu initial : ajoutez ensuite les modules, leçons et
> sessions depuis l’interface d’administration.

## Variables d'environnement

| Variable | Description | Défaut |
|---|---|---|
| `SECRET_KEY` | Clé secrète Django | à définir (obligatoire en prod) |
| `DEBUG` | Mode debug | `True` |
| `ALLOWED_HOSTS` | Hôtes autorisés, séparés par virgules | `*` |
| `DATABASE_URL` | URL de connexion PostgreSQL | SQLite local si absent |
| `CORS_ALLOWED_ORIGINS` | Origines front autorisées, séparées par virgules | — |
| `FRONTEND_URL` | Base des liens envoyés par email (ex. réinit. mot de passe) | `http://localhost:3000` |
| `CERTIFICATE_VERIFY_BASE_URL` | Base des URLs publiques de vérification | — |
| `COURSE_PRICE_XOF` | Prix du forfait unique en FCFA | `45000` |
| `PAYTECH_API_KEY` / `PAYTECH_API_SECRET` | Identifiants PayTech | — |
| `PAYTECH_ENV` | `test` ou `production` | `test` |
| `PAYTECH_IPN_URL` | URL de notification PayTech (doit être en **HTTPS**) | — |
| `PAYTECH_SUCCESS_URL` / `PAYTECH_CANCEL_URL` | Redirections post-paiement | — |
| `CERTIFICATE_VERIFY_BASE_URL` | Base de l'URL de vérification des certificats | — |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `EMAIL_USE_TLS` | SMTP (si absents → emails affichés dans la console) | — |
| `DEFAULT_FROM_EMAIL` | Adresse d'expédition des emails | `no-reply@ubuntutech.sn` |

## Rôles utilisateurs

Champ `role` sur le modèle `User` :

- **`admin`** — propriétaire de la plateforme : accès complet (statistiques, gestion des
  modules, des apprenants, de l'équipe)
- **`formateur`** — créé par un admin : peut gérer les modules/leçons/quiz/devoirs, planifier
  des sessions, corriger les devoirs
- **`apprenant`** — inscription publique par défaut : accès aux contenus payés, quiz, devoirs,
  sessions, certificat

## Référence API

La liste complète des routes (méthode, accès, description) est disponible dans
[`API_REFERENCE.md`](./API_REFERENCE.md) à la racine du projet.

## Paiement (PayTech)

- Un seul forfait couvre toute la formation (`Enrollment` par utilisateur, pas par module)
- `POST /api/payments/initiate/` crée le paiement et renvoie l'URL PayTech
- `POST /api/payments/ipn/` reçoit la confirmation (signature vérifiée par HMAC) et active
  automatiquement l'inscription de l'apprenant
- **En développement**, PayTech exigeant du HTTPS pour l'IPN, un tunnel comme
  [ngrok](https://ngrok.com) est nécessaire pour tester le flux complet en local

## Emails

Aucun email n'est envoyé en local par défaut (backend `console` : affiché dans le terminal
`runserver`). Pour de vrais envois, définir `EMAIL_HOST` et les variables associées — voir la
table des variables d'environnement.

## Limites connues / points à surveiller

Points identifiés pendant le développement, utiles pour une revue :

- **Accès aux contenus payants** : les modules restent visibles dans le catalogue, mais les
  leçons, quiz, devoirs, sessions et certificats nécessitent une inscription active.
- **`env=test` PayTech** : tant que le compte PayTech n'est pas activé en production, les
  paiements restent en mode test (débit fictif).
- **NINEA sur le certificat** : actuellement en dur dans `apps/certificates/generator.py`
  (`PLATFORM_NINEA`) plutôt qu'en base — à changer si l'entité change.

## Tests

Les tests unitaires sont en cours d'écriture (`apps/<app>/tests.py`). Lancer la suite avec :

```bash
python manage.py test
```