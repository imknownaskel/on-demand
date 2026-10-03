(function () {
  'use strict';

  const ADMIN_TOKEN_KEY = 'adminToken';
  const ADMIN_ROLE_KEY = 'adminRole';
  const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

  function getStoredAdminToken() {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY) || '';
  }

  function saveAdminSession() {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, 'demo-admin-token');
    sessionStorage.setItem(ADMIN_ROLE_KEY, 'admin');
  }

  function clearAdminSession() {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_ROLE_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_ROLE_KEY);
  }

  function attachIdleTimeout() {
    let timeoutId = null;

    function armTimeout() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        logoutAdmin();
      }, IDLE_TIMEOUT_MS);
    }

    ['mousemove', 'keydown', 'click', 'touchstart', 'scroll', 'pointerdown'].forEach((eventName) => {
      document.addEventListener(eventName, armTimeout, { passive: true });
    });

    armTimeout();
  }

  const portalBody = document.body.classList.contains('portal-locked');

  if (portalBody) {
    const storedToken = getStoredAdminToken();

    if (!storedToken) {
      window.location.replace('index.html');
      return;
    }

    document.body.classList.add('portal-ready');


    attachIdleTimeout();
  }

  const loginForm = document.getElementById('admin-login-form');
  const mfaForm = document.getElementById('admin-mfa-form');

  if (loginForm && mfaForm) {
    const idField = document.getElementById('admin-id');
    const passwordField = document.getElementById('admin-password');
    const mfaField = document.getElementById('admin-token');
    const backButton = document.getElementById('admin-back-step');
    const resendButton = document.getElementById('admin-resend-btn');
    const stepIndicator = document.querySelectorAll('.step');

    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const adminId = (idField && idField.value || '').trim();
      const password = (passwordField && passwordField.value || '').trim();

      if (!adminId || !password) {
        return;
      }

      loginForm.classList.add('hidden');
      mfaForm.classList.remove('hidden');
      stepIndicator[0].classList.remove('active');
      stepIndicator[1].classList.add('active');
      mfaField.focus();
    });

    backButton.addEventListener('click', () => {
      mfaForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
      stepIndicator[1].classList.remove('active');
      stepIndicator[0].classList.add('active');
      idField.focus();
    });

    resendButton.addEventListener('click', () => {
      if (mfaField) {
        mfaField.value = '';
        mfaField.focus();
      }
    });

    mfaForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const tokenValue = (mfaField && mfaField.value || '').trim();
      const isValidToken = /^\d{6}$/.test(tokenValue);

      if (!isValidToken) {
        mfaField.focus();
        mfaField.setAttribute('aria-invalid', 'true');
        return;
      }

      saveAdminSession();
      window.location.replace('portal.html');
    });
  }

  const existingToken = getStoredAdminToken();
  if (existingToken && window.location.pathname.toLowerCase().endsWith('index.html')) {
    window.location.replace('portal.html');
  }

  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('portalSidebar');
  const screenTitle = document.getElementById('screenTitle');
  const navItems = document.querySelectorAll('.nav-item[data-view]');
  const viewPanes = document.querySelectorAll('.view-pane');

  function selectView(viewName) {
    const activeItem = document.querySelector(`.nav-item[data-view="${viewName}"]`);
    if (!activeItem) return;
    navItems.forEach((item) => item.classList.toggle('active', item === activeItem));
    viewPanes.forEach((pane) => { pane.hidden = pane.id !== `view-${viewName}`; });
    screenTitle.textContent = document.getElementById(`view-${viewName}`).dataset.title;
    sidebar.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation menu');
  }

  navItems.forEach((item) => item.addEventListener('click', () => selectView(item.dataset.view)));

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      const isOpen = sidebar.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    });
  }

  function renderRequestSummary() {
    const activity = document.getElementById('requestActivity');
    if (!activity) return;
    let requests = [];
    try {
      const stored = JSON.parse(localStorage.getItem('onDemandServiceRequests') || '[]');
      requests = Array.isArray(stored) ? stored : [];
    } catch (error) {
      requests = [];
    }
    const counts = requests.reduce((result, request) => {
      result[request.status] = (result[request.status] || 0) + 1;
      return result;
    }, {});
    document.getElementById('requestPending').textContent = counts.pending || 0;
    document.getElementById('requestMatched').textContent = counts.matched || 0;
    document.getElementById('requestDeclined').textContent = counts.declined || 0;
    document.getElementById('requestTotal').textContent = requests.length;
    activity.replaceChildren();
    requests.slice(0, 6).forEach((request) => {
      const row = document.createElement('li');
      const label = document.createElement('strong');
      label.textContent = request.serviceLabel || 'Service request';
      const status = document.createElement('span');
      status.textContent = request.status;
      row.append(label, status);
      activity.appendChild(row);
    });
    if (!requests.length) {
      const row = document.createElement('li');
      row.textContent = 'No requests recorded yet.';
      activity.appendChild(row);
    }
  }

  const settingsForm = document.getElementById('settingsForm');
  if (settingsForm) {
    const settingsKey = 'onDemandAdminPreferences';
    try {
      const preferences = JSON.parse(localStorage.getItem(settingsKey) || '{}');
      document.getElementById('notifyMatches').checked = Boolean(preferences.notifyMatches);
      document.getElementById('notifyReports').checked = Boolean(preferences.notifyReports);
    } catch (error) {
      // Keep default preferences when stored settings are invalid.
    }
    settingsForm.addEventListener('submit', (event) => {
      event.preventDefault();
      localStorage.setItem(settingsKey, JSON.stringify({
        notifyMatches: document.getElementById('notifyMatches').checked,
        notifyReports: document.getElementById('notifyReports').checked
      }));
      document.getElementById('settingsStatus').textContent = 'Preferences saved.';
    });
  }

  if (navItems.length) selectView('overview');
  renderRequestSummary();
  window.addEventListener('storage', renderRequestSummary);
  window.setInterval(renderRequestSummary, 2500);

  if (document.body.classList.contains('portal-locked') && !getStoredAdminToken()) {
    window.location.replace('index.html');
  }
})();
