const prayerKeys = ['fajr', 'shuruq', 'dhuhr', 'asr', 'maghrib', 'isha'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getTodayAdhan(site) {
  const today = new Date();
  const month = site.adhanSchedule?.[monthNames[today.getMonth()]] || [];
  return month.find((day) => day.day === today.getDate()) || month[0];
}

function renderHome(site) {
  const timeGrid = document.querySelector('#time-grid');
  if (!timeGrid) return;
  const today = getTodayAdhan(site);
  site.times.forEach((time) => {
    const card = document.createElement('div');
    card.className = 'time-card';
    card.innerHTML = `<span>${time.name}</span><small>Adhan</small><strong></strong><em>Iqama</em>`;
    card.querySelector('strong').textContent = today?.[time.name.toLowerCase()] || time.adhan || '—';
    timeGrid.append(card);
  });
}

function renderMonthlyTable(site, monthName) {
  const table = document.querySelector('#monthly-times');
  if (!table) return;
  table.replaceChildren();
  const header = document.createElement('div');
  header.className = 'monthly-row monthly-header';
  ['Day', 'Fajr', 'Shuruq', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].forEach((label) => {
    const cell = document.createElement('span');
    cell.textContent = label;
    header.append(cell);
  });
  table.append(header);
  (site.adhanSchedule?.[monthName] || []).forEach((day) => {
    const row = document.createElement('div');
    row.className = 'monthly-row';
    [day.day, ...prayerKeys.map((key) => day[key])].forEach((value) => {
      const cell = document.createElement('span');
      cell.textContent = value;
      row.append(cell);
    });
    table.append(row);
  });
}

function renderTimetable(site) {
  const selector = document.querySelector('#month-select');
  if (!selector) return;
  monthNames.forEach((month) => {
    const option = document.createElement('option');
    option.value = month;
    option.textContent = month;
    selector.append(option);
  });
  const currentMonth = monthNames[new Date().getMonth()];
  selector.value = currentMonth;
  renderMonthlyTable(site, currentMonth);
  selector.addEventListener('change', () => renderMonthlyTable(site, selector.value));
}

function renderAnnouncements(site) {
  const announcement = document.querySelector('#announcement');
  if (!announcement || !site.announcements.length) return;
  announcement.hidden = false;
  const lines = document.querySelector('#announcement-lines');
  site.announcements.forEach((line) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = line;
    lines.append(paragraph);
  });
}

async function loadSite() {
  const response = await fetch('/api/site');
  const site = await response.json();
  renderHome(site);
  renderTimetable(site);
  renderAnnouncements(site);
}

loadSite().catch(() => {});