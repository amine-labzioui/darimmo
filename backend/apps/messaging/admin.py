from django.contrib import admin

from .models import Conversation, Message, Notification


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ("sender", "recipient", "content", "is_read", "created_at")


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ("annonce", "client", "agent", "created_at")
    search_fields = ("client__email", "agent__email", "annonce__title")
    inlines = [MessageInline]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("sender", "recipient", "is_read", "created_at")
    list_filter = ("is_read", "created_at")
    search_fields = ("content", "sender__email", "recipient__email")


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("user", "notification_type", "title", "is_read", "created_at")
    list_filter = ("notification_type", "is_read")
    search_fields = ("user__email", "title")
