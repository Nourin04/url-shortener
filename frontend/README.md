# Frontend

React + TypeScript frontend for the URL Shortener project.

See the root [README](../README.md) for full project documentation, local setup, and deployment instructions.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Output goes to `dist/`. This directory is what Vercel serves in production.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend base URL (defaults to `http://localhost:8000` if not set) |
