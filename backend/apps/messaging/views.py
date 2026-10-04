"""
Vues — Messagerie & Notifications DarImmo
"""

from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from urllib3 import request

from apps.annonces.models import Annonce

from .models import Conversation, Message, Notification
from .serializers import ConversationSerializer, MessageSerializer, NotificationSerializer


class ConversationViewSet(viewsets.ModelViewSet):
    """
    GET  /api/messaging/conversations/             — conversations de l'utilisateur connecté
    POST /api/messaging/conversations/contacter/    — démarre une conversation depuis une annonce
    GET  /api/messaging/conversations/{id}/messages/— messages d'une conversation
    POST /api/messaging/conversations/{id}/envoyer/ — envoyer un message
    """

    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "post"]

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(
            Q(client=user) | Q(agent=user)
        ).select_related("annonce", "client", "agent")

    @action(detail=False, methods=["post"])
    
    def contacter(self, request):
        print("===== CONTACTER ACTION =====")
        print(request.data)

        annonce_id = request.data.get("annonce")

        message_content = request.data.get(
          "message",
          "Bonjour."
        )

        annonce = get_object_or_404(
           Annonce,
        pk=annonce_id,
       )
  
        conversation, created = Conversation.objects.get_or_create(
           annonce=annonce,
           client=request.user,
           agent=annonce.owner,
        )

        if created:

            Message.objects.create(
                conversation=conversation,
                sender=request.user,
                recipient=annonce.owner,
                content=message_content,
            )

            Notification.objects.create(
                user=annonce.owner,
                notification_type=Notification.NotificationType.NEW_MESSAGE,
                title="Nouveau message",
                body=f"{request.user.get_full_name()} vous a contacté à propos de '{annonce.title}'.",
            )

        return Response(
        {
            "conversation_id": conversation.id,
            "created": created,
        },
        status=status.HTTP_200_OK,
    )

    @action(detail=True, methods=["get"])
    def messages(self, request, pk=None):
        conversation = self.get_object()
        msgs = conversation.messages.all()
        return Response(MessageSerializer(msgs, many=True).data)

    @action(detail=True, methods=["post"])
    def envoyer(self, request, pk=None):
        conversation = self.get_object()
        content = request.data.get("content", "").strip()
        if not content:
            return Response({"detail": "Le message ne peut pas être vide."}, status=400)

        recipient = conversation.agent if request.user == conversation.client else conversation.client
        message = Message.objects.create(
            conversation=conversation, sender=request.user, recipient=recipient, content=content
        )
        Notification.objects.create(
            user=recipient,
            notification_type=Notification.NotificationType.NEW_MESSAGE,
            title="Nouveau message",
            body=f"{request.user.get_full_name()} : {content[:80]}",
        )
        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET  /api/messaging/notifications/
    POST /api/messaging/notifications/{id}/marquer-lu/
    POST /api/messaging/notifications/tout-marquer-lu/
    """

    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=["post"], url_path="marquer-lu")
    def marquer_lu(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save(update_fields=["is_read"])
        return Response({"detail": "Notification marquée comme lue."})

    @action(detail=False, methods=["post"], url_path="tout-marquer-lu")
    def tout_marquer_lu(self, request):
        # Pas de filtre booléen dans la requête ORM (non supporté par Djongo) :
        # les notifications non lues sont sélectionnées en Python.
        for notif in self.get_queryset():
            if not notif.is_read:
                notif.is_read = True
                notif.save(update_fields=["is_read"])
        return Response({"detail": "Toutes les notifications ont été marquées comme lues."})
