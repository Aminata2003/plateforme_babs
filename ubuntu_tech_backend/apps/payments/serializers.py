from rest_framework import serializers

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id", "ref_command", "token", "item_name", "amount",
            "payment_method", "status", "redirect_url", "created_at", "paid_at",
        ]
        read_only_fields = fields


class InitiatePaymentSerializer(serializers.Serializer):
    item_name = serializers.CharField(max_length=200)
    amount = serializers.IntegerField(min_value=1)
    target_payment = serializers.CharField(
        max_length=100, required=False, allow_blank=True,
        help_text='"Wave", "Orange Money", "Free Money", "Carte Bancaire" ou vide pour toutes les méthodes',
    )