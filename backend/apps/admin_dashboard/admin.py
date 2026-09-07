from django.contrib import admin

from .models import ActivityLog


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ("action_type", "admin", "target_id", "created_at")
    list_filter = ("action_type", "created_at")
    search_fields = ("description", "admin__email")
    readonly_fields = ("created_at",)
