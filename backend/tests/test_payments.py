"""
Tests — Paiements DarImmo
"""

from unittest.mock import MagicMock, patch

import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from apps.annonces.models import Annonce
from apps.payments.models import BoostPlan, Transaction
from apps.users.models import User


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def agence_user(db):
    return User.objects.create_user(
        username="agence_pay", email="agence_pay@example.com", password="Passw0rd!123", role="agence"
    )


@pytest.fixture
def annonce(agence_user):
    return Annonce.objects.create(
        owner=agence_user, title="Bien à booster", description="...",
        property_type="villa", transaction_type="vente",
        status=Annonce.Status.PUBLISHED, city="Tanger", price=2000000, surface=180,
    )


@pytest.fixture
def boost_plan(db):
    return BoostPlan.objects.create(name="Boost 7 jours", duration_days=7, price=199, is_active=True)


@pytest.mark.django_db
class TestBoostPlans:
    def test_list_active_plans_public(self, api_client, boost_plan):
        url = reverse("boost-plans")
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) >= 1 if "results" in response.data else len(response.data) >= 1


@pytest.mark.django_db
class TestCheckout:
    @patch("apps.payments.views.StripeHandler.create_checkout_session")
    def test_create_stripe_checkout(self, mock_create_session, api_client, agence_user, annonce, boost_plan):
        mock_session = MagicMock()
        mock_session.id = "cs_test_123"
        mock_session.url = "https://checkout.stripe.com/test"
        mock_create_session.return_value = mock_session

        api_client.force_authenticate(user=agence_user)
        url = reverse("checkout")
        response = api_client.post(
            url,
            {"annonce_id": annonce.id, "boost_plan_id": boost_plan.id, "provider": "stripe"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["checkout_url"] == "https://checkout.stripe.com/test"
        assert Transaction.objects.filter(annonce=annonce, status=Transaction.Status.PENDING).exists()

    def test_checkout_requires_auth(self, api_client, annonce, boost_plan):
        url = reverse("checkout")
        response = api_client.post(
            url, {"annonce_id": annonce.id, "boost_plan_id": boost_plan.id}, format="json"
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_cannot_checkout_for_others_annonce(self, api_client, annonce, boost_plan):
        other_user = User.objects.create_user(
            username="other", email="other@example.com", password="Passw0rd!123"
        )
        api_client.force_authenticate(user=other_user)
        url = reverse("checkout")
        response = api_client.post(
            url, {"annonce_id": annonce.id, "boost_plan_id": boost_plan.id}, format="json"
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND
