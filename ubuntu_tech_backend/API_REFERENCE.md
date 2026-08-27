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
| GET | `/api/users/?role=apprenant&is_active=true` | Admin/Formateur | Liste des apprenants actifs, utilisée pour les invitations |
| GET/PATCH/DELETE | `/api/users/<id>/` | Admin | Détail/modif/suppression d'un utilisateur |

---

## 📚 Contenus de cours (`apps/courses`)

| Méthode | URL | Accès | Description |
|---|---|---|---|
| GET | `/api/modules/` | Connecté | Liste des modules |
| POST | `/api/modules/` | Admin/Formateur | Créer un module |
| GET/PATCH/DELETE | `/api/modules/<id>/` | Connecté (lecture) / Admin-Formateur (écriture) | Détail d'un module (avec ses leçons) |
| GET | `/api/lessons/?module=<id>` | Apprenant inscrit / Admin-Formateur | Leçons d'un module publié |
| POST | `/api/lessons/` | Admin/Formateur | Créer une leçon (vidéo YouTube) |
| GET/PATCH/DELETE | `/api/lessons/<id>/` | Apprenant inscrit en lecture / Admin-Formateur en écriture | Détail/modif/suppression d'une leçon |
| POST | `/api/lessons/<id>/mark_completed/` | Apprenant inscrit | Marquer la leçon comme vue |
| GET | `/api/quizzes/` | Apprenant inscrit / Admin-Formateur | Liste des quiz |
| POST | `/api/quizzes/` | Admin/Formateur | Créer un quiz ; questions et choix se créent séparément |
| POST | `/api/quizzes/<id>/submit_attempt/` | Apprenant inscrit | Soumettre `{"answers": {"<question_id>": <choice_id>}}` → correction auto |
| GET | `/api/quiz-attempts/me/` | Apprenant inscrit | Historique de mes tentatives |
| GET | `/api/devoirs/?module=<id>` | Apprenant inscrit / Admin-Formateur | Devoirs d'un module |
| POST | `/api/devoirs/` | Admin/Formateur | Créer un devoir |
| GET | `/api/submissions/` | Apprenant inscrit (ses rendus) / Admin-Formateur (tous) | Filtrable `?devoir=<id>` |
| POST | `/api/submissions/` | Apprenant inscrit | Rendre un devoir (multipart, fichier) |
| POST | `/api/submissions/<id>/grade/` | Admin/Formateur | Noter un rendu `{"grade": 8, "feedback": "..."}` |

---

## 🗓️ Rencontres & bootcamps (`apps/live_sessions`)

| Méthode | URL | Accès | Description |
|---|---|---|---|
| GET | `/api/live-sessions/?type=rencontre` ou `?type=bootcamp` | Apprenant inscrit / Admin-Formateur | Calendrier des sessions |
| POST | `/api/live-sessions/` | Admin/Formateur | Planifier une rencontre/bootcamp |
| POST | `/api/live-sessions/<id>/register/` | Apprenant inscrit | S'inscrire à une session |
| GET | `/api/live-sessions/<id>/participants/` | Admin/Formateur | Liste des inscrits |
| POST | `/api/live-sessions/<id>/notify/` | Admin/Formateur | Envoyer des invitations avec `{"user_ids": [1], "emails": ["invite@example.com"]}` |

---

## 💳 Paiement (`apps/payments`)

| Méthode | URL | Accès | Description |
|---|---|---|---|
| POST | `/api/payments/initiate/` | Connecté | `{"target_payment": ""}` → le serveur applique `COURSE_PRICE_XOF` et renvoie `redirect_url` PayTech |
| POST | `/api/payments/ipn/` | Public (PayTech uniquement) | Callback PayTech — nécessite HTTPS en production |
| GET | `/api/payments/payments/` | Connecté (scopé) | Historique de mes paiements (ou tous si admin) |

---

## 🎓 Certificats (`apps/certificates`)

| Méthode | URL | Accès | Description |
|---|---|---|---|
| POST | `/api/certificates/me/` | Apprenant inscrit | Générer mon certificat (refuse si parcours incomplet) |
| GET | `/api/certificates/me/` | Connecté | Récupérer mon certificat déjà généré |
| POST | `/api/certificates/issue/<user_id>/` | Admin/Formateur | Forcer la génération pour un apprenant |
| GET | `/api/certificates/certificates/` | Connecté (scopé) | Liste des certificats (moi ou tous si admin/formateur) |
| GET | `/api/certificates/verify/<uid>/` | **Public** | Vérification via QR code — aucune auth requise |

---

## 📊 Tableau de bord (`apps/dashboard`)

| Méthode | URL | Accès | Description |
|---|---|---|---|
| GET | `/api/dashboard/stats/` | Admin | Total apprenants, inscriptions actives, évolution hebdo, progression par module, score moyen quiz, devoirs en attente, prochaines sessions |
| GET | `/api/dashboard/learners/` | Admin | Vue synthétique des apprenants |
| GET | `/api/dashboard/learners/<id>/` | Admin | Progression détaillée d'un apprenant |

---

## Rôles (`role` sur User)

- `admin` → propriétaire de la plateforme, accès total
- `formateur` → peut créer/modifier les contenus (modules, leçons, quiz, devoirs, sessions), noter les devoirs
- `apprenant` → lecture des contenus publiés + soumissions/quiz/inscriptions bootcamps, son propre profil/paiements/certificat

## Notes pour le front-end

- Les listes renvoient actuellement des tableaux JSON ; si une pagination est activée plus tard,
  adapter le front-end pour lire la clé `results`.
- Les uploads (avatar, ressources de leçon, rendus de devoirs) doivent être envoyés en `multipart/form-data`, pas en JSON.
- CORS est ouvert à tous en local (`DEBUG=True`). En production, restreindre via `CORS_ALLOWED_ORIGINS` dans `.env`.