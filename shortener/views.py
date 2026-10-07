from django.shortcuts import get_object_or_404, redirect
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import URL
from .serializers import URLSerializer
from .utils import encode_base62
from django.conf import settings

from rest_framework.permissions import IsAuthenticated


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
                "short_code": url.short_code,
                "short_url": f"{settings.BASE_URL}/{url.short_code}",
                "original_url": url.original_url,
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