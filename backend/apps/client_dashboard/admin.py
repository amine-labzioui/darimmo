from django.contrib import admin

from .models import ClientProfile, SavedSearch, VisitRequest


@admin.register(ClientProfile)
class ClientProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "budget_range", "is_looking_to_buy", "is_looking_to_rent")
    search_fields = ("user__email",)


@admin.register(VisitRequest)
class VisitRequestAdmin(admin.ModelAdmin):
    list_display = ("client", "annonce", "requested_date", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("client__email", "annonce__title")


@admin.register(SavedSearch)
class SavedSearchAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "city", "property_type", "notify_by_email")
    search_fields = ("name", "user__email")
