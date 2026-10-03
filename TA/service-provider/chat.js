(function () {
  'use strict';

  const REQUESTS_KEY = 'onDemandServiceRequests';
  const params = new URLSearchParams(window.location.search);
  const requestId = params.get('requestId') || localStorage.getItem('onDemandActiveRequestId');
  const role = params.get('role') === 'customer' ? 'customer' : 'pro';
  const requestList = (() => {
    try { return JSON.parse(localStorage.getItem(REQUESTS_KEY) || '[]'); } catch (error) { return []; }
  })();
  const request = requestList.find((entry) => entry.id === requestId && entry.status === 'matched');
  const messagesKey = `onDemandChat:${requestId}`;
  const messagesBox = document.getElementById('chatMessages');
  const notice = document.getElementById('chatNotice');
  const invoiceModal = document.getElementById('invoiceModal');
  const invoiceForm = document.getElementById('invoiceForm');
  const messageForm = document.getElementById('messageForm');
  const photoInput = document.getElementById('photoInput');
  const input = document.getElementById('messageInput');
  let renderedSignature = '';

  if (!request) {
    document.getElementById('jobService').textContent = 'No active match';
    notice.textContent = 'Chat is available only after a service pro accepts a request.';
    messageForm.hidden = true;
    invoiceForm.hidden = true;
    window.setTimeout(() => {
      window.location.replace(role === 'customer' ? '../customer/customerHome.html' : 'provider.html');
    }, 1800);
    return;
  }

  document.title = `${request.serviceLabel} chat | On-Demand`;
  document.getElementById('chatTitle').textContent = role === 'customer' ? (request.proName || 'Matched service pro') : 'Customer';
  document.getElementById('chatSubtitle').textContent = `${request.serviceLabel} · matched`;
  document.getElementById('chatAvatar').textContent = role === 'customer' ? 'SP' : 'CU';
  document.getElementById('jobService').textContent = request.serviceLabel;
  document.getElementById('jobLocation').textContent = request.location;
  document.getElementById('backLink').href = role === 'customer' ? '../customer/customerHome.html' : 'provider.html';
  invoiceForm.hidden = role !== 'pro';

  function getMessages() {
    try {
      const stored = JSON.parse(localStorage.getItem(messagesKey) || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch (error) {
      return [];
    }
  }

  function saveMessage(message) {
    const messages = getMessages();
    messages.push(message);
    try {
      localStorage.setItem(messagesKey, JSON.stringify(messages));
      notice.textContent = '';
      renderMessages();
    } catch (error) {
      notice.textContent = 'This attachment is too large to save. Choose a smaller photo.';
    }
  }

  function showInvoice(invoice) {
    document.getElementById('invoiceModalDescription').textContent = invoice.description;
    document.getElementById('invoiceModalAmount').textContent = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(invoice.amount);
    document.getElementById('confirmInvoice').hidden = role !== 'customer' || invoice.acknowledged;
    document.getElementById('confirmInvoice').textContent = invoice.acknowledged ? 'Acknowledged' : 'Acknowledge invoice';
    invoiceModal.hidden = false;
  }

  function renderMessages() {
    const messages = getMessages();
    const signature = JSON.stringify(messages);
    if (signature === renderedSignature) return;
    renderedSignature = signature;
    messagesBox.replaceChildren();
    messages.forEach((message) => {
      const row = document.createElement('article');
      row.className = `message${message.role === role ? ' mine' : ''}`;
      if (message.type === 'photo') {
        const image = document.createElement('img');
        image.className = 'photo-message';
        image.src = message.data;
        image.alt = 'Photo attachment';
        row.appendChild(image);
      } else if (message.type === 'invoice') {
        const card = document.createElement('div');
        card.className = 'invoice-card';
        const title = document.createElement('span');
        title.textContent = 'Invoice';
        const total = document.createElement('strong');
        total.textContent = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(message.amount);
        const open = document.createElement('button');
        open.type = 'button';
        open.className = 'invoice-open';
        open.textContent = 'View invoice';
        open.addEventListener('click', () => showInvoice(message));
        card.append(title, total, open);
        row.appendChild(card);
      } else {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.textContent = message.text;
        row.appendChild(bubble);
      }
      const time = document.createElement('time');
      time.className = 'message-time';
      time.dateTime = message.createdAt;
      time.textContent = new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      row.appendChild(time);
      messagesBox.appendChild(row);
    });
    messagesBox.scrollTop = messagesBox.scrollHeight;
  }

  messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    saveMessage({ id: crypto.randomUUID(), role, type: 'text', text, createdAt: new Date().toISOString() });
    input.value = '';
  });

  photoInput.addEventListener('change', () => {
    const file = photoInput.files && photoInput.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notice.textContent = 'Only image attachments are supported.';
      photoInput.value = '';
      return;
    }
    if (file.size > 1500000) {
      notice.textContent = 'Choose an image smaller than 1.5 MB.';
      photoInput.value = '';
      return;
    }
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      saveMessage({ id: crypto.randomUUID(), role, type: 'photo', data: reader.result, createdAt: new Date().toISOString() });
      photoInput.value = '';
    });
    reader.readAsDataURL(file);
  });

  invoiceForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const amount = Number(document.getElementById('invoiceAmount').value);
    const description = document.getElementById('invoiceDescription').value.trim();
    if (role !== 'pro' || !description || !Number.isSafeInteger(amount) || amount <= 0) return;
    saveMessage({ id: crypto.randomUUID(), role, type: 'invoice', description, amount, acknowledged: false, createdAt: new Date().toISOString() });
    invoiceForm.reset();
  });

  document.getElementById('closeInvoice').addEventListener('click', () => { invoiceModal.hidden = true; });
  invoiceModal.addEventListener('click', (event) => { if (event.target === invoiceModal) invoiceModal.hidden = true; });
  document.getElementById('confirmInvoice').addEventListener('click', () => {
    const messages = getMessages();
    const invoice = [...messages].reverse().find((message) => message.type === 'invoice');
    if (!invoice || role !== 'customer') return;
    invoice.acknowledged = true;
    localStorage.setItem(messagesKey, JSON.stringify(messages));
    renderMessages();
    showInvoice(invoice);
  });

  window.addEventListener('storage', renderMessages);
  window.setInterval(renderMessages, 1200);
  renderMessages();
})();
