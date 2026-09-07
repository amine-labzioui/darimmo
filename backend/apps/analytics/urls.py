"""
URLs — Analytics & Statistiques DarImmo
"""

from django.urls import path

from . import views

urlpatterns = [
    path("mes-annonces/", views.MyAnnoncesAnalyticsView.as_view(), name="my-annonces-analytics"),
    path("tendances/", views.MarketTrendsView.as_view(), name="market-trends"),
    path("log-recherche/", views.RecordSearchView.as_view(), name="record-search"),
]
