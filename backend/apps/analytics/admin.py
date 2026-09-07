from django.contrib import admin

from .models import AgencyPerformance, PropertyView, SearchLog


@admin.register(PropertyView)
class PropertyViewAdmin(admin.ModelAdmin):
    list_display = ("annonce", "user", "ip_address", "viewed_at")
    list_filter = ("viewed_at",)


@admin.register(SearchLog)
class SearchLogAdmin(admin.ModelAdmin):
    list_display = ("city", "property_type", "transaction_type", "results_count", "searched_at")
    list_filter = ("city", "property_type", "transaction_type")


@admin.register(AgencyPerformance)
class AgencyPerformanceAdmin(admin.ModelAdmin):
    list_display = ("agency", "month", "annonces_published", "total_views", "annonces_sold")
    list_filter = ("month",)
