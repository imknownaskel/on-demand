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

  if (document.body.classList.contains('portal-locked') && !getStoredAdminToken()) {
    window.location.replace('index.html');
  }
})();
