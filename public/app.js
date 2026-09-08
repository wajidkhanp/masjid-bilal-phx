async function loadSite() {
  const response = await fetch('/api/site');
  const site = await response.json();
  const timeGrid = document.querySelector('#time-grid');
  const fullTimes = document.querySelector('#full-times');
  if (timeGrid) site.times.forEach((time) => {
    const card = document.createElement('div');
    card.className = 'time-card';
    card.innerHTML = `<span>${time.name}</span><strong></strong>`;
    card.querySelector('strong').textContent = time.iqama;
    timeGrid.append(card);
  });
  if (fullTimes) site.times.forEach((time, index) => {
    const row = document.createElement('div');
    row.className = 'time-row';
    row.innerHTML = `<span class="time-index">0${index + 1}</span><strong>${time.name}</strong><span></span>`;
    row.querySelector('span:last-child').textContent = time.iqama;
    fullTimes.append(row);
  });
  const announcement = document.querySelector('#announcement');
  if (announcement && site.announcements.length) {
    announcement.hidden = false;
    site.announcements.forEach((line) => {
      const paragraph = document.createElement('p');
      paragraph.textContent = line;
      document.querySelector('#announcement-lines').append(paragraph);
    });
  }
}
loadSite().catch(() => {});