from django.contrib import admin

from .models import Annonce, AnnonceImage


class AnnonceImageInline(admin.TabularInline):
    model = AnnonceImage
    extra = 1


@admin.register(Annonce)
class AnnonceAdmin(admin.ModelAdmin):
    list_display = (
        "title", "property_type", "transaction_type", "city", "price",
        "status", "is_featured", "owner", "views_count", "created_at",
    )
    list_filter = ("status", "property_type", "transaction_type", "city", "is_featured")
    search_fields = ("title", "description", "city", "owner__email")
    list_editable = ("status", "is_featured")
    inlines = [AnnonceImageInline]
    readonly_fields = ("views_count", "created_at", "updated_at")
    actions = ["approuver_annonces", "archiver_annonces"]

    @admin.action(description="Approuver et publier les annonces sélectionnées")
    def approuver_annonces(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(status=Annonce.Status.PUBLISHED, published_at=timezone.now())
        self.message_user(request, f"{updated} annonce(s) publiée(s).")

    @admin.action(description="Archiver les annonces sélectionnées")
    def archiver_annonces(self, request, queryset):
        updated = queryset.update(status=Annonce.Status.ARCHIVED)
        self.message_user(request, f"{updated} annonce(s) archivée(s).")


@admin.register(AnnonceImage)
class AnnonceImageAdmin(admin.ModelAdmin):
    list_display = ("annonce", "is_primary", "order", "uploaded_at")
    list_filter = ("is_primary",)
