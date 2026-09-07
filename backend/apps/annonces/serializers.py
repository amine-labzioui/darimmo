"""
Serializers — Annonces DarImmo
"""

from rest_framework import serializers

from .models import Annonce, AnnonceImage


class AnnonceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnonceImage
        fields = ["id", "image", "is_primary", "order"]


"""
Serializers — Annonces DarImmo
"""

from rest_framework import serializers

from .models import Annonce, AnnonceImage


class AnnonceImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnonceImage
        fields = ["id", "image", "is_primary", "order"]


class AnnonceListSerializer(serializers.ModelSerializer):
    """Version allégée pour les listes / résultats de recherche (cartes)."""

    

    main_image = serializers.SerializerMethodField()
    owner_name = serializers.CharField(source="owner.get_full_name", read_only=True)

    # ===== AJOUT =====
    boosted_until = serializers.DateTimeField(read_only=True)
    # =================

    class Meta:
        model = Annonce
        fields = [
            "id",
            "title",
            "property_type",
            "transaction_type",
            "status",
            "city",
            "neighborhood",
            "price",
            "surface",
            "bedrooms",
            "bathrooms",
            "is_featured",
            "is_boosted",
            "boosted_until",
            "main_image",
            "owner_name",
            "created_at",
            "views_count",
        ]

    def get_main_image(self, obj):
        request = self.context.get("request")
        if obj.main_image and request:
            return request.build_absolute_uri(obj.main_image)
        return obj.main_image


class AnnonceDetailSerializer(serializers.ModelSerializer):
    """Version complète pour la page détail d'une annonce."""

    images = AnnonceImageSerializer(many=True, read_only=True)
    owner_name = serializers.CharField(source="owner.get_full_name", read_only=True)
    owner_phone = serializers.CharField(source="owner.phone", read_only=True)
    owner_email = serializers.EmailField(source="owner.email", read_only=True)

    # ===== AJOUT =====
    boosted_until = serializers.DateTimeField(read_only=True)
    # =================

    class Meta:
        model = Annonce
        fields = [
            "id",
            "title",
            "description",
            "property_type",
            "transaction_type",
            "status",
            "city",
            "neighborhood",
            "address",
            "latitude",
            "longitude",
            "price",
            "surface",
            "bedrooms",
            "bathrooms",
            "has_parking",
            "has_pool",
            "has_garden",
            "is_furnished",
            "is_featured",
            "is_boosted",
            "boosted_until",
            "views_count",
            "images",
            "owner",
            "owner_name",
            "owner_phone",
            "owner_email",
            "created_at",
            "updated_at",
            "published_at",
        ]

        read_only_fields = [
            "id",
            "owner",
            "views_count",
            "created_at",
            "updated_at",
            "published_at",
            "boosted_until",
        ]


class AnnonceCreateUpdateSerializer(serializers.ModelSerializer):
    """Création / édition d'une annonce par son propriétaire."""

    uploaded_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Annonce
        fields = [
            "id",
            "title",
            "description",
            "property_type",
            "transaction_type",
            "city",
            "neighborhood",
            "address",
            "latitude",
            "longitude",
            "price",
            "surface",
            "bedrooms",
            "bathrooms",
            "has_parking",
            "has_pool",
            "has_garden",
            "is_furnished",
            "uploaded_images",
        ]

    def create(self, validated_data):
        images = validated_data.pop("uploaded_images", [])
        validated_data["owner"] = self.context["request"].user

        annonce = Annonce.objects.create(**validated_data)

        for idx, img in enumerate(images):
            AnnonceImage.objects.create(
                annonce=annonce,
                image=img,
                is_primary=(idx == 0),
                order=idx,
            )

        return annonce

    def update(self, instance, validated_data):
        images = validated_data.pop("uploaded_images", [])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        for idx, img in enumerate(images):
            AnnonceImage.objects.create(
                annonce=instance,
                image=img,
                is_primary=(idx == 0 and not instance.images.exists()),
                order=instance.images.count() + idx,
            )

        return instance


class AnnonceDetailSerializer(serializers.ModelSerializer):
    """Version complète pour la page détail d'une annonce."""

    images = AnnonceImageSerializer(many=True, read_only=True)
    owner_name = serializers.CharField(source="owner.get_full_name", read_only=True)
    owner_phone = serializers.CharField(source="owner.phone", read_only=True)
    owner_email = serializers.EmailField(source="owner.email", read_only=True)

    # ===== AJOUT =====
    boosted_until = serializers.DateTimeField(read_only=True)
    # =================

    class Meta:
        model = Annonce
        fields = [
            "id",
            "title",
            "description",
            "property_type",
            "transaction_type",
            "status",
            "city",
            "neighborhood",
            "address",
            "latitude",
            "longitude",
            "price",
            "surface",
            "bedrooms",
            "bathrooms",
            "views_count",
            "has_parking",
            "has_pool",
            "has_garden",
            "is_furnished",
            "is_featured",
            "is_boosted",
            "boosted_until",
            "views_count",
            "images",
            "owner",
            "owner_name",
            "owner_phone",
            "owner_email",
            "created_at",
            "updated_at",
            "published_at",
            
        ]

        read_only_fields = [
            "id",
            "owner",
            "views_count",
            "created_at",
            "updated_at",
            "published_at",
            "boosted_until",
        ]


class AnnonceCreateUpdateSerializer(serializers.ModelSerializer):
    """Création / édition d'une annonce par son propriétaire."""

    uploaded_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Annonce
        fields = [
            "id",
            "title",
            "description",
            "property_type",
            "transaction_type",
            "city",
            "neighborhood",
            "address",
            "latitude",
            "longitude",
            "price",
            "surface",
            "bedrooms",
            "bathrooms",
            "has_parking",
            "has_pool",
            "has_garden",
            "is_furnished",
            "uploaded_images",
        ]

    def create(self, validated_data):
        images = validated_data.pop("uploaded_images", [])
        validated_data["owner"] = self.context["request"].user

        annonce = Annonce.objects.create(**validated_data)

        for idx, img in enumerate(images):
            AnnonceImage.objects.create(
                annonce=annonce,
                image=img,
                is_primary=(idx == 0),
                order=idx,
            )

        return annonce

    def update(self, instance, validated_data):
        images = validated_data.pop("uploaded_images", [])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        for idx, img in enumerate(images):
            AnnonceImage.objects.create(
                annonce=instance,
                image=img,
                is_primary=(idx == 0 and not instance.images.exists()),
                order=instance.images.count() + idx,
            )

        return instance