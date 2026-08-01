from django.contrib import admin

from .models import LiveSession, SessionRegistration

admin.site.register(LiveSession)
admin.site.register(SessionRegistration)