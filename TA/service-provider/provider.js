(function () {
  'use strict';

  const REQUESTS_KEY = 'onDemandServiceRequests';
  const ACTIVE_REQUEST_KEY = 'onDemandActiveRequestId';
  const requestList = document.getElementById('requestList');
  const emptyState = document.getElementById('emptyState');
  const matchModal = document.getElementById('matchModal');
  const openChatLink = document.getElementById('proOpenChat');
  let activeFilter = 'all';

  function readRequests() {
    try {
      const requests = JSON.parse(localStorage.getItem(REQUESTS_KEY) || '[]');
      return Array.isArray(requests) ? requests : [];
    } catch (error) {
      return [];
    }
  }

  function saveRequests(requests) {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
  }

  function addText(parent, tagName, className, text) {
    const element = document.createElement(tagName);
    element.className = className;
    element.textContent = text;
    parent.appendChild(element);
    return element;
  }

  function showMatch(request) {
    openChatLink.href = `chat.html?requestId=${encodeURIComponent(request.id)}&role=pro`;
    matchModal.hidden = false;
  }

  function render() {
    const requests = readRequests();
    const visibleRequests = requests.filter((request) => activeFilter === 'all' || request.status === activeFilter);
    document.getElementById('allCount').textContent = requests.length;
    document.getElementById('pendingCount').textContent = requests.filter((request) => request.status === 'pending').length;
    document.getElementById('matchedCount').textContent = requests.filter((request) => request.status === 'matched').length;
    requestList.replaceChildren();
    emptyState.hidden = visibleRequests.length > 0;

    visibleRequests.forEach((request) => {
      const card = document.createElement('article');
      card.className = 'request-card';
      const main = document.createElement('div');
      main.className = 'request-main';
      const meta = document.createElement('div');
      meta.className = 'request-meta';
      addText(meta, 'h2', '', request.serviceLabel || request.service || 'Service request');
      addText(meta, 'span', `status ${request.status}`, request.status);
      main.appendChild(meta);
      const info = document.createElement('div');
      info.className = 'request-info';
      addText(info, 'span', '', `Location: ${request.location}`);
      main.appendChild(info);
      addText(main, 'time', 'request-time', `Received ${new Date(request.createdAt).toLocaleString()}`);
      card.appendChild(main);

      const actions = document.createElement('div');
      actions.className = 'request-actions';
      if (request.status === 'pending') {
        const accept = addText(actions, 'button', 'action-button', 'Accept request');
        accept.type = 'button';
        accept.addEventListener('click', () => {
          const current = readRequests();
          const match = current.find((entry) => entry.id === request.id && entry.status === 'pending');
          if (!match) return render();
          match.status = 'matched';
          match.proName = 'Service pro';
          match.acceptedAt = new Date().toISOString();
          localStorage.setItem(ACTIVE_REQUEST_KEY, match.id);
          saveRequests(current);
          render();
          showMatch(match);
        });
        const decline = addText(actions, 'button', 'action-button decline', 'Decline');
        decline.type = 'button';
        decline.addEventListener('click', () => {
          const current = readRequests();
          const match = current.find((entry) => entry.id === request.id && entry.status === 'pending');
          if (!match) return;
          match.status = 'declined';
          saveRequests(current);
          render();
        });
      } else if (request.status === 'matched') {
        const chatLink = addText(actions, 'a', 'action-button', 'Open chat');
        chatLink.href = `chat.html?requestId=${encodeURIComponent(request.id)}&role=pro`;
      } else {
        addText(actions, 'span', 'request-time', request.status);
      }
      card.appendChild(actions);
      requestList.appendChild(card);
    });
  }

  document.querySelectorAll('.filter-tab').forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      document.querySelectorAll('.filter-tab').forEach((tab) => tab.classList.toggle('is-active', tab === button));
      render();
    });
  });
  document.getElementById('refreshRequests').addEventListener('click', render);
  document.getElementById('closeMatch').addEventListener('click', () => { matchModal.hidden = true; });
  matchModal.addEventListener('click', (event) => { if (event.target === matchModal) matchModal.hidden = true; });
  window.addEventListener('storage', render);
  window.addEventListener('focus', render);
  render();
})();
