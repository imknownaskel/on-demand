// ---------- Mobile menu: hamburger becomes X ----------
const menuBtn = document.getElementById('menuBtn');
const nav = document.getElementById('nav');

function setMenuOpenState(isOpen) {
  document.body.classList.toggle('nav-open', isOpen);

  if (nav) {
    nav.style.transform = isOpen ? 'translateY(0)' : 'translateY(-120%)';
    nav.style.opacity = isOpen ? '1' : '0';
    nav.style.pointerEvents = isOpen ? 'auto' : 'none';
  }

  if (menuBtn) {
    menuBtn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  }
}

if (menuBtn) {
  menuBtn.addEventListener('click', function () {
    const open = !document.body.classList.contains('nav-open');
    setMenuOpenState(open);
  });
}

// Close menu when a link is tapped (mobile)
if (nav) {
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      setMenuOpenState(false);
    });
  });
}

// ---------- Header shadow on scroll ----------
const header = document.getElementById('header');
window.addEventListener('scroll', function () {
  if (header) header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ---------- Scroll reveal ----------
const observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(function (el) { observer.observe(el); });

// ---------- Footer year ----------
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------- Fair-price demo ----------
const problemInput = document.getElementById('problem');
const priceBtn = document.getElementById('viewInvoiceBtn');
const resultBox = document.getElementById('priceResult');
const quoteLines = document.getElementById('quoteLines');
const quoteTotal = document.getElementById('quoteTotal');
const agreeBtn = document.getElementById('agreeQuoteBtn');
const renegotiateBtn = document.getElementById('renegotiateBtn');
const conversationBox = document.querySelector('.conversation');

if (problemInput) {
  document.querySelectorAll('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      problemInput.value = chip.getAttribute('data-text');
      problemInput.focus();
    });
  });
}

function addOutgoingMessage(message) {
  if (!conversationBox) return;

  const row = document.createElement('div');
  row.className = 'msg-row outgoing';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = message;

  row.appendChild(bubble);
  conversationBox.appendChild(row);
  conversationBox.scrollTop = conversationBox.scrollHeight;
}

function renderInvoice() {
  const invoiceLines = [
    ['Transport', 1000],
    ['Workmanship', 2000],
    ['New drain pipe', 2000],
    ['Escrow fee', 500],
    ['Service fee', 50]
  ];
  const total = invoiceLines.reduce(function (sum, item) {
    return sum + item[1];
  }, 0);

  if (agreeBtn) {
    agreeBtn.classList.remove('is-confirmed');
    agreeBtn.disabled = false;
  }

  if (quoteLines) {
    quoteLines.innerHTML = '';
    invoiceLines.forEach(function (line) {
      const li = document.createElement('li');
      li.innerHTML = '<span>' + line[0] + '</span><span>NGN' + line[1] + '</span>';
      quoteLines.appendChild(li);
    });
  }

  if (quoteTotal) {
    quoteTotal.textContent = 'NGN' + total;
  }

  if (resultBox) {
    resultBox.hidden = false;
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

if (agreeBtn) {
  agreeBtn.addEventListener('click', function () {
    agreeBtn.classList.add('is-confirmed');
    agreeBtn.disabled = true;
  });
}

if (renegotiateBtn) {
  renegotiateBtn.addEventListener('click', function () {
    if (resultBox) {
      resultBox.hidden = true;
    }

    addOutgoingMessage('Could you revise the quote? I need a different breakdown for this job.');

    if (conversationBox) {
      conversationBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}

if (priceBtn) {
  priceBtn.addEventListener('click', renderInvoice);
}