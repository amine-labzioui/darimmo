from django.contrib import admin

from .models import BoostPlan, Transaction


@admin.register(BoostPlan)
class BoostPlanAdmin(admin.ModelAdmin):
    list_display = ("name", "duration_days", "price", "is_active")
    list_editable = ("is_active",)


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ("user", "annonce", "provider", "amount", "status", "created_at")
    list_filter = ("provider", "status")
    search_fields = ("user__email", "provider_reference")
    readonly_fields = ("created_at", "updated_at")
