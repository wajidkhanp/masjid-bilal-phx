const menuButton = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('#site-nav');

if (menuButton && siteNav) {
  menuButton.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  siteNav.addEventListener('click', (event) => {
    if (event.target.matches('a')) {
      siteNav.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
    }
  });
}

const iqamaBubble = document.querySelector('.next-iqama');

function nextIqama(site, now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Phoenix', month: 'long', day: 'numeric',
    hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
  }).formatToParts(now).map(({ type, value }) => [type, value]));
  const currentMinutes = Number(parts.hour) * 60 + Number(parts.minute);
  const today = site.adhanSchedule?.[parts.month]?.find((day) => day.day === Number(parts.day));
  const prayers = (site.times || []).flatMap((prayer) => {
    const sunset = prayer.name === 'Maghrib' && /^at sunset$/i.test(prayer.iqama.trim());
    const value = sunset ? today?.maghrib : prayer.iqama;
    const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(value?.trim() || '');
    if (!match) return [];
    let hour = Number(match[1]);
    const minute = Number(match[2]);
    const period = match[3]?.toUpperCase() || (sunset ? 'PM' : null);
    if (!period || hour < 1 || hour > 12 || minute > 59) return [];
    const label = `${hour}:${match[2]} ${period}`;
    hour = hour % 12 + (period === 'PM' ? 12 : 0);
    return [{ name: prayer.name, label, minutes: hour * 60 + minute }];
  }).sort((a, b) => a.minutes - b.minutes);
  const upcoming = prayers.find((prayer) => prayer.minutes > currentMinutes);
  if (upcoming) return { ...upcoming, tomorrow: false };
  const fajr = prayers.find((prayer) => prayer.name === 'Fajr');
  return fajr ? { ...fajr, tomorrow: true } : null;
}

if (iqamaBubble) {
  async function refreshIqama() {
    try {
      const response = await fetch('/api/site', { cache: 'no-store' });
      if (!response.ok) throw new Error('Could not load prayer times');
      const prayer = nextIqama(await response.json());
      iqamaBubble.hidden = !prayer;
      if (prayer) {
        iqamaBubble.querySelector('.next-iqama-time').textContent =
          `${prayer.name} · ${prayer.label}${prayer.tomorrow ? ' tomorrow' : ''}`;
      }
    } catch {
      iqamaBubble.hidden = true;
    }
  }
  refreshIqama();
  setInterval(refreshIqama, 60000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshIqama();
  });
}
