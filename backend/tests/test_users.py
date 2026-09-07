"""
Tests — Utilisateurs DarImmo
"""

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.users.models import User


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
class TestRegistration:
    def test_register_client_success(self, api_client):
        url = reverse("register")
        payload = {
            "username": "yassine_b",
            "email": "yassine@example.com",
            "password": "MotDePasse123!",
            "password_confirm": "MotDePasse123!",
            "first_name": "Yassine",
            "last_name": "Bennani",
            "role": "client",
            "city": "Casablanca",
        }
        response = api_client.post(url, payload, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert "access" in response.data
        assert User.objects.filter(email="yassine@example.com").exists()

    def test_register_password_mismatch(self, api_client):
        url = reverse("register")
        payload = {
            "username": "test_user",
            "email": "test@example.com",
            "password": "MotDePasse123!",
            "password_confirm": "AutreMotDePasse!",
            "role": "client",
        }
        response = api_client.post(url, payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_cannot_create_admin(self, api_client):
        url = reverse("register")
        payload = {
            "username": "fake_admin",
            "email": "admin@example.com",
            "password": "MotDePasse123!",
            "password_confirm": "MotDePasse123!",
            "role": "admin",
        }
        response = api_client.post(url, payload, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestLogin:
    def test_login_success(self, api_client):
        User.objects.create_user(
            username="client1", email="client1@example.com", password="Passw0rd!123"
        )
        url = reverse("login")
        response = api_client.post(
            url, {"email": "client1@example.com", "password": "Passw0rd!123"}, format="json"
        )
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data

    def test_login_wrong_password(self, api_client):
        User.objects.create_user(
            username="client2", email="client2@example.com", password="Passw0rd!123"
        )
        url = reverse("login")
        response = api_client.post(
            url, {"email": "client2@example.com", "password": "wrong"}, format="json"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestProfile:
    def test_get_profile_requires_auth(self, api_client):
        url = reverse("profile")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_profile_authenticated(self, api_client):
        user = User.objects.create_user(
            username="client3", email="client3@example.com", password="Passw0rd!123"
        )
        api_client.force_authenticate(user=user)
        url = reverse("profile")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == "client3@example.com"
