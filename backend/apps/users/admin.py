from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import FavoriteProperty, User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ("email", "username", "role", "city", "is_verified", "is_active", "created_at")
    list_filter = ("role", "is_verified", "is_active", "city")
    search_fields = ("email", "username", "first_name", "last_name", "phone")
    ordering = ("-created_at",)

    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Informations DarImmo", {
            "fields": ("phone", "role", "avatar", "city", "company_name", "is_verified"),
        }),
    )


@admin.register(FavoriteProperty)
class FavoritePropertyAdmin(admin.ModelAdmin):
    list_display = ("user", "annonce", "created_at")
    list_filter = ("created_at",)
    search_fields = ("user__email", "annonce__title")
