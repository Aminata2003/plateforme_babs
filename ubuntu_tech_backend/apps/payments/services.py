"""
Intégration PayTech (https://docs.intech.sn/doc_paytech.php).
Couvre Wave, Orange Money, Free Money et Carte Bancaire via un compte PayTech unique.
"""
import hashlib
import hmac
import json

import requests
from django.conf import settings


class PaytechService:
    BASE_URL = "https://paytech.sn/api"

    @staticmethod
    def request_payment(item_name, item_price, ref_command, custom_field=None, target_payment=""):
        """
        Initie une demande de paiement et renvoie la réponse PayTech
        (contient notamment `redirect_url` et `token` si succès).
        """
        payload = {
            "item_name": item_name,
            "item_price": item_price,
            "currency": "XOF",
            "ref_command": ref_command,
            "command_name": item_name,
            "env": settings.PAYTECH_ENV,
            "target_payment": target_payment,
            "ipn_url": settings.PAYTECH_IPN_URL,
            "success_url": settings.PAYTECH_SUCCESS_URL,
            "cancel_url": settings.PAYTECH_CANCEL_URL,
            "custom_field": json.dumps(custom_field or {}),
        }
        headers = {
            "API_KEY": settings.PAYTECH_API_KEY,
            "API_SECRET": settings.PAYTECH_API_SECRET,
        }
        try:
            response = requests.post(
                f"{PaytechService.BASE_URL}/payment/request-payment",
                json=payload, headers=headers, timeout=15,
            )
            return response.json()
        except requests.exceptions.RequestException as exc:
            return {"success": 0, "message": str(exc)}

    @staticmethod
    def verify_ipn(post_data):
        """
        Vérifie l'authenticité d'une notification IPN PayTech.
        Priorité à la vérification HMAC-SHA256 (recommandée par PayTech) ;
        repli sur la vérification par hachage SHA256 des clés API si le champ hmac_compute est absent.
        """
        hmac_received = post_data.get("hmac_compute")

        if hmac_received:
            item_price = post_data.get("final_item_price") or post_data.get("item_price", "")
            ref_command = post_data.get("ref_command", "")
            message = f"{item_price}|{ref_command}|{settings.PAYTECH_API_KEY}"
            expected_hmac = hmac.new(
                settings.PAYTECH_API_SECRET.encode(), message.encode(), hashlib.sha256,
            ).hexdigest()
            return hmac.compare_digest(expected_hmac, hmac_received)

        api_key_sha256 = post_data.get("api_key_sha256", "")
        api_secret_sha256 = post_data.get("api_secret_sha256", "")
        expected_key = hashlib.sha256(settings.PAYTECH_API_KEY.encode()).hexdigest()
        expected_secret = hashlib.sha256(settings.PAYTECH_API_SECRET.encode()).hexdigest()
        return expected_key == api_key_sha256 and expected_secret == api_secret_sha256