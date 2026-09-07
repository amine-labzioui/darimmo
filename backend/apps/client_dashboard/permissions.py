"""
Permissions — Tableau de bord Client DarImmo
"""

from rest_framework import permissions


class IsRequestOwner(permissions.BasePermission):
    """Le client ne peut voir/modifier que ses propres demandes."""

    def has_object_permission(self, request, view, obj):
        return obj.client == request.user
