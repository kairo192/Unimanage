# Security Hardening Guide

## Secrets Management

All secrets are loaded from environment variables only.
NEVER commit `.env` files to version control.

Required environment variables:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — 64+ hex char random string
- `OPENROUTER_API_KEY` — OpenRouter API key
- `DEFAULT_ADMIN_PASSWORD` — Initial admin password

## Rate Limiting

| Endpoint Group | Window | Max Requests |
|---------------|--------|-------------|
| `/api/login` | 15 min | 10 |
| All other `/api/*` | 15 min | 200 |

## Authentication

- JWT tokens with 7-day expiry
- Server-side session tracking in `user_sessions` table
- Session revocation on logout (server-side)
- All API routes behind `protect` middleware
- Token rejected if session is revoked

## Authorization

| Role | Access |
|------|--------|
| `admin` / `director` | Full access, user management, audit logs |
| `admissions` | Students & Rooms only |
| `maintenance` | Tickets & Housing only |
| `staff` | Configurable per-route |

## Input Validation

- Zod schema validation for passwords (min 8 chars)
- Email format validation
- All DB queries use parameterized queries (no SQL injection)
- Request body size limited to 1MB

## HTTP Security Headers

- `helmet` middleware active
- CORS restricted to allowed origins
- Content Security Policy configurable via `NODE_ENV`

## File Upload

- Avatar uploads: images only (jpeg, jpg, png, gif, webp)
- Max file size: 5MB
- Files stored in `uploads/avatars/` directory

## Logging & Audit

- All auth actions logged to `activity_logs` table
- User ID, IP address, action, and details recorded
- Request logging via `morgan`

## Recommended Production Settings

1. Set `NODE_ENV=production`
2. Set `FRONTEND_URL` to comma-separated allowed origins
3. Use strong `JWT_SECRET` (64+ random hex chars)
4. Enforce HTTPS
5. Enable CSP by removing `NODE_ENV !== 'production'` check
6. Add database connection pooler (PgBouncer) for high concurrency
