from django.contrib.auth.models import User
from django.db import models


class URL(models.Model):
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="urls"
    )
    original_url = models.URLField()
    short_code = models.CharField(max_length=10, unique=True)
    click_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.short_code