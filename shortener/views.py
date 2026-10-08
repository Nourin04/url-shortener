from django.db.models import F
from django.shortcuts import get_object_or_404, redirect
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import URL
from .serializers import URLSerializer
from .utils import encode_base62
from django.conf import settings


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username", "").strip()
        password = request.data.get("password", "")
        confirm  = request.data.get("confirm_password", "")

        if not username or not password:
            return Response(
                {"error": "Username and password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if len(password) < 8:
            return Response(
                {"error": "Password must be at least 8 characters."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if password != confirm:
            return Response(
                {"error": "Passwords do not match."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "Username already taken."},
                status=status.HTTP_400_BAD_REQUEST
            )

        User.objects.create_user(username=username, password=password)
        return Response(
            {"message": "Account created! You can now sign in."},
            status=status.HTTP_201_CREATED
        )



class ShortenURLView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = URLSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        url = serializer.save(owner=request.user)

        short_code = encode_base62(url.id)

        url.short_code = short_code
        url.save(update_fields=["short_code"])

        return Response(
            {
                "id": url.id,
                "short_code": url.short_code,
                "short_url": f"{settings.BASE_URL}/{url.short_code}",
                "original_url": url.original_url,
                "click_count": url.click_count,
                "created_at": url.created_at,
            },
            status=status.HTTP_201_CREATED
        )

class RedirectURLView(APIView):

    def get(self, request, short_code):
        url = get_object_or_404(
            URL,
            short_code=short_code
        )

        URL.objects.filter(
            id=url.id
        ).update(
            click_count=F("click_count") + 1
        )

        return redirect(url.original_url)

class UserURLListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        urls = URL.objects.filter(owner=request.user)

        serializer = URLSerializer(urls, many=True)

        return Response(serializer.data)

class UserURLDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        url = get_object_or_404(
            URL,
            id=pk,
            owner=request.user
        )

        url.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )


class URLStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        url = get_object_or_404(
            URL,
            id=pk,
            owner=request.user
        )

        return Response({
            "id": url.id,
            "short_code": url.short_code,
            "original_url": url.original_url,
            "click_count": url.click_count,
            "created_at": url.created_at,
        })