from django.urls import path

from .views import (
    RedirectURLView,
    ShortenURLView,
    URLStatsView,
    UserURLListView,
    UserURLDetailView,
)

urlpatterns = [
    path("shorten/", ShortenURLView.as_view(), name="shorten-url"),
    path("urls/", UserURLListView.as_view(), name="user-urls"),
    path(
        "urls/<int:pk>/",
        UserURLDetailView.as_view(),
        name="user-url-detail"
    ),
    path(
        "urls/<int:pk>/stats/",
        URLStatsView.as_view(),
        name="url-stats"
    ),
]