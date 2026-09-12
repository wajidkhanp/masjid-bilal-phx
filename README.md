# Masjid Bilal Phoenix

Website for Islamic Center of Greater Phoenix / Masjid Bilal Phoenix.

## Run locally

```sh
npm install
ADMIN_PASSWORD=your-password SESSION_SECRET=your-long-secret npm start
```

Open http://localhost:3000. The private control panel is at `/admin`.

## Railway + GitHub

1. Create a GitHub repository and push this folder.
2. In Railway, choose **New Project > Deploy from GitHub repo**.
3. Add `ADMIN_PASSWORD` and `SESSION_SECRET` under Railway Variables.
4. Railway will use `npm start`; the app listens on Railway's `PORT` automatically.

Set `NODE_ENV=production` in Railway so the admin session cookie is marked Secure. Never deploy without replacing both example secrets with strong, unique values.

Static assets (CSS, JavaScript, and images) use a five-minute cache lifetime (`Cache-Control: public, max-age=300`). HTML revalidates on each request. In Cloudflare, set **Caching > Configuration > Browser Cache TTL** to **Respect Existing Headers**, and ensure Cache Rules do not override the origin's browser or edge TTL. Deploy the change and purge previously cached assets in Cloudflare. Existing browser copies can retain their earlier four-hour lifetime until they expire or the visitor hard-refreshes.

The editable site content is stored in `data/site.json`. Railway's local filesystem is suitable for a small starter site, but add a managed database or persistent volume before running multiple instances or needing durable content backups.

The monthly adhan schedule from `images/Salat Time Table Phoenix.pdf` is stored in `data/adhan.json` and displayed through the month selector on `/timetable.html`. Iqama values remain editable from `/admin`.

## Initial content

The address and history copy come from the supplied masjid brochure and Word document. The initial iqama values are seed values and should be checked by the masjid team in `/admin` before launch.
