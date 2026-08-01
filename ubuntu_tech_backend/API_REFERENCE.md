# Ubuntu Tech — Référence API Backend

Base URL locale : `http://127.0.0.1:8000`
Toutes les routes (sauf mention contraire) nécessitent l'en-tête :
`Authorization: Bearer <access_token>`

---

## 🔐 Auth & comptes (`apps/accounts`)

| Méthode | URL | Accès | Description |
|---|---|---|---|
| POST | `/api/auth/register/` | Public | Inscription (toujours en `apprenant`) |
| POST | `/api/auth/login/` | Public | Connexion → renvoie `access` + `refresh` |
| POST | `/api/auth/refresh/` | Public | Renouvelle le token `access` |
| GET | `/api/auth/me/` | Connecté | Voir mon profil |
| PATCH | `/api/auth/me/` | Connecté | Modifier mon profil (multipart pour l'avatar) |
| GET | `/api/users/` | Admin | Liste des utilisateurs |
| GET/PATCH/DELETE | `/api/users/<id>/` | Admin | Détail/modif/suppression d'un utilisateur |

---

## 📚 Contenus de cours (`apps/courses`)

| Méthode | URL | Accès | Description |
|---|---|---|---|
| GET | `/api/modules/` | Connecté | Liste des modules |
| POST | `/api/modules/` | Admin/Formateur | Créer un module |
| GET/PATCH/DELETE | `/api/modules/<id>/` | Connecté (lecture) / Admin-Formateur (écriture) | Détail d'un module (avec ses leçons) |
| GET | `/api/lessons/?module=<id>` | Connecté | Leçons d'un module |
| POST | `/api/lessons/` | Admin/Formateur | Créer une leçon (vidéo YouTube) |
| GET/PATCH/DELETE | `/api/lessons/<id>/` | selon rôle | Détail/modif/suppression d'une leçon |
| POST | `/api/lessons/<id>/mark_completed/` | Connecté | Apprenant marque la leçon comme vue |
| GET | `/api/quizzes/` | Connecté | Liste des quiz |
| POST | `/api/quizzes/` | Admin/Formateur | Créer un quiz (avec questions/choix imbriqués) |
| POST | `/api/quizzes/<id>/submit_attempt/` | Connecté | Soumettre les réponses `{"answers": {"<question_id>": <choice_id>}}` → correction auto |
| GET | `/api/devoirs/?module=<id>` | Connecté | Devoirs d'un module |
| POST | `/api/devoirs/` | Admin/Formateur | Créer un devoir |
| GET | `/api/submissions/` | Connecté (scopé) | Mes rendus (ou tous si admin/formateur, filtrable `?devoir=<id>`) |
| POST | `/api/submissions/` | Connecté | Rendre un devoir (multipart, fichier) |
| POST | `/api/submissions/<id>/grade/` | Admin/Formateur | Noter un rendu `{"grade": 8, "feedback": "..."}` |

---

## 🗓️ Rencontres & bootcamps (`apps/live_sessions`)

| Méthode | URL | Accès | Description |
|---|---|---|---|
| GET | `/api/live-sessions/?type=rencontre` ou `?type=bootcamp` | Connecté | Calendrier des sessions |
| POST | `/api/live-sessions/` | Admin/Formateur | Planifier une rencontre/bootcamp |
| POST | `/api/live-sessions/<id>/register/` | Connecté | S'inscrire à un bootcamp |
| GET | `/api/live-sessions/<id>/participants/` | Admin/Formateur | Liste des inscrits |

---

## 💳 Paiement (`apps/payments`)

| Méthode | URL | Accès | Description |
|---|---|---|---|
| POST | `/api/payments/initiate/` | Connecté | `{"item_name": "...", "amount": 15000, "target_payment": ""}` → renvoie `redirect_url` PayTech |
| POST | `/api/payments/ipn/` | Public (PayTech uniquement) | Callback PayTech — nécessite HTTPS en production |
| GET | `/api/payments/payments/` | Connecté (scopé) | Historique de mes paiements (ou tous si admin) |

---

## 🎓 Certificats (`apps/certificates`)

| Méthode | URL | Accès | Description |
|---|---|---|---|
| POST | `/api/certificates/me/` | Connecté | Générer mon certificat (refuse si parcours incomplet) |
| GET | `/api/certificates/me/` | Connecté | Récupérer mon certificat déjà généré |
| POST | `/api/certificates/issue/<user_id>/` | Admin/Formateur | Forcer la génération pour un apprenant |
| GET | `/api/certificates/certificates/` | Connecté (scopé) | Liste des certificats (moi ou tous si admin/formateur) |
| GET | `/api/certificates/verify/<uid>/` | **Public** | Vérification via QR code — aucune auth requise |

---

## 📊 Tableau de bord (`apps/dashboard`)

| Méthode | URL | Accès | Description |
|---|---|---|---|
| GET | `/api/dashboard/stats/` | Admin | Total apprenants, inscriptions actives, évolution hebdo, progression par module, score moyen quiz, devoirs en attente, prochaines sessions |

---

## Rôles (`role` sur User)

- `admin` → propriétaire de la plateforme, accès total
- `formateur` → peut créer/modifier les contenus (modules, leçons, quiz, devoirs, sessions), noter les devoirs
- `apprenant` → lecture des contenus publiés + soumissions/quiz/inscriptions bootcamps, son propre profil/paiements/certificat

## Notes pour le front-end

- Toutes les listes utilisent la pagination par défaut de DRF (si activée) — vérifier la clé `results` dans les réponses de liste le cas échéant.
- Les uploads (avatar, ressources de leçon, rendus de devoirs) doivent être envoyés en `multipart/form-data`, pas en JSON.
- CORS est ouvert à tous en local (`DEBUG=True`). En production, restreindre via `CORS_ALLOWED_ORIGINS` dans `.env`.