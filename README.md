# URL Shortener

A full-stack URL shortening application with user authentication, per-user link management, and click tracking.

## Deployed URLs

| Service | URL |
|---------|-----|
| Frontend | https://url-shortener-ten-iota-91.vercel.app |
| Backend API | https://url-shortener-backend-5tpg.onrender.com |


## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [API Reference](#api-reference)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

---

## Overview

Users register an account, log in, and can shorten arbitrary URLs. Each shortened URL is tied to the owner's account. The system tracks how many times each link has been clicked. Shortened URLs redirect anyone who visits them, regardless of whether they are logged in.

## Tech Stack

**Backend**

- Python 3 / Django 6
- Django REST Framework
- Simple JWT (access + refresh token authentication)
- PostgreSQL (via psycopg 3)
- Gunicorn (production WSGI server)
- Whitenoise (static file serving)

**Frontend**

- React 19 / TypeScript
- Vite 8
- Vanilla CSS (no UI library)

**Infrastructure**

- Backend hosted on Render (Web Service + managed PostgreSQL)
- Frontend hosted on Vercel

---

## Project Structure

```
url-shortener/
├── config/                  # Django project settings and root URL config
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── shortener/               # Core Django app
│   ├── models.py            # URL model
│   ├── views.py             # API views (register, shorten, list, delete, stats, redirect)
│   ├── serializers.py       # DRF serializers
│   ├── urls.py              # App-level URL patterns
│   └── utils.py             # Base62 encoding for short codes
├── frontend/                # React frontend
│   ├── src/
│   │   ├── api.ts           # All fetch calls to the backend
│   │   ├── types.ts         # Shared TypeScript interfaces
│   │   ├── App.tsx          # Root component, auth state
│   │   ├── index.css        # Global styles
│   │   └── components/
│   │       ├── Login.tsx    # Sign in / sign up form
│   │       ├── Dashboard.tsx
│   │       └── StatsModal.tsx
│   └── vite.config.ts
├── build.sh                 # Render build script (install, collectstatic, migrate)
├── render.yaml              # Render Blueprint (optional)
├── requirements.txt
└── manage.py
```

---

## Features

- User registration and login with JWT authentication (access token expires in 2 hours, refresh in 7 days)
- Shorten any valid URL; short codes are generated using base62 encoding of the database row ID
- Per-user URL list: users only see their own links
- Click count tracked on every redirect (anonymous users included)
- Delete any of your own links
- Stats modal per link: short URL, short code, total clicks, original URL, creation date
- Password show/hide toggle on all password fields

---

## API Reference

All endpoints are prefixed with `/api/`.

| Method | Endpoint | Auth required | Description |
|--------|----------|---------------|-------------|
| `POST` | `/api/register/` | No | Create a new user account |
| `POST` | `/api/token/` | No | Obtain access and refresh JWT tokens |
| `POST` | `/api/token/refresh/` | No | Refresh an expired access token |
| `POST` | `/api/shorten/` | Yes | Shorten a URL |
| `GET` | `/api/urls/` | Yes | List all URLs belonging to the authenticated user |
| `DELETE` | `/api/urls/<id>/` | Yes | Delete a specific URL |
| `GET` | `/api/urls/<id>/stats/` | Yes | Get stats for a specific URL |
| `GET` | `/<short_code>/` | No | Redirect to the original URL |

### Register

```
POST /api/register/
Content-Type: application/json

{
  "username": "alice",
  "password": "strongpassword",
  "confirm_password": "strongpassword"
}
```

### Obtain Token

```
POST /api/token/
Content-Type: application/json

{
  "username": "alice",
  "password": "strongpassword"
}
```

Response:

```json
{
  "access": "<jwt_access_token>",
  "refresh": "<jwt_refresh_token>"
}
```

### Shorten a URL

```
POST /api/shorten/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "url": "https://example.com/some/very/long/path"
}
```

---

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL running locally

### Backend

```bash
# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file (see Environment Variables section below)
cp .env.example .env  # or create manually

# Run migrations
python manage.py migrate

# Start the development server
python manage.py runserver
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend dev server runs on `http://localhost:5173` and proxies API calls to `http://localhost:8000` via the `VITE_API_URL` variable.

---

## Environment Variables

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | `your-secret-key-here` |
| `DEBUG` | Enable debug mode | `True` (dev) / `False` (prod) |
| `ALLOWED_HOSTS` | Comma-separated allowed hostnames | `localhost,127.0.0.1` |
| `DB_NAME` | PostgreSQL database name | `url_shortener` |
| `DB_USER` | PostgreSQL username | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `BASE_URL` | Base URL used to construct short links | `http://localhost:8000` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed CORS origins (production) | `https://your-app.vercel.app` |

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend base URL | `https://your-backend.onrender.com` |

If `VITE_API_URL` is not set, the frontend falls back to `http://localhost:8000`.

---

## Deployment

### Backend — Render

1. Create a **PostgreSQL** database on Render (free tier). Note the connection credentials.
2. Create a **Web Service** on Render pointing to this repository.
   - **Runtime:** Python
   - **Build Command:** `./build.sh`
   - **Start Command:** `gunicorn config.wsgi:application`
3. Set the following environment variables in the Render dashboard:

   | Key | Value |
   |-----|-------|
   | `SECRET_KEY` | A long random string |
   | `DEBUG` | `False` |
   | `ALLOWED_HOSTS` | Your Render service hostname |
   | `BASE_URL` | `https://<your-service>.onrender.com` |
   | `CORS_ALLOWED_ORIGINS` | Your Vercel frontend URL |
   | `DB_NAME` | From Render PostgreSQL dashboard |
   | `DB_USER` | From Render PostgreSQL dashboard |
   | `DB_PASSWORD` | From Render PostgreSQL dashboard |
   | `DB_HOST` | From Render PostgreSQL dashboard |
   | `DB_PORT` | `5432` |

4. Deploy. The `build.sh` script runs `collectstatic` and `migrate` automatically on each deploy.

> The free tier database on Render expires after 90 days. Upgrade to a paid plan to retain data beyond that.

### Frontend — Vercel

1. Import the repository on [vercel.com](https://vercel.com).
2. Set the **Root Directory** to `frontend`.
3. Add the environment variable:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://<your-backend>.onrender.com` |

4. Deploy. Vercel auto-detects Vite and configures the build accordingly.

### First-time user

After deploying the backend for the first time, create a user account through the `/register` endpoint or directly from the app's Sign Up screen.
