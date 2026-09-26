document.addEventListener('DOMContentLoaded', function () {
  const categoryButtons = document.querySelectorAll('.btn-select[data-kind="category"]');
  const optionPanels = document.querySelectorAll('.auth-options');
  const forms = document.querySelectorAll('.auth-form');
  const screens = document.querySelectorAll('.auth-screen');
  const optionButtons = document.querySelectorAll('.auth-option');
  function redirectToCustomerHome() {
    window.location.href = 'TA/customer/customerHome.html';
  }

  function hasCustomerFormFields(form) {
    if (!form) return false;

    const nameField = form.querySelector('input[name="fullName"]');
    const emailField = form.querySelector('input[type="email"]');
    const passwordField = form.querySelector('input[name="password"]');
    const confirmPasswordField = form.querySelector('input[name="confirmPassword"]');

    const hasName = nameField && nameField.value.trim().length > 0;
    const hasEmail = emailField && emailField.value.trim().length > 0 && emailField.validity.valid;
    const hasPassword = passwordField && passwordField.value.trim().length >= 6;
    const hasConfirmPassword = confirmPasswordField && confirmPasswordField.value === passwordField?.value;

    return hasName && hasEmail && hasPassword && hasConfirmPassword;
  }

  function unlockCustomerSuccessScreen() {
    redirectToCustomerHome();
  }

  function setVisibleCollection(collection, visibleId) {
    collection.forEach(function (element) {
      const isVisible = element.id === visibleId;
      element.classList.toggle('is-visible', isVisible);
    });
  }

  function showOptions(role) {
    optionPanels.forEach(function (panel) {
      const isVisible = panel.dataset.role === role;
      panel.classList.toggle('is-visible', isVisible);
    });

    forms.forEach(function (form) {
      form.classList.remove('is-visible');
    });

    screens.forEach(function (screen) {
      screen.classList.remove('is-visible');
    });
  }

  function showForm(formId) {
    optionPanels.forEach(function (panel) {
      panel.classList.remove('is-visible');
    });

    forms.forEach(function (form) {
      const isVisible = form.id === formId;
      form.classList.toggle('is-visible', isVisible);
    });

    screens.forEach(function (screen) {
      screen.classList.remove('is-visible');
    });
  }

  function showScreen(screenId) {
    optionPanels.forEach(function (panel) {
      panel.classList.remove('is-visible');
    });

    forms.forEach(function (form) {
      form.classList.remove('is-visible');
    });

    screens.forEach(function (screen) {
      const isVisible = screen.id === screenId;
      screen.classList.toggle('is-visible', isVisible);
    });
  }

  function activateCategory(role) {
    const targetRole = role || 'customer';

    categoryButtons.forEach(function (item) {
      const isSelected = item.dataset.role === targetRole;
      item.classList.toggle('is-selected', isSelected);
      item.setAttribute('aria-selected', String(isSelected));
    });

    showOptions(targetRole);
  }

  categoryButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activateCategory(this.dataset.role);
    });
  });

  optionButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const role = this.dataset.role;
      const action = this.dataset.action;
      const target = this.dataset.target;

      optionButtons.forEach(function (item) {
        const isSelected = item === button;
        item.classList.toggle('is-selected', isSelected);
        item.setAttribute('aria-selected', String(isSelected));
      });

      if (action === 'email' && target) {
        showForm(target);
        return;
      }

      if (role === 'provider' && (action === 'google' || action === 'apple')) {
        showForm('provider-onboarding');
        return;
      }

      if (role === 'customer' && (action === 'google' || action === 'apple')) {
        unlockCustomerSuccessScreen();
        return;
      }

      showOptions(role);
    });
  });

  document.querySelectorAll('[data-next-screen]').forEach(function (button) {
    button.addEventListener('click', function () {
      const screenId = this.dataset.nextScreen;
      const selectedRole = document.querySelector('.btn-select[data-kind="category"].is-selected');
      const isCustomer = selectedRole && selectedRole.dataset.role === 'customer';

      if (screenId === 'verification-screen' && isCustomer) {
        const form = document.getElementById('customer-email-form');
        if (form && hasCustomerFormFields(form)) {
          unlockCustomerSuccessScreen();
          return;
        }
      }

      if (screenId) {
        showScreen(screenId);
      }
    });
  });

  document.querySelectorAll('[data-verify="true"]').forEach(function (button) {
    button.addEventListener('click', function () {
      const selectedRole = document.querySelector('.btn-select[data-kind="category"].is-selected');
      const isProvider = selectedRole && selectedRole.dataset.role === 'provider';
      if (isProvider) {
        showScreen('provider-processing-screen');
        return;
      }
      unlockCustomerSuccessScreen();
    });
  });

  const customerLoginForm = document.getElementById('customer-login');
  if (customerLoginForm) {
    customerLoginForm.addEventListener('submit', function (event) {
      event.preventDefault();
      unlockCustomerSuccessScreen();
    });
  }

  const customerSignupForm = document.getElementById('customer-email-form');
  if (customerSignupForm) {
    customerSignupForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (hasCustomerFormFields(customerSignupForm)) {
        unlockCustomerSuccessScreen();
      }
    });
  }

  document.querySelectorAll('.toggle-password').forEach(function (button) {
    button.addEventListener('click', function () {
      const targetId = this.dataset.target;
      const input = document.getElementById(targetId);

      if (!input) return;

      const shouldShow = input.type === 'password';
      input.type = shouldShow ? 'text' : 'password';
      this.classList.toggle('is-visible', shouldShow);
      this.setAttribute('aria-label', shouldShow ? 'Hide password' : 'Show password');
      this.setAttribute('aria-pressed', String(shouldShow));
    });
  });

  const initialSelection = document.querySelector('.btn-select[data-kind="category"].is-selected');
  if (initialSelection && initialSelection.dataset.role) {
    activateCategory(initialSelection.dataset.role);
  }
});