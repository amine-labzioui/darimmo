from django.contrib import admin

from .models import AIConversation, AIMessage, AIRecommendation


class AIMessageInline(admin.TabularInline):
    model = AIMessage
    extra = 0
    readonly_fields = ("sender", "content", "metadata", "created_at")


class AIRecommendationInline(admin.TabularInline):
    model = AIRecommendation
    extra = 0
    readonly_fields = ("annonce", "relevance_score", "was_clicked", "created_at")


@admin.register(AIConversation)
class AIConversationAdmin(admin.ModelAdmin):
    list_display = ("session_id", "user", "started_at", "last_activity_at")
    search_fields = ("session_id", "user__email")
    inlines = [AIMessageInline, AIRecommendationInline]


@admin.register(AIMessage)
class AIMessageAdmin(admin.ModelAdmin):
    list_display = ("conversation", "sender", "created_at")
    list_filter = ("sender",)
    search_fields = ("content",)


@admin.register(AIRecommendation)
class AIRecommendationAdmin(admin.ModelAdmin):
    list_display = ("conversation", "annonce", "relevance_score", "was_clicked", "created_at")
    list_filter = ("was_clicked",)
