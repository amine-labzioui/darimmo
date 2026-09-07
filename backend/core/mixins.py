from decimal import Decimal
from bson.decimal128 import Decimal128


class Decimal128Mixin:
    """
    Convertit automatiquement tous les Decimal128 MongoDB
    vers decimal.Decimal.
    """

    def normalize_decimal128(self):
        for field in self._meta.fields:
            value = getattr(self, field.name)

            if isinstance(value, Decimal128):
                setattr(self, field.name, value.to_decimal())

    def save(self, *args, **kwargs):
        self.normalize_decimal128()
        return super().save(*args, **kwargs)