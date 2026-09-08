const loginPanel = document.querySelector('#login-panel');
const adminPanel = document.querySelector('#admin-panel');
const loginMessage = document.querySelector('#login-message');
const saveMessage = document.querySelector('#save-message');
let site;

function showAdmin(data) {
  site = data;
  loginPanel.hidden = true;
  adminPanel.hidden = false;
  document.querySelector('#time-fields').innerHTML = site.times.map((time, index) => `<label>${time.name}<input data-time-index="${index}" value="${time.iqama}" required></label>`).join('');
  document.querySelector('#announcement-1').value = site.announcements[0] || '';
  document.querySelector('#announcement-2').value = site.announcements[1] || '';
}

async function loadAdmin() { const response = await fetch('/api/site'); if (response.ok) showAdmin(await response.json()); }
document.querySelector('#login-form').addEventListener('submit', async (event) => { event.preventDefault(); const response = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: document.querySelector('#password').value }) }); if (!response.ok) { loginMessage.textContent = 'Incorrect password.'; return; } loginMessage.textContent = ''; await loadAdmin(); });
document.querySelector('#content-form').addEventListener('submit', async (event) => { event.preventDefault(); const times = [...document.querySelectorAll('[data-time-index]')].map((input, index) => ({ name: site.times[index].name, iqama: input.value })); const announcements = [document.querySelector('#announcement-1').value, document.querySelector('#announcement-2').value].map((line) => line.trim()).filter(Boolean); const response = await fetch('/api/site', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ times, announcements }) }); saveMessage.textContent = response.ok ? 'Saved.' : 'Could not save changes.'; });
document.querySelector('#logout').addEventListener('click', async () => { await fetch('/api/logout', { method: 'POST' }); adminPanel.hidden = true; loginPanel.hidden = false; });