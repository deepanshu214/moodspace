# Deploying MoodSpace

Three pieces ship independently: the **API** (container), the **web app**
(static files), and the **mobile apps** (EAS). The API has to be up first —
both clients are useless without it.

> This repository is **public**. Every secret below is supplied at runtime
> through the host's secret manager. Nothing secret goes in a tracked file,
> and nothing secret goes in the image.

---

## 0. Before the first deploy

| Thing | Why | Status |
|---|---|---|
| Un-pause the Supabase project | The API returns 503 without it | **Paused right now** — `/health` reports `database: unreachable` |
| Generate a production `SECRET_KEY` | The committed example key is compromised | **Required** — see below |
| Run `alembic upgrade head` | Adds `users.token_version`, needed for session revocation | Pending — logs everyone out once, by design |
| Decide where uploads live | Container disks are ephemeral | Unresolved — see *Known limitations* |

### `SECRET_KEY` — reuse or generate?

This one value signs every access token **and** derives the AES-256 key that
encrypts journal notes and direct messages (`backend/src/core/security.py`).
Which action is correct depends on which database production points at:

- **Pointing at the existing `moodspace` Supabase project → REUSE the key
  already in your local `.env`.** Anything encrypted in that database was
  encrypted with it. Generating a fresh key here does not "rotate" anything —
  it makes every existing journal note and message permanently unreadable,
  with no way back.
- **Starting from a brand-new, empty database → generate one:**

  ```bash
  openssl rand -hex 32
  ```

Either way: **never reuse the old committed default.** It was published in this
public repo, and the app now refuses to start if handed that value. Store
whichever key you use in the host's secret manager, never in the image, and
keep it stable from then on.

---

## 1. API

### Environment

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Supabase pooler URI (port 6543) |
| `SECRET_KEY` | yes | `openssl rand -hex 32`; app won't boot without it |
| `CORS_ORIGINS` | in prod | Comma-separated web origins. Empty = any localhost, which is dev-only behaviour |
| `MEDIA_ROOT` | recommended | Point at a mounted volume |
| `PORT` | injected | Most hosts set this; the image honours it |

### Build and run

```bash
docker build -t moodspace-api .
```

```bash
docker run --rm -p 8000:8000 --env-file .env moodspace-api
```

The `Dockerfile` at the repo root runs `uvicorn app.main:app` as a non-root
user. It works as-is on Fly.io, Render, Railway, Cloud Run and App Runner.

### Migrations

Migrations are deliberately **not** in the container `CMD` — two instances
starting at once would race on the same revision. Run them as a release step:

```bash
cd backend && alembic upgrade head
```

### Health check

Point the platform's health probe at `/health`. It returns `200` when the
database answers and `503` with `{"status":"degraded"}` when it does not, so a
database outage marks the instance unhealthy instead of serving broken reads.

---

## 2. Web app

```bash
cd frontend && npx expo export --platform web
```

Outputs static files to `frontend/dist/`, deployable to any static host
(Vercel, Netlify, Cloudflare Pages, S3+CloudFront).

Set `EXPO_PUBLIC_API_URL` to the deployed API **before building** — Expo inlines
`EXPO_PUBLIC_*` into the bundle at build time, so changing it later means
rebuilding. Then add that site's origin to the API's `CORS_ORIGINS`, or the
browser blocks every request even though the native apps are fine.

Maps need no key on web: MapLibre GL renders free CARTO basemaps.

---

## 3. Mobile apps

```bash
cd frontend && eas build --platform all --profile production
```

```bash
cd frontend && eas submit --platform all --profile production
```

Store `GOOGLE_MAPS_ANDROID_API_KEY` and `EXPO_PUBLIC_API_URL` as EAS
environment variables, not in `.env`.

- **iOS** uses Apple Maps and needs **no** key.
- **Android** still needs a Google Maps key — react-native-maps can only render
  through Google there. The Maps SDK for Android is free at any volume, but the
  project needs a billing account attached. Restrict the key to the package
  name `com.deepanshu214.moodspace` and its SHA-1, or it can be abused.

`app.json` already carries bundle IDs, permission strings and adaptive icons.
Bump `version` and let `autoIncrement` handle build numbers.

---

## Known limitations

These are real and unresolved — decide on each before taking real users.

1. **Uploads vanish on redeploy.** Photos and voice notes are written to
   `MEDIA_ROOT` on the container filesystem and served off disk. On an
   ephemeral platform every deploy wipes them. Mount a volume, or move uploads
   to object storage (S3/R2/Supabase Storage). Note this cuts both ways now
   that dissolve really deletes files: on a volume-less host the purge can only
   unlink what the current container still has.
2. **Messages are encrypted at rest, not end to end.** The server derives the
   key and can read any message. The UI says "Encrypted at rest" — keep it
   accurate if the copy changes.
3. **Android needs the Google Maps key.** Free, but it requires a billing
   account. Going fully key-free means migrating to
   `@maplibre/maplibre-react-native`, which needs a dev build.
4. **`alembic.ini` has a placeholder `sqlalchemy.url`.** The env script reads
   `DATABASE_URL`, so this is inert, but it is a trap for anyone running
   alembic by hand without the environment loaded.

---

## Privacy invariants

`backend/test_security_invariants.py` pins what the API may say about someone
who is not the caller — no email on a stranger's profile, no author id on a
cloaked bubble or an anonymous post, heatmap cells snapped to a grid rather
than raw GPS, dissolve unlinking its files, and tokens being revocable. Each
assertion corresponds to a real leak that was fixed; run it in CI:

```bash
./venv/bin/python backend/test_security_invariants.py
```

It needs no database, so it is safe to run on every push.

## Post-deploy smoke test

```bash
curl -fsS https://<api-host>/health
```

Then, against the deployed web build: register, drop a mood bubble on the map,
confirm it appears for a second account, open a conversation and send a
message. That covers auth, PostGIS, uploads and the messaging path.
