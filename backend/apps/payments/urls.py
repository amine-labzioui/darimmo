"""
URLs — Paiements DarImmo
"""

from django.urls import path

from . import views

from .views import (
    BoostPlanListView,
    TransactionListView,
    CreateCheckoutView,
    StripeWebhookView,
    CMICallbackView,
    SimulatePaymentView,
    InvoiceView,
)

urlpatterns = [
    path("boost-plans/", views.BoostPlanListView.as_view(), name="boost-plans"),
    path("transactions/", views.TransactionListView.as_view(), name="transactions"),
    path("checkout/", views.CreateCheckoutView.as_view(), name="checkout"),

    path("webhooks/stripe/", views.StripeWebhookView.as_view(), name="stripe-webhook"),
    path("webhooks/cmi/", views.CMICallbackView.as_view(), name="cmi-webhook"),
    
    path("simulate/", views.SimulatePaymentView.as_view(), name="simulate-payment"),
    path("invoice/<int:transaction_id>/",InvoiceView.as_view(),name="payment-invoice",),
]
