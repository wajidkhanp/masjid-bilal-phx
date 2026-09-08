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

The editable site content is stored in `data/site.json`. Railway's local filesystem is suitable for a small starter site, but add a managed database or persistent volume before running multiple instances or needing durable content backups.

## Initial content

The address and history copy come from the supplied masjid brochure and Word document. The initial iqama values are seed values and should be checked by the masjid team in `/admin` before launch.