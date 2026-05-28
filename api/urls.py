"""
urls.py — маршруты приложения api.
Все маршруты доступны с префиксом /api/ (см. votechain_backend/urls.py).
"""

from django.urls import path
from . import views

urlpatterns = [
    # ─── Адрес владельца контракта ────────────────────────────────────────
    # GET /api/owner/
    path(
        "owner/",
        views.OwnerView.as_view(),
        name="contract-owner"
    ),

    # ─── Список голосований / создание ────────────────────────────────────
    # GET  /api/elections/
    # POST /api/elections/
    path(
        "elections/",
        views.ElectionListView.as_view(),
        name="election-list"
    ),

    # ─── Данные о голосовании ─────────────────────────────────────────────
    # GET /api/elections/<id>/
    path(
        "elections/<int:election_id>/",
        views.ElectionDetailView.as_view(),
        name="election-detail"
    ),

    # ─── Список кандидатов ────────────────────────────────────────────────
    # GET /api/elections/<id>/candidates/
    path(
        "elections/<int:election_id>/candidates/",
        views.CandidatesView.as_view(),
        name="election-candidates"
    ),

    # ─── Добавление в белый список ────────────────────────────────────────
    # POST /api/elections/<id>/whitelist/
    path(
        "elections/<int:election_id>/whitelist/",
        views.WhitelistView.as_view(),
        name="election-whitelist"
    ),

    # ─── Закрытие голосования ─────────────────────────────────────────────
    # POST /api/elections/<id>/close/
    path(
        "elections/<int:election_id>/close/",
        views.CloseElectionView.as_view(),
        name="election-close"
    ),

    # ─── Результаты голосования ───────────────────────────────────────────
    # GET /api/elections/<id>/results/
    path(
        "elections/<int:election_id>/results/",
        views.ElectionResultsView.as_view(),
        name="election-results"
    ),

    # ─── Статус избирателя ────────────────────────────────────────────────
    # GET /api/elections/<id>/voters/<address>/status/
    path(
        "elections/<int:election_id>/voters/<str:address>/status/",
        views.VoterStatusView.as_view(),
        name="voter-status"
    ),
]
