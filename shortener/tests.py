from django.contrib.auth.models import User
from django.test import SimpleTestCase
from rest_framework import status
from rest_framework.test import APITestCase

from .models import URL
from .utils import encode_base62


class Base62Tests(SimpleTestCase):

    def test_zero(self):
        self.assertEqual(encode_base62(0), "0")

    def test_single_digit(self):
        self.assertEqual(encode_base62(1), "1")

    def test_upper_boundary(self):
        self.assertEqual(encode_base62(61), "Z")

    def test_base62_boundary(self):
        self.assertEqual(encode_base62(62), "10")

    def test_larger_number(self):
        self.assertEqual(encode_base62(125), "21")

    def test_large_number(self):
        self.assertEqual(encode_base62(1000), "g8")


class ShortenURLAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="shorten_user",
            password="testpassword123"
        )
        self.client.force_authenticate(user=self.user)

    def test_create_short_url(self):
        response = self.client.post(
            "/api/shorten/",
            {
                "url": "https://example.com"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertIn("short_code", response.data)
        self.assertIn("short_url", response.data)
        self.assertEqual(
            response.data["original_url"],
            "https://example.com"
        )

        self.assertEqual(URL.objects.count(), 1)

    def test_invalid_url(self):
        response = self.client.post(
            "/api/shorten/",
            {
                "url": "not-a-url"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.assertEqual(URL.objects.count(), 0)

    def test_missing_url(self):
        response = self.client.post(
            "/api/shorten/",
            {},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        self.assertEqual(URL.objects.count(), 0)

    def test_same_url_creates_different_short_codes(self):
        data = {
            "url": "https://example.com"
        }

        response1 = self.client.post(
            "/api/shorten/",
            data,
            format="json"
        )

        response2 = self.client.post(
            "/api/shorten/",
            data,
            format="json"
        )

        self.assertEqual(
            response1.status_code,
            status.HTTP_201_CREATED
        )

        self.assertEqual(
            response2.status_code,
            status.HTTP_201_CREATED
        )

        self.assertNotEqual(
            response1.data["short_code"],
            response2.data["short_code"]
        )

        self.assertEqual(
            URL.objects.count(),
            2
        )


class RedirectURLAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="redirect_user",
            password="testpassword123"
        )
        self.url = URL.objects.create(
            owner=self.user,
            original_url="https://example.com",
            short_code="abc123"
        )

    def test_redirect_existing_short_url(self):
        response = self.client.get("/abc123/")

        self.assertEqual(
            response.status_code,
            status.HTTP_302_FOUND
        )

        self.assertEqual(
            response["Location"],
            "https://example.com"
        )

    def test_redirect_nonexistent_short_url(self):
        response = self.client.get("/doesnotexist/")

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )


class ClickAnalyticsTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="analytics_user",
            password="testpassword123"
        )

        self.url = URL.objects.create(
            owner=self.user,
            original_url="https://example.com",
            short_code="analytics1"
        )

    def test_redirect_increments_click_count(self):
        self.assertEqual(self.url.click_count, 0)

        response = self.client.get("/analytics1/")

        self.assertEqual(
            response.status_code,
            status.HTTP_302_FOUND
        )

        self.url.refresh_from_db()

        self.assertEqual(
            self.url.click_count,
            1
        )

    def test_multiple_clicks_increment_count(self):
        self.client.get("/analytics1/")
        self.client.get("/analytics1/")
        self.client.get("/analytics1/")

        self.url.refresh_from_db()

        self.assertEqual(
            self.url.click_count,
            3
        )

    def test_user_can_view_own_stats(self):
        self.client.force_authenticate(
            user=self.user
        )

        response = self.client.get(
            f"/api/urls/{self.url.id}/stats/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            response.data["click_count"],
            0
        )