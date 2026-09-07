"""
Serializers — Messagerie & Notifications DarImmo
"""

from rest_framework import serializers

from .models import Conversation, Message, Notification


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.get_full_name", read_only=True)

    class Meta:
        model = Message
        fields = [
            "id", "conversation", "sender", "sender_name", "recipient",
            "content", "is_read", "created_at",
        ]
        read_only_fields = ["id", "sender", "is_read", "created_at"]
        def to_representation(self, instance):
            print("=== SERIALIZING ===", instance.id)
            return super().to_representation(instance)


class ConversationSerializer(serializers.ModelSerializer):
    annonce_title = serializers.CharField(source="annonce.title", read_only=True)
    client_name = serializers.CharField(source="client.get_full_name", read_only=True)
    agent_name = serializers.CharField(source="agent.get_full_name", read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            "id", "annonce", "annonce_title", "client", "client_name",
            "agent", "agent_name", "last_message", "unread_count", "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_last_message(self, obj):
        last = obj.messages.order_by("-created_at").first()
        return MessageSerializer(last).data if last else None

    def get_unread_count(self, obj):
        return 0


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id", "notification_type", "title", "body", "link", "is_read", "created_at",
        ]
        read_only_fields = ["id", "created_at"]
