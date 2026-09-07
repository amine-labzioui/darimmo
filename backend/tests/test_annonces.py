"""
Tests — Annonces DarImmo
"""

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.annonces.models import Annonce
from apps.users.models import User


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def agence_user(db):
    return User.objects.create_user(
        username="agence_immo", email="agence@example.com", password="Passw0rd!123", role="agence"
    )


@pytest.fixture
def client_user(db):
    return User.objects.create_user(
        username="client_test", email="client@example.com", password="Passw0rd!123", role="client"
    )


@pytest.fixture
def published_annonce(agence_user):
    return Annonce.objects.create(
        owner=agence_user,
        title="Villa moderne avec piscine",
        description="Belle villa contemporaine à Marrakech",
        property_type=Annonce.PropertyType.VILLA,
        transaction_type=Annonce.TransactionType.VENTE,
        status=Annonce.Status.PUBLISHED,
        city="Marrakech",
        price=3500000,
        surface=320,
        bedrooms=4,
        bathrooms=3,
        has_pool=True,
    )


@pytest.mark.django_db
class TestAnnonceList:
    def test_list_only_published(self, api_client, agence_user):
        Annonce.objects.create(
            owner=agence_user, title="Brouillon", description="...",
            property_type="villa", transaction_type="vente",
            status=Annonce.Status.DRAFT, city="Rabat", price=1000000, surface=100,
        )
        Annonce.objects.create(
            owner=agence_user, title="Publiée", description="...",
            property_type="villa", transaction_type="vente",
            status=Annonce.Status.PUBLISHED, city="Rabat", price=1000000, surface=100,
        )
        url = reverse("annonce-list")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        titles = [a["title"] for a in response.data["results"]]
        assert "Publiée" in titles
        assert "Brouillon" not in titles

    def test_filter_by_city(self, api_client, published_annonce):
        url = reverse("annonce-list")
        response = api_client.get(url, {"city": "Marrakech"})
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] == 1

    def test_filter_by_price_range(self, api_client, published_annonce):
        url = reverse("annonce-list")
        response = api_client.get(url, {"price_min": 4000000})
        assert response.data["count"] == 0

        response = api_client.get(url, {"price_min": 1000000, "price_max": 4000000})
        assert response.data["count"] == 1


@pytest.mark.django_db
class TestAnnonceCreate:
    def test_create_requires_auth(self, api_client):
        url = reverse("annonce-list")
        response = api_client.post(url, {"title": "Test"})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_success(self, api_client, agence_user):
        api_client.force_authenticate(user=agence_user)
        url = reverse("annonce-list")
        payload = {
            "title": "Appartement Casa Finance City",
            "description": "Superbe appartement moderne",
            "property_type": "appartement",
            "transaction_type": "vente",
            "city": "Casablanca",
            "price": "2850000",
            "surface": "142",
            "bedrooms": 3,
            "bathrooms": 2,
        }
        response = api_client.post(url, payload, format="multipart")
        assert response.status_code == status.HTTP_201_CREATED
        assert Annonce.objects.filter(title="Appartement Casa Finance City").exists()


@pytest.mark.django_db
class TestAnnonceDetail:
    def test_retrieve_increments_views(self, api_client, published_annonce):
        url = reverse("annonce-detail", args=[published_annonce.id])
        assert published_annonce.views_count == 0
        api_client.get(url)
        published_annonce.refresh_from_db()
        assert published_annonce.views_count == 1

    def test_only_owner_can_edit(self, api_client, published_annonce, client_user):
        api_client.force_authenticate(user=client_user)
        url = reverse("annonce-detail", args=[published_annonce.id])
        response = api_client.patch(url, {"title": "Hack"}, format="json")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_owner_can_publish(self, api_client, agence_user):
        annonce = Annonce.objects.create(
            owner=agence_user, title="Riad à valider", description="...",
            property_type="riad", transaction_type="vente",
            status=Annonce.Status.DRAFT, city="Fès", price=2000000, surface=200,
        )
        api_client.force_authenticate(user=agence_user)
        url = reverse("annonce-publier", args=[annonce.id])
        response = api_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        annonce.refresh_from_db()
        assert annonce.status == Annonce.Status.PUBLISHED
