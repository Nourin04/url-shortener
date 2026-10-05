from rest_framework import serializers

from .models import URL


class URLSerializer(serializers.ModelSerializer):
    url = serializers.URLField(source="original_url")

    class Meta:
        model = URL
        fields = ["url", "short_code", "created_at"]
        read_only_fields = ["short_code", "created_at"]