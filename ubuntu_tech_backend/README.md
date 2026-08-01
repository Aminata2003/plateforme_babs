# Ubuntu Tech — Backend (API)

Backend Django + DRF de la plateforme de formation en bureautique et informatique.

## Structure

```
ubuntu_tech/          → configuration du projet (settings, urls)
apps/accounts/        → utilisateurs, rôles (admin/formateur/apprenant), auth JWT
apps/courses/         → modules, leçons (vidéos YouTube), quiz, devoirs, soumissions, progression
apps/dashboard/       → statistiques admin (évolution des participants)
```

## Démarrage local

```bash
python -m venv venv
source venv/bin/activate        # Windows : venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env             # puis renseigner les variables

python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser # pour créer le premier compte admin
python manage.py runserver
```

Par défaut (sans `DATABASE_URL` défini), le projet utilise SQLite pour tester rapidement en local.
Pour la production, définir `DATABASE_URL` (ex. vers Neon/Postgres).

## Rôles

Le champ `role` du modèle `User` (`apps/accounts/models.py`) définit 3 profils :
- `admin` → propriétaire de la plateforme (Ubuntu Tech) : gère tout
- `formateur` → peut créer/modifier les contenus (modules, leçons, quiz, devoirs)
- `apprenant` → accès en lecture + soumission de devoirs/quiz

Le premier compte admin se crée via `createsuperuser`, puis son `role` peut être mis à `admin`
soit dans l'admin Django, soit directement en base.

## Endpoints principaux

| Endpoint | Description |
|---|---|
| `POST /api/auth/register/` | Inscription (apprenant) |
| `POST /api/auth/login/` | Connexion (retourne access + refresh JWT) |
| `GET/PATCH /api/auth/me/` | Voir/modifier mon profil |
| `GET/POST /api/modules/` | Liste / création de modules |
| `GET/POST /api/lessons/?module=<id>` | Leçons d'un module |
| `POST /api/lessons/<id>/mark_completed/` | Apprenant marque une leçon comme vue |
| `GET/POST /api/quizzes/` | Quiz (avec questions/choix imbriqués) |
| `POST /api/quizzes/<id>/submit_attempt/` | Soumettre les réponses, correction automatique |
| `GET/POST /api/devoirs/?module=<id>` | Devoirs d'un module |
| `GET/POST /api/submissions/` | Rendus de devoirs (scopés à l'utilisateur si apprenant) |
| `POST /api/submissions/<id>/grade/` | Noter un rendu (formateur/admin) |
| `GET /api/dashboard/stats/` | Tableau de bord admin : évolution des participants, progression, scores |

## Prochaines étapes suggérées

- Module `payments` (agrégateur Wave/Orange Money/Free Money/carte)
- Module `sessions` (rencontres hebdomadaires + bootcamps, lien Zoom/Meet)
- Module `certificates` (génération PDF + QR code)
- Intégration Cloudinary pour les fichiers (ressources, avatars, rendus de devoirs)
