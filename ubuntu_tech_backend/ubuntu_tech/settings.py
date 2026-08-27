import os
from datetime import timedelta
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-a-changer-en-production")
DEBUG = os.environ.get("DEBUG", "True") == "True"
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "*").split(",")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "django_filters",

    "apps.accounts",
    "apps.courses",
    "apps.dashboard",
    "apps.live_sessions",
    "apps.payments",
    "apps.certificates",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "ubuntu_tech.urls"

TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [],
    "APP_DIRS": True,
    "OPTIONS": {"context_processors": [
        "django.template.context_processors.debug",
        "django.template.context_processors.request",
        "django.contrib.auth.context_processors.auth",
        "django.contrib.messages.context_processors.messages",
    ]},
}]

WSGI_APPLICATION = "ubuntu_tech.wsgi.application"

# Base de données PostgreSQL (ex. Neon) via DATABASE_URL, ou SQLite en local par défaut.
DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
    )
}

AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "fr-fr"
TIME_ZONE = "Africa/Dakar"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_FILTER_BACKENDS": ["django_filters.rest_framework.DjangoFilterBackend"],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=8),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}

# À restreindre au domaine du front-end en production.
CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOWED_ORIGINS = os.environ.get("CORS_ALLOWED_ORIGINS", "").split(",") if not DEBUG else []

# Paiement PayTech (Wave, Orange Money, Free Money, Carte Bancaire)
# Voir https://docs.intech.sn/doc_paytech.php
PAYTECH_API_KEY = os.environ.get("PAYTECH_API_KEY", "")
PAYTECH_API_SECRET = os.environ.get("PAYTECH_API_SECRET", "")
PAYTECH_ENV = os.environ.get("PAYTECH_ENV", "test")  # "test" tant que le compte n'est pas activé en production
PAYTECH_IPN_URL = os.environ.get("PAYTECH_IPN_URL", "https://votre-domaine.com/api/payments/ipn/")
PAYTECH_SUCCESS_URL = os.environ.get("PAYTECH_SUCCESS_URL", "https://votre-domaine.com/paiement-reussi")
PAYTECH_CANCEL_URL = os.environ.get("PAYTECH_CANCEL_URL", "https://votre-domaine.com/paiement-annule")
COURSE_PRICE_XOF = int(os.environ.get("COURSE_PRICE_XOF", "45000"))

# Certificats : base de l'URL publique de vérification (scannée via le QR code)
CERTIFICATE_VERIFY_BASE_URL = os.environ.get(
    "CERTIFICATE_VERIFY_BASE_URL", "https://votre-domaine.com/verifier-certificat/",
)

# URL du front-end (utilisée pour construire les liens dans les emails, ex. réinitialisation de mot de passe)
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

# Email : affiché dans la console en local par défaut. En production, définir EMAIL_HOST etc.
# via les variables d'environnement pour utiliser un vrai serveur SMTP.
if os.environ.get("EMAIL_HOST"):
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST = os.environ.get("EMAIL_HOST")
    EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587"))
    EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
    EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
    EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "True") == "True"
else:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "no-reply@ubuntutech.sn")
