"""
URLs — Intégration Agent IA (N8N) DarImmo
"""

from django.urls import path

from . import views

urlpatterns = [
    path("chat/", views.AIChatView.as_view(), name="ai-chat"),
    path("conversations/<str:session_id>/", views.AIConversationHistoryView.as_view(), name="ai-conversation-history"),
    path("mes-conversations/", views.MyAIConversationsView.as_view(), name="my-ai-conversations"),
    path("conseils-marche/", views.MarketAdviceView.as_view(), name="market-advice"),
    path("recommandations/<int:pk>/clic/", views.TrackRecommendationClickView.as_view(), name="track-recommendation-click"),
]
