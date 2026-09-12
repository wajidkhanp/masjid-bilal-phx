const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const dataPath = path.join(__dirname, 'data', 'site.json');
const adhanPath = path.join(__dirname, 'data', 'adhan.json');
const adminPassword = process.env.ADMIN_PASSWORD;
const sessionSecret = process.env.SESSION_SECRET;

if (!adminPassword || !sessionSecret) {
  throw new Error('ADMIN_PASSWORD and SESSION_SECRET must be set before starting the server.');
}

app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '5m',
  setHeaders(res, filePath) {
    if (path.extname(filePath) === '.html') {
      res.setHeader('Cache-Control', 'public, max-age=0');
    }
  }
}));

function readSite() {
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

function readAdhan() {
  return JSON.parse(fs.readFileSync(adhanPath, 'utf8'));
}

function writeSite(site) {
  site.updatedAt = new Date().toISOString();
  fs.writeFileSync(dataPath, JSON.stringify(site, null, 2));
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function sign(value) {
  return crypto.createHmac('sha256', sessionSecret).update(value).digest('hex');
}

function isAdmin(req) {
  const token = req.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith('masjid_session='))?.split('=')[1];
  return Boolean(token && safeEqual(token, sign('admin')));
}

function requireAdmin(req, res, next) {
  if (!isAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

app.get('/api/site', (req, res) => res.json({ ...readSite(), adhanSchedule: readAdhan() }));

app.post('/api/login', (req, res) => {
  if (!req.body?.password || !safeEqual(req.body.password, adminPassword)) {
    return res.status(401).json({ error: 'Incorrect password' });
  }
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `masjid_session=${sign('admin')}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${secure}`);
  res.json({ ok: true });
});

app.post('/api/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'masjid_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
  res.json({ ok: true });
});

app.put('/api/site', requireAdmin, (req, res) => {
  const times = Array.isArray(req.body?.times) ? req.body.times.slice(0, 5).map((item) => ({
    name: String(item.name || '').slice(0, 20),
    arabic: String(item.arabic || '').slice(0, 30),
    adhan: String(item.adhan || '').slice(0, 30),
    iqama: String(item.name || '') === 'Maghrib' ? 'At sunset' : String(item.iqama || '').slice(0, 30)
  })) : [];
  const announcements = Array.isArray(req.body?.announcements) ? req.body.announcements.slice(0, 2).map((item) => String(item || '').trim().slice(0, 120)).filter(Boolean) : [];
  if (times.length !== 5) return res.status(400).json({ error: 'Please provide all five prayer times.' });
  const currentSite = readSite();
  writeSite({ times, announcements, jumuah: currentSite.jumuah || [] });
  res.json(readSite());
});

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

app.listen(port, () => console.log(`Masjid Bilal site running on port ${port}`));
