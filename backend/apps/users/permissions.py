"""
Permissions personnalisées — Utilisateurs DarImmo
"""

from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """Autorise uniquement le propriétaire de l'objet."""

    def has_object_permission(self, request, view, obj):
        owner = getattr(obj, "user", None) or getattr(obj, "owner", None)
        return owner == request.user


class IsAgence(permissions.BasePermission):
    """Autorise uniquement les comptes de type agence."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == "agence"
        )


class IsAdminRole(permissions.BasePermission):
    """Autorise uniquement les administrateurs (rôle métier, pas is_staff)."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.role == "admin" or request.user.is_staff)
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """Le propriétaire OU un admin peut modifier/supprimer."""

    def has_object_permission(self, request, view, obj):
        if request.user.role == "admin" or request.user.is_staff:
            return True
        owner = getattr(obj, "user", None) or getattr(obj, "owner", None)
        return owner == request.user
