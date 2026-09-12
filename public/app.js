const prayerKeys = ['fajr', 'shuruq', 'dhuhr', 'asr', 'maghrib', 'isha'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const prayerThumbnails = { Fajr: 'time-fajr.svg', Dhuhr: 'time-dhuhr.svg', Asr: 'time-asr.svg', Maghrib: 'time-maghrib.svg', Isha: 'time-isha.svg' };

function getTodayAdhan(site) {
  const today = new Date();
  const month = site.adhanSchedule?.[monthNames[today.getMonth()]] || [];
  return month.find((day) => day.day === today.getDate()) || month[0];
}

function renderHome(site) {
  const timeGrid = document.querySelector('#time-grid');
  if (!timeGrid) return;
  const today = getTodayAdhan(site);
  const heading = document.createElement('div');
  heading.className = 'daily-table-heading';
  ['', 'Prayer', 'Adhan', 'Iqama'].forEach((label) => {
    const cell = document.createElement('span');
    cell.textContent = label;
    heading.append(cell);
  });
  timeGrid.replaceChildren(heading);
  site.times.forEach((time) => {
    const card = document.createElement('div');
    card.className = 'time-card';
    card.innerHTML = `<img src="/assets/${prayerThumbnails[time.name]}" alt="${time.name} time of day"><span>${time.name}</span><strong></strong><em></em>`;
    card.querySelector('strong').textContent = today?.[time.name.toLowerCase()] || time.adhan || '—';
    card.querySelector('em').textContent = time.iqama;
    timeGrid.append(card);
  });
}

function getPhoenixDate() {
  return Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Phoenix', month: 'long', day: 'numeric'
  }).formatToParts(new Date()).map(({ type, value }) => [type, value]));
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
  const today = getPhoenixDate();
  (site.adhanSchedule?.[monthName] || []).forEach((day) => {
    const row = document.createElement('div');
    row.className = 'monthly-row';
    if (monthName === today.month && Number(day.day) === Number(today.day)) {
      row.classList.add('is-today');
      row.setAttribute('aria-current', 'date');
    }
    [day.day, ...prayerKeys.map((key) => day[key])].forEach((value, index) => {
      const cell = document.createElement('span');
      cell.textContent = value;
      if (index === 0 && row.classList.contains('is-today')) {
        const label = document.createElement('small');
        label.className = 'today-label';
        label.textContent = 'Today';
        cell.append(label);
      }
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
  const currentMonth = getPhoenixDate().month;
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
