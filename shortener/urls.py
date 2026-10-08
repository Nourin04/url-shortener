from django.urls import path

from .views import (
    RedirectURLView,
    RegisterView,
    ShortenURLView,
    URLStatsView,
    UserURLListView,
    UserURLDetailView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
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