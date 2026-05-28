"""
Django settings for votechain_backend project.
"""

from pathlib import Path
import os
from dotenv import load_dotenv

# Загружаем переменные из файла .env
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent


# ─── Безопасность ────────────────────────────────────────────────────────────
# В .env можно переопределить. Для локальной разработки оставляем дефолт.
SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "django-insecure-uhao!!xy6-&s25qm-dy%=c44s(ro!8!x=rl0xp67+bcmjfbet="
)

# DEBUG=True по умолчанию (учебный проект). В .env можно поставить DEBUG=False.
DEBUG = os.getenv("DJANGO_DEBUG", "True").lower() in ("true", "1", "yes")

# Список разрешённых хостов (для DEBUG=True не критично)
ALLOWED_HOSTS = os.getenv("DJANGO_ALLOWED_HOSTS", "*").split(",")


# ─── Приложения ──────────────────────────────────────────────────────────────

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Сторонние
    'rest_framework',       # Django REST Framework
    'corsheaders',          # CORS — чтобы фронт мог стучаться с другого порта
    # Наши
    'api',
]

# Важно: CorsMiddleware должен стоять как можно выше, до CommonMiddleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # CSRF отключён для простоты тестирования через curl/Postman и фронта.
    # В продакшене нужно включить обратно.
    # 'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ─── CORS ────────────────────────────────────────────────────────────────────
# Для учебного проекта разрешаем всё. В проде нужно указать конкретные домены.
CORS_ALLOW_ALL_ORIGINS = os.getenv("CORS_ALLOW_ALL", "True").lower() in ("true", "1", "yes")
# Альтернатива (если CORS_ALLOW_ALL=False):
# CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:5173").split(",")


ROOT_URLCONF = 'votechain_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'votechain_backend.wsgi.application'


# ─── База данных ─────────────────────────────────────────────────────────────
# Используем SQLite только для встроенных таблиц Django (admin, auth, sessions).
# Бизнес-данные хранятся в блокчейне.
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# ─── Прочие настройки ────────────────────────────────────────────────────────

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
