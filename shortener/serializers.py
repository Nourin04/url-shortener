from rest_framework import serializers

from .models import URL


class URLSerializer(serializers.ModelSerializer):
    url = serializers.URLField(source="original_url")

    class Meta:
        model = URL
        fields = [
            "id",
            "url",
            "short_code",
            "click_count",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "short_code",
            "click_count",
            "created_at",
        ]