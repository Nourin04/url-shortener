from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import URLSerializer
from .utils import encode_base62


class ShortenURLView(APIView):

    def post(self, request):
        serializer = URLSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        url = serializer.save()

        short_code = encode_base62(url.id)

        url.short_code = short_code
        url.save(update_fields=["short_code"])

        return Response(
            {
                "short_code": url.short_code,
                "short_url": f"http://localhost:8000/{url.short_code}",
                "original_url": url.original_url,
                "created_at": url.created_at,
            },
            status=status.HTTP_201_CREATED
        )