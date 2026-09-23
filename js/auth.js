document.addEventListener('DOMContentLoaded', function () {
  const categoryButtons = document.querySelectorAll('.category-btn');
  const forms = document.querySelectorAll('.auth-form');

  function activateCategory(targetId) {
    const button = document.querySelector('.category-btn[data-target="' + targetId + '"]');

    categoryButtons.forEach(function (item) {
      const isSelected = item === button;
      item.classList.toggle('is-selected', isSelected);
      item.setAttribute('aria-selected', String(isSelected));
    });

    forms.forEach(function (form) {
      const isVisible = form.id === targetId;
      form.classList.toggle('is-visible', isVisible);
    });
  }

  categoryButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activateCategory(this.dataset.target);
    });
  });

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

  const initialSelection = document.querySelector('.category-btn.is-selected');
  if (initialSelection) {
    activateCategory(initialSelection.dataset.target);
  }
});
