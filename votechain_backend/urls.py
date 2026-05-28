"""
URL configuration for votechain_backend project.

Здесь мы подключаем маршруты нашего приложения api.
Все URL из api/urls.py будут доступны с префиксом /api/

Например:
  /api/elections/          → api.urls → ElectionListView
  /api/elections/0/        → api.urls → ElectionDetailView
  /api/elections/0/close/  → api.urls → CloseElectionView
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # Стандартная панель администратора Django (можно не использовать)
    path('admin/', admin.site.urls),

    # Подключаем все маршруты из приложения api с префиксом /api/
    path('api/', include('api.urls')),
]