const services = {
  'Home cleaning': { meta: 'Deep clean · from ₹699', price: '₹699', duration: '2–4 hrs' },
  'AC service': { meta: 'Deep clean · from ₹349', price: '₹349', duration: '45–90 min' },
  'TV installation': { meta: 'Wall mount · from ₹299', price: '₹299', duration: '30–60 min' },
  'Appliance repair': { meta: 'Inspection · from ₹249', price: '₹249', duration: '30–90 min' }
};

const defaultLocation = { title: 'Choose location', text: 'Use GPS or enter an address' };
const demoBookings = [
  { service: 'AC deep clean', date: 'Today', time: '3:30 – 4:00 PM', location: 'Koregaon Park', status: 'Live', expert: 'Rohan S.', rating: '4.9' },
  { service: 'Full home cleaning', date: 'Sat, 11:00 AM', time: '11:00 AM', location: 'Koregaon Park', status: 'Upcoming', expert: 'Meera K.', rating: '4.8' }
];

const drawer = document.getElementById('bookingDrawer');
const backdrop = document.getElementById('modalBackdrop');
const drawerContent = document.getElementById('drawerContent');
const successState = document.getElementById('successState');
const toast = document.getElementById('toast');
const toastText = document.getElementById('toastText');
const locationDialog = document.getElementById('locationDialog');
const locationDialogBackdrop = document.getElementById('locationDialogBackdrop');
const authDialog = document.getElementById('authDialog');
const authDialogBackdrop = document.getElementById('authDialogBackdrop');
const storedLocation = JSON.parse(localStorage.getItem('quickserveLocation') || 'null');
// Ignore locations written by the earlier demo build so an old test address cannot silently reappear.
const savedLocation = storedLocation?.source === 'manual' ? storedLocation : null;
if (storedLocation && storedLocation.source !== 'manual') localStorage.removeItem('quickserveLocation');

const draft = {
  service: 'Home cleaning', dateMode: 'today', dateLabel: 'Today', dateValue: '',
  timeMode: 'fixed', time: '3:30 – 4:00 PM', customTimeValue: '',
  locationTitle: savedLocation?.title || defaultLocation.title,
  locationText: savedLocation?.text || defaultLocation.text,
};
let authMode = 'signin';
let drawerTrigger = null;
let locationTrigger = null;
let authTrigger = null;
const calendarCursor = new Date();
calendarCursor.setDate(1);
const timeSlots = [
  { value: '08:00', label: '8:00 – 8:30 AM' },
  { value: '09:30', label: '9:30 – 10:00 AM' },
  { value: '11:00', label: '11:00 – 11:30 AM' },
  { value: '13:30', label: '1:30 – 2:00 PM' },
  { value: '15:30', label: '3:30 – 4:00 PM' },
  { value: '17:00', label: '5:00 – 5:30 PM' },
  { value: '18:30', label: '6:30 – 7:00 PM' },
  { value: '20:00', label: '8:00 – 8:30 PM' },
];

function showToast(message) {
  toastText.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('show'), 2800);
}
function getServiceDetails(service = draft.service) { return services[service] || services['Home cleaning']; }
function getTodayIso() { const date = new Date(); const offset = date.getTimezoneOffset(); return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10); }
function getTomorrowIso() { const date = new Date(); date.setDate(date.getDate() + 1); const offset = date.getTimezoneOffset(); return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10); }
function formatDateValue(value) { if (!value) return 'Pick a date'; return new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${value}T12:00:00`)); }
function formatTimeValue(value) { if (!value) return 'Pick a time'; const [hours, minutes] = value.split(':').map(Number); const date = new Date(); date.setHours(hours, minutes, 0, 0); return new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit' }).format(date); }
function makeTicketId() { const letters = 'abcdefghijklmnopqrstuvwxyz'; const segment = (length) => Array.from({ length }, () => letters[Math.floor(Math.random() * letters.length)]).join(''); return `${segment(4)}***********${segment(2)}`; }
function toIsoDate(date) { const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0'); return `${year}-${month}-${day}`; }

function renderCalendars() {
  ['drawer', 'page'].forEach((prefix) => {
    const grid = document.getElementById(`${prefix}DateGrid`);
    const label = document.getElementById(`${prefix}MonthLabel`);
    if (!grid || !label) return;
    const year = calendarCursor.getFullYear();
    const month = calendarCursor.getMonth();
    label.textContent = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(calendarCursor);
    grid.innerHTML = '';
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let index = 0; index < firstDay; index += 1) {
      const empty = document.createElement('button');
      empty.type = 'button'; empty.className = 'calendar-day empty'; empty.tabIndex = -1; empty.disabled = true; empty.setAttribute('aria-hidden', 'true');
      grid.appendChild(empty);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day);
      const value = toIsoDate(date);
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'calendar-day'; button.textContent = String(day); button.dataset.calendarDate = value;
      button.setAttribute('role', 'gridcell'); button.setAttribute('aria-label', formatDateValue(value)); button.setAttribute('aria-selected', String(draft.dateMode === 'custom' && draft.dateValue === value));
      if (value === getTodayIso()) button.classList.add('today');
      if (draft.dateMode === 'custom' && draft.dateValue === value) button.classList.add('selected');
      button.addEventListener('click', () => {
        setDraftDate('custom', value);
        document.getElementById(`${prefix}DatePanel`).hidden = true;
      });
      grid.appendChild(button);
    }
  });
  const current = new Date(); current.setDate(1);
  const isCurrentMonth = calendarCursor.getFullYear() === current.getFullYear() && calendarCursor.getMonth() === current.getMonth();
  document.getElementById('drawerPrevMonth').disabled = isCurrentMonth;
  document.getElementById('pagePrevMonth').disabled = isCurrentMonth;
}

function renderTimeChips() {
  ['drawer', 'page'].forEach((prefix) => {
    const grid = document.getElementById(`${prefix}TimeGrid`);
    if (!grid) return;
    grid.setAttribute('role', 'radiogroup');
    grid.setAttribute('aria-label', 'Available service times');
    grid.innerHTML = '';
    timeSlots.forEach((slot) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'time-chip'; button.textContent = slot.label; button.dataset.timeValue = slot.value;
      button.setAttribute('role', 'radio'); button.setAttribute('aria-checked', String(draft.timeMode === 'custom' && draft.customTimeValue === slot.value));
      if (draft.timeMode === 'custom' && draft.customTimeValue === slot.value) button.classList.add('selected');
      button.addEventListener('click', () => {
        setDraftTime('custom', slot.value);
        document.getElementById(`${prefix}TimePanel`).hidden = true;
      });
      grid.appendChild(button);
    });
  });
}

function setDraftService(service) {
  if (!services[service]) return;
  draft.service = service;
  const details = getServiceDetails();
  document.getElementById('drawerTitle').textContent = `Book ${service.toLowerCase()}`;
  document.getElementById('selectedServiceName').textContent = service;
  document.getElementById('selectedServiceMeta').textContent = details.meta;
  document.getElementById('drawerPrice').textContent = details.price;
  document.getElementById('drawerTotal').textContent = details.price;
  document.getElementById('pageSummaryService').textContent = service;
  document.getElementById('pageSummaryMeta').textContent = details.meta;
  document.getElementById('pageSummaryPrice').textContent = details.price;
  document.querySelectorAll('[data-page-service]').forEach((button) => button.classList.toggle('selected', button.dataset.pageService === service));
  document.getElementById('successServiceName').textContent = service.toLowerCase();
}

function setDraftDate(mode, value = '') {
  const previousMode = draft.dateMode;
  draft.dateMode = mode;
  if (mode === 'today') draft.dateValue = getTodayIso();
  else if (mode === 'tomorrow') draft.dateValue = getTomorrowIso();
  else if (value) draft.dateValue = value;
  else if (previousMode !== 'custom') draft.dateValue = '';
  draft.dateLabel = mode === 'today' ? 'Today' : mode === 'tomorrow' ? 'Tomorrow' : formatDateValue(draft.dateValue);
  document.querySelectorAll('.time-options, .page-date-options').forEach((group) => { group.setAttribute('role', 'radiogroup'); group.setAttribute('aria-label', 'Choose a service date'); });
  document.querySelectorAll('[data-date-option]').forEach((button) => { const selected = button.dataset.dateOption === mode; button.classList.toggle('selected', selected); button.setAttribute('role', 'radio'); button.setAttribute('aria-checked', String(selected)); button.removeAttribute('aria-pressed'); });
  document.querySelectorAll('[data-page-date]').forEach((button) => { const selected = button.dataset.pageDate === mode; button.classList.toggle('selected', selected); button.setAttribute('role', 'radio'); button.setAttribute('aria-checked', String(selected)); button.removeAttribute('aria-pressed'); });
  document.getElementById('drawerDatePanel').hidden = mode !== 'custom';
  document.getElementById('pageDatePanel').hidden = mode !== 'custom';
  if (draft.dateValue) { document.getElementById('drawerCustomDate').value = draft.dateValue; document.getElementById('pageCustomDate').value = draft.dateValue; }
  if (mode === 'custom') {
    const selected = draft.dateValue ? new Date(`${draft.dateValue}T12:00:00`) : new Date();
    calendarCursor.setFullYear(selected.getFullYear(), selected.getMonth(), 1);
  }
  const customLabel = mode === 'custom' && draft.dateValue ? draft.dateLabel : 'Pick a date';
  document.querySelectorAll('[data-page-date="custom"]').forEach((button) => { button.textContent = customLabel; });
  document.querySelectorAll('[data-date-option="custom"] strong').forEach((element) => { element.textContent = customLabel; });
  document.querySelectorAll('[data-date-option="custom"] span').forEach((element) => { element.textContent = mode === 'custom' && draft.dateValue ? 'Selected' : 'Flexible'; });
  document.getElementById('pageSummaryDate').textContent = draft.dateLabel;
  renderCalendars();
}

function setDraftTime(mode, value = '') {
  draft.timeMode = mode;
  if (mode === 'custom') { draft.customTimeValue = value || draft.customTimeValue; draft.time = formatTimeValue(draft.customTimeValue); }
  else { draft.time = value; draft.customTimeValue = ''; }
  document.querySelectorAll('.slot-options, .page-time-options').forEach((group) => { group.setAttribute('role', 'radiogroup'); group.setAttribute('aria-label', 'Choose a service time'); });
  document.querySelectorAll('[data-time-option]').forEach((button) => { const selected = button.dataset.timeOption === (mode === 'custom' ? 'custom' : value); button.classList.toggle('selected', selected); button.setAttribute('role', 'radio'); button.setAttribute('aria-checked', String(selected)); button.removeAttribute('aria-pressed'); });
  document.querySelectorAll('[data-page-time]').forEach((button) => { const selected = button.dataset.pageTime === (mode === 'custom' ? 'custom' : value); button.classList.toggle('selected', selected); button.setAttribute('role', 'radio'); button.setAttribute('aria-checked', String(selected)); button.removeAttribute('aria-pressed'); });
  document.getElementById('drawerTimePanel').hidden = mode !== 'custom';
  document.getElementById('pageTimePanel').hidden = mode !== 'custom';
  if (draft.customTimeValue) { document.getElementById('drawerCustomTime').value = draft.customTimeValue; document.getElementById('pageCustomTime').value = draft.customTimeValue; }
  const customLabel = mode === 'custom' && draft.customTimeValue ? draft.time : 'Custom time';
  document.querySelectorAll('[data-page-time="custom"]').forEach((button) => { button.textContent = customLabel; });
  document.querySelectorAll('[data-time-option="custom"]').forEach((button) => { button.textContent = customLabel; });
  document.getElementById('pageSummaryTime').textContent = draft.time;
  renderTimeChips();
}

function syncLocationUI() {
  document.getElementById('headerLocationText').textContent = draft.locationTitle;
  document.getElementById('drawerAddressTitle').textContent = draft.locationTitle;
  document.getElementById('drawerAddressText').textContent = draft.locationText;
  document.getElementById('pageAddressTitle').textContent = draft.locationTitle;
  document.getElementById('pageAddressText').textContent = draft.locationText;
  document.getElementById('pageSummaryLocation').textContent = draft.locationTitle === 'Current device location' ? 'Device GPS' : draft.locationTitle;
  document.getElementById('manualLocationInput').value = draft.locationText;
  document.getElementById('successLocation').textContent = draft.locationTitle;
}
function resetSchedule() { setDraftDate('today'); setDraftTime('fixed', '3:30 – 4:00 PM'); }

function openDrawer(service = 'Home cleaning') {
  drawerTrigger = document.activeElement;
  setDraftService(service); resetSchedule(); syncLocationUI();
  drawerContent.hidden = false; successState.hidden = true;
  document.querySelectorAll('.progress-step')[0].classList.add('active');
  drawer.classList.add('open'); backdrop.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false'); backdrop.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden';
  document.getElementById('closeDrawer').focus();
}
function closeDrawer() {
  drawer.classList.remove('open'); backdrop.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true'); backdrop.setAttribute('aria-hidden', 'true'); document.body.style.overflow = '';
  if (drawerTrigger && document.contains(drawerTrigger) && !drawerTrigger.closest('#bookingDrawer')) drawerTrigger.focus();
  drawerTrigger = null;
}
function openBookingPage(service = draft.service) {
  closeDrawer(); setDraftService(service); resetSchedule(); syncLocationUI();
  document.getElementById('pageBookingSuccess').hidden = true;
  document.getElementById('book-service').hidden = false;
  document.getElementById('book-service').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function closeBookingPage() { document.getElementById('book-service').hidden = true; document.getElementById('top').scrollIntoView({ behavior: 'smooth', block: 'start' }); }

document.querySelectorAll('[data-service]').forEach((button) => button.addEventListener('click', () => openDrawer(button.dataset.service)));
document.querySelectorAll('[data-page-service]').forEach((button) => button.addEventListener('click', () => { setDraftService(button.dataset.pageService); showToast(`${button.dataset.pageService} selected`); }));
document.getElementById('headerBookButton').addEventListener('click', () => openBookingPage('Home cleaning'));
document.getElementById('aboutBookButton').addEventListener('click', () => openBookingPage(draft.service));
document.getElementById('closeBookingPage').addEventListener('click', closeBookingPage);
document.getElementById('closeDrawer').addEventListener('click', closeDrawer);
document.getElementById('closeSuccess').addEventListener('click', closeDrawer);
document.getElementById('changeService').addEventListener('click', () => openBookingPage(draft.service));
backdrop.addEventListener('click', closeDrawer);
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeDrawer(); closeLocationDialog(); closeAuthDialog(); } });

document.querySelectorAll('[data-date-option]').forEach((button) => button.addEventListener('click', () => setDraftDate(button.dataset.dateOption)));
document.querySelectorAll('[data-page-date]').forEach((button) => button.addEventListener('click', () => setDraftDate(button.dataset.pageDate)));
document.getElementById('drawerPrevMonth').addEventListener('click', () => { calendarCursor.setMonth(calendarCursor.getMonth() - 1); renderCalendars(); });
document.getElementById('drawerNextMonth').addEventListener('click', () => { calendarCursor.setMonth(calendarCursor.getMonth() + 1); renderCalendars(); });
document.getElementById('pagePrevMonth').addEventListener('click', () => { calendarCursor.setMonth(calendarCursor.getMonth() - 1); renderCalendars(); });
document.getElementById('pageNextMonth').addEventListener('click', () => { calendarCursor.setMonth(calendarCursor.getMonth() + 1); renderCalendars(); });
document.querySelectorAll('[data-time-option]').forEach((button) => button.addEventListener('click', () => { if (button.dataset.timeOption === 'custom') setDraftTime('custom'); else setDraftTime('fixed', button.dataset.timeOption); }));
document.querySelectorAll('[data-page-time]').forEach((button) => button.addEventListener('click', () => { if (button.dataset.pageTime === 'custom') setDraftTime('custom'); else setDraftTime('fixed', button.dataset.pageTime); }));

function openLocationDialog() {
  locationTrigger = document.activeElement;
  document.getElementById('manualLocationInput').value = draft.locationText;
  locationDialog.classList.add('open'); locationDialogBackdrop.classList.add('open');
  locationDialog.setAttribute('aria-hidden', 'false'); locationDialogBackdrop.setAttribute('aria-hidden', 'false');
  document.getElementById('manualLocationInput').focus();
}
function closeLocationDialog() {
  locationDialog.classList.remove('open'); locationDialogBackdrop.classList.remove('open');
  locationDialog.setAttribute('aria-hidden', 'true'); locationDialogBackdrop.setAttribute('aria-hidden', 'true');
  if (locationTrigger && document.contains(locationTrigger) && !locationTrigger.closest('[aria-hidden="true"]')) locationTrigger.focus();
  locationTrigger = null;
}
function saveLocation(title, text, source = 'manual') {
  draft.locationTitle = title; draft.locationText = text;
  localStorage.setItem('quickserveLocation', JSON.stringify({ title, text, source, savedAt: new Date().toISOString() })); syncLocationUI(); closeLocationDialog(); showToast('Location saved for your next booking');
}
function requestCurrentLocation() {
  if (!navigator.geolocation) { showToast('GPS is not available in this browser'); return; }
  showToast('Asking for your device location permission…');
  navigator.geolocation.getCurrentPosition((position) => {
    const latitude = position.coords.latitude.toFixed(6);
    const longitude = position.coords.longitude.toFixed(6);
    saveLocation('Current device location', `Fresh GPS fix · ${latitude}, ${longitude}`, 'gps');
  }, (error) => {
    const message = error.code === 1 ? 'Location permission was denied — allow it for this site and try again' : error.code === 2 ? 'Your device location is unavailable — enter an address instead' : 'Location lookup timed out — try again';
    showToast(message);
  }, { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 });
}
document.getElementById('locationButton').addEventListener('click', openLocationDialog);
document.getElementById('addressField').addEventListener('click', openLocationDialog);
document.getElementById('pageAddressButton').addEventListener('click', openLocationDialog);
document.getElementById('drawerGpsButton').addEventListener('click', requestCurrentLocation);
document.getElementById('pageGpsButton').addEventListener('click', requestCurrentLocation);
document.getElementById('useGpsButton').addEventListener('click', requestCurrentLocation);
document.getElementById('closeLocationDialog').addEventListener('click', closeLocationDialog);
locationDialogBackdrop.addEventListener('click', closeLocationDialog);
document.getElementById('saveLocationButton').addEventListener('click', () => { const value = document.getElementById('manualLocationInput').value.trim(); if (!value) { showToast('Enter an address or use your current location'); return; } saveLocation('Custom location', value); });

function validateDraft() {
  if (draft.locationTitle === 'Choose location') { showToast('Choose your service location before booking'); return false; }
  if (draft.dateMode === 'custom' && !draft.dateValue) { showToast('Choose a date for your service'); return false; }
  if (draft.timeMode === 'custom' && !draft.customTimeValue) { showToast('Choose a custom time'); return false; }
  return true;
}
function saveBooking() {
  const ticket = makeTicketId(); const details = getServiceDetails();
  const booking = { service: draft.service, date: draft.dateLabel, time: draft.time, location: draft.locationTitle, ticket, price: details.price, status: 'Upcoming', createdAt: new Date().toISOString() };
  const bookings = JSON.parse(localStorage.getItem('quickserveBookings') || '[]'); bookings.unshift(booking); localStorage.setItem('quickserveBookings', JSON.stringify(bookings.slice(0, 12))); renderBookings(); return booking;
}
function showBookingSuccess(booking, surface = 'drawer') {
  document.getElementById('successServiceName').textContent = booking.service.toLowerCase();
  document.getElementById('successArrival').textContent = `${booking.date} · ${booking.time}`;
  document.getElementById('successLocation').textContent = booking.location;
  document.getElementById('drawerTicketId').textContent = booking.ticket;
  document.getElementById('pageTicketId').textContent = booking.ticket;
  if (surface === 'drawer') { drawerContent.hidden = true; successState.hidden = false; document.querySelector('.progress-step.active')?.classList.remove('active'); }
  else { document.getElementById('pageBookingSuccess').hidden = false; document.getElementById('pageBookingSuccess').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); showToast(`Ticket ${booking.ticket} raised successfully`); }
}
document.getElementById('confirmBooking').addEventListener('click', () => { if (validateDraft()) showBookingSuccess(saveBooking(), 'drawer'); });
document.getElementById('pageConfirmBooking').addEventListener('click', () => { if (validateDraft()) showBookingSuccess(saveBooking(), 'page'); });

async function copyTicket(ticketId) {
  const value = document.getElementById(ticketId)?.textContent || '';
  try { await navigator.clipboard.writeText(value); } catch { const helper = document.createElement('textarea'); helper.value = value; document.body.appendChild(helper); helper.select(); document.execCommand('copy'); helper.remove(); }
  showToast('Ticket ID copied to clipboard');
}
document.querySelectorAll('[data-copy-ticket]').forEach((button) => button.addEventListener('click', () => copyTicket(button.dataset.copyTicket)));

function bookingArt(service) {
  if (service.toLowerCase().includes('ac')) return '<div class="booking-service-art small-ac"><div class="tiny-ac"></div><div class="tiny-wind"></div></div>';
  if (service.toLowerCase().includes('clean')) return '<div class="booking-service-art small-clean"><div class="tiny-spark">✦</div><div class="tiny-broom"></div></div>';
  return '<div class="booking-service-art small-tech"><div class="tiny-screen"></div><div class="tiny-stand"></div></div>';
}
function renderBookings() {
  const stored = JSON.parse(localStorage.getItem('quickserveBookings') || '[]');
  document.querySelector('.booking-list').innerHTML = [...stored, ...demoBookings].slice(0, 8).map((booking, index) => `<div class="booking-item ${index === 0 ? 'current-booking' : ''}">${bookingArt(booking.service)}<div class="booking-main"><div class="booking-label"><span class="booking-status ${booking.status === 'Live' ? 'live' : 'upcoming'}">● ${booking.status || 'Upcoming'}</span><span>${booking.date}</span></div><h3>${booking.service}</h3><p>${booking.expert || 'QuickServe expert'} · ${booking.rating || '4.8'} ★${booking.ticket ? ` · Ticket ${booking.ticket}` : ' · Confirmed'}</p></div><button class="view-booking" type="button" data-booking="${booking.service}">View <span>→</span></button></div>`).join('');
  document.querySelectorAll('.view-booking').forEach((button) => button.addEventListener('click', () => showToast(`${button.dataset.booking} is on your schedule`)));
  document.querySelector('.nav-badge').textContent = String(stored.length + 1);
}

document.querySelectorAll('.quick-picks button').forEach((button) => button.addEventListener('click', () => { document.getElementById('serviceSearch').value = button.dataset.service; openDrawer(button.dataset.service); }));
const searchInput = document.getElementById('serviceSearch');
const suggestions = document.getElementById('searchSuggestions');
const searchableCards = [...document.querySelectorAll('[data-service-card]')];
function runSearch() {
  const query = searchInput.value.trim().toLowerCase(); const terms = query.split(/\s+/).filter(Boolean); let matchCount = 0;
  searchableCards.forEach((card) => { const searchText = `${card.dataset.search} ${card.dataset.serviceCard}`.toLowerCase(); const match = !query || terms.some((term) => searchText.includes(term)); card.style.display = match ? '' : 'none'; if (match) matchCount += 1; });
  document.getElementById('noResults').classList.toggle('visible', Boolean(query) && matchCount === 0);
  if (query) document.getElementById('services').scrollIntoView({ behavior: 'smooth', block: 'start' }); suggestions.innerHTML = '';
}
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase(); suggestions.innerHTML = '';
  if (!query) { searchableCards.forEach((card) => card.style.display = ''); document.getElementById('noResults').classList.remove('visible'); return; }
  Object.keys(services).filter((service) => service.toLowerCase().includes(query) || services[service].meta.toLowerCase().includes(query)).slice(0, 3).forEach((service) => { const item = document.createElement('button'); item.className = 'search-suggestion'; item.type = 'button'; item.innerHTML = `<span>${service}</span><small>${services[service].meta.split('·')[0]}</small>`; item.addEventListener('click', () => openDrawer(service)); suggestions.appendChild(item); });
});
document.getElementById('searchButton').addEventListener('click', runSearch);
searchInput.addEventListener('keydown', (event) => { if (event.key === 'Enter') runSearch(); });
document.getElementById('viewAllButton').addEventListener('click', (event) => { const grid = document.getElementById('serviceGrid'); grid.classList.toggle('show-extra'); event.currentTarget.innerHTML = grid.classList.contains('show-extra') ? 'Show fewer services <span>↗</span>' : 'View all services <span>↗</span>'; });
document.getElementById('mobileMenuButton').addEventListener('click', () => showToast('Use the sections below to explore QuickServe'));

function getInitials(name = 'Profile') { return name.split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase(); }
function updateProfileButton() { const user = JSON.parse(localStorage.getItem('quickserveUser') || 'null'); document.querySelector('.profile-icon').textContent = user ? getInitials(user.name || user.email) : '◉'; document.querySelector('.profile-label').textContent = user ? (user.name?.split(' ')[0] || 'Account') : 'Profile'; }
function openAuthDialog() {
  authTrigger = document.activeElement;
  const user = JSON.parse(localStorage.getItem('quickserveUser') || 'null'); document.getElementById('authForm').hidden = Boolean(user); document.getElementById('profileState').hidden = !user;
  if (user) { document.getElementById('profileStateAvatar').textContent = getInitials(user.name || user.email); document.getElementById('profileStateName').textContent = user.name || 'QuickServe customer'; document.getElementById('profileStateEmail').textContent = user.email; }
  authDialog.classList.add('open'); authDialogBackdrop.classList.add('open'); authDialog.setAttribute('aria-hidden', 'false'); authDialogBackdrop.setAttribute('aria-hidden', 'false');
  (document.getElementById('authForm').hidden ? document.getElementById('closeAuthDialog') : document.getElementById('authEmail')).focus();
}
function closeAuthDialog() { authDialog.classList.remove('open'); authDialogBackdrop.classList.remove('open'); authDialog.setAttribute('aria-hidden', 'true'); authDialogBackdrop.setAttribute('aria-hidden', 'true'); if (authTrigger && document.contains(authTrigger)) authTrigger.focus(); authTrigger = null; }
function setAuthMode(mode) { authMode = mode; const signup = mode === 'signup'; document.querySelectorAll('.auth-tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.authMode === mode)); document.getElementById('authDialogTitle').textContent = signup ? 'Make home care easier.' : 'Welcome back.'; document.querySelector('.auth-name-field').hidden = !signup; document.getElementById('authSubmitButton').innerHTML = signup ? 'Create account <span>↗</span>' : 'Sign in <span>↗</span>'; }
document.getElementById('profileButton').addEventListener('click', openAuthDialog);
document.getElementById('closeAuthDialog').addEventListener('click', closeAuthDialog);
authDialogBackdrop.addEventListener('click', closeAuthDialog);
document.querySelectorAll('[data-auth-mode]').forEach((tab) => tab.addEventListener('click', () => setAuthMode(tab.dataset.authMode)));
document.getElementById('authForm').addEventListener('submit', (event) => { event.preventDefault(); const email = document.getElementById('authEmail').value.trim(); const name = document.getElementById('authName').value.trim() || email.split('@')[0]; localStorage.setItem('quickserveUser', JSON.stringify({ name, email })); updateProfileButton(); closeAuthDialog(); showToast(authMode === 'signup' ? 'Your QuickServe account is ready' : 'You are signed in'); });
document.getElementById('signOutButton').addEventListener('click', () => { localStorage.removeItem('quickserveUser'); updateProfileButton(); closeAuthDialog(); showToast('You have been signed out'); });

document.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener('click', (event) => { const selector = link.getAttribute('href'); if (!selector || selector === '#') return; const target = document.querySelector(selector); if (!target) return; event.preventDefault(); if (selector === '#book-service') openBookingPage(draft.service); else target.scrollIntoView({ behavior: 'smooth', block: 'start' }); history.replaceState(null, '', selector); }));

renderCalendars();
renderTimeChips();
renderBookings();
syncLocationUI();
updateProfileButton();
