from django.urls import path

from .views import RedirectURLView, ShortenURLView


urlpatterns = [
    path("shorten/", ShortenURLView.as_view(), name="shorten-url"),
]