"""
Serializers — Utilisateurs DarImmo
"""

from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import FavoriteProperty, User


class UserSerializer(serializers.ModelSerializer):
    """Lecture/édition du profil utilisateur."""

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name",
            "phone", "role", "avatar", "city", "company_name",
            "is_verified", "created_at",
        ]
        read_only_fields = ["id", "is_verified", "created_at", "role"]


class RegisterSerializer(serializers.ModelSerializer):
    """Inscription d'un nouvel utilisateur (client ou agence)."""

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username", "email", "password", "password_confirm",
            "first_name", "last_name", "phone", "role", "city", "company_name",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password_confirm"):
            raise serializers.ValidationError(
                {"password_confirm": "Les mots de passe ne correspondent pas."}
            )
        if attrs.get("role") == User.Role.ADMIN:
            raise serializers.ValidationError(
                {"role": "Impossible de créer un compte administrateur via l'inscription."}
            )
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """Connexion — retourne les tokens JWT (access + refresh)."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            request=self.context.get("request"),
            username=attrs["email"],
            password=attrs["password"],
        )
        if not user:
            raise serializers.ValidationError("Email ou mot de passe incorrect.")
        if not user.is_active:
            raise serializers.ValidationError("Ce compte a été désactivé.")

        refresh = RefreshToken.for_user(user)
        return {
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Mot de passe actuel incorrect.")
        return value


class FavoritePropertySerializer(serializers.ModelSerializer):
    annonce_title = serializers.CharField(source="annonce.title", read_only=True)
    annonce_price = serializers.DecimalField(
        source="annonce.price", max_digits=12, decimal_places=2, read_only=True
    )

    class Meta:
        model = FavoriteProperty
        fields = ["id", "annonce", "annonce_title", "annonce_price", "created_at"]
        read_only_fields = ["id", "created_at"]
