document.documentElement.classList.add('js');

// Monthly prices are supplied in HTML. Yearly prices are intentionally unset.
const billingSwitch = document.querySelector('#billing-switch');
const billingStatus = document.querySelector('#billing-status');
let yearlyBilling = false;

function updateBilling() {
  billingSwitch.setAttribute('aria-checked', String(yearlyBilling));

  document.querySelectorAll('.plan-card').forEach((card) => {
    const amount = card.querySelector('.price-amount');
    const hasYearlyPrice = Boolean(amount.dataset.yearly);
    amount.textContent = yearlyBilling ? (amount.dataset.yearly || '—') : amount.dataset.monthly;
    card.querySelector('.currency').hidden = yearlyBilling && !hasYearlyPrice;
    card.querySelector('.price-period').textContent = yearlyBilling ? '/YEAR' : '/MONTH';
    card.querySelector('.billing-note').textContent = yearlyBilling
      ? (hasYearlyPrice ? 'Billed yearly' : 'Yearly pricing to be added')
      : 'Billed monthly';
  });

  billingStatus.textContent = yearlyBilling
    ? 'Yearly billing selected. Yearly prices will be added later.'
    : 'Monthly billing selected.';
}

billingSwitch.addEventListener('click', () => {
  yearlyBilling = !yearlyBilling;
  updateBilling();
});

// Dropdowns also work with the keyboard through native <details> elements.
const dropdowns = [...document.querySelectorAll('.nav-dropdown')];
const menuButton = document.querySelector('.menu-toggle');
const mobileQuery = window.matchMedia('(max-width: 960px)');
menuButton.hidden = false;

function closeDropdowns(except = null) {
  dropdowns.forEach((dropdown) => {
    if (dropdown !== except) dropdown.open = false;
  });
}

dropdowns.forEach((dropdown) => {
  dropdown.addEventListener('toggle', () => {
    if (dropdown.open) closeDropdowns(dropdown);
  });
});

function closeMobileMenu() {
  document.body.classList.remove('nav-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  closeDropdowns();
}

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  document.body.classList.toggle('nav-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  if (!open) closeDropdowns();
});

mobileQuery.addEventListener('change', closeMobileMenu);
document.addEventListener('click', (event) => {
  if (!event.target.closest('.nav-dropdown')) closeDropdowns();
  if (!event.target.closest('.site-header')) closeMobileMenu();
});

document.querySelectorAll('.primary-nav a, .header-actions a').forEach((link) => {
  link.addEventListener('click', closeMobileMenu);
});

// Navigation previews use one accessible native dialog.
const dialog = document.querySelector('#preview-dialog');
const dialogTitle = document.querySelector('#dialog-title');
const dialogDescription = document.querySelector('#dialog-description');
const dialogContent = document.querySelector('#dialog-content');
let returnFocusTarget = null;

const previews = {
  projects: {
    title: 'Project management',
    description: 'A closer look at the workflow features listed in the plans.',
    items: ['Unlimited Clients & Projects', 'Client CRM', 'Project Management'],
  },
  invoices: {
    title: 'Invoicing & payments',
    description: 'Part of the Workflow plan, alongside proposals and contracts.',
    items: ['Proposals', 'Contracts', 'Invoicing & Payments'],
  },
  time: {
    title: 'Task & time tracking',
    description: 'One of the features included in both plans.',
    items: ['Task & Time Tracking', 'iOS, Android, Chrome, & Mac Apps'],
  },
  proposal: {
    title: 'Proposal template',
    description: 'A sample outline for the template preview.',
    items: ['Project overview', 'Scope & deliverables', 'Timeline', 'Project fee'],
  },
  contract: {
    title: 'Contract template',
    description: 'A sample outline for the template preview.',
    items: ['Project title', 'Client details', 'Project scope', 'Agreement details'],
  },
  invoice: {
    title: 'Invoice template',
    description: 'A sample outline for the template preview.',
    items: ['Your business details', 'Client details', 'Items & amounts', 'Payment details'],
  },
  reviews: {
    title: 'Reviews',
    description: 'A place for real customer experiences.',
    note: 'Reviews can be added here when the content is ready.',
  },
  login: {
    title: 'Welcome back.',
    description: 'Your work, a little more organized.',
    note: 'This is a practice page. Account sign-in is not connected yet.',
  },
};

function appendText(tag, text, className = '') {
  const element = document.createElement(tag);
  element.textContent = text;
  element.className = className;
  dialogContent.append(element);
  return element;
}

function openPreview(title, description) {
  const activeElement = document.activeElement;
  returnFocusTarget = activeElement.closest('.nav-dropdown')?.querySelector('summary') || activeElement;
  closeDropdowns();
  dialogTitle.textContent = title;
  dialogDescription.textContent = description;
  dialogContent.replaceChildren();
  if (!dialog.open) dialog.showModal();
}

document.querySelectorAll('[data-preview]').forEach((button) => {
  button.addEventListener('click', () => {
    const preview = previews[button.dataset.preview];
    if (!preview) return;
    openPreview(preview.title, preview.description);
    if (preview.items) {
      const list = appendText('ul', '', 'preview-list');
      preview.items.forEach((text) => {
        const item = document.createElement('li');
        item.textContent = text;
        list.append(item);
      });
    }
    if (preview.note) appendText('p', preview.note, 'preview-note');
  });
});

document.querySelectorAll('[data-plan]').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.plan-card');
    const planName = card.querySelector('h2').textContent;
    openPreview(planName, 'Your selected plan.');
    appendText('div', yearlyBilling
      ? 'Yearly pricing to be added'
      : `$${card.querySelector('.price-amount').dataset.monthly} / month`, 'selection-price');
    appendText('p', 'This preview does not create an account or take a payment.', 'preview-note');
  });
});

document.querySelectorAll('.dialog-close, .dialog-back').forEach((button) => {
  button.addEventListener('click', () => dialog.close());
});

dialog.addEventListener('close', () => {
  if (!dialog.open && returnFocusTarget?.getClientRects().length) {
    returnFocusTarget.focus({ preventScroll: true });
  }
});

dialog.addEventListener('click', (event) => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (
    event.clientX < bounds.left || event.clientX > bounds.right ||
    event.clientY < bounds.top || event.clientY > bounds.bottom
  )) dialog.close();
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || dialog.open) return;
  const openDropdown = dropdowns.find(dropdown => dropdown.open);
  if (openDropdown) {
    closeDropdowns();
    openDropdown.querySelector('summary').focus();
  } else if (document.body.classList.contains('nav-open')) {
    closeMobileMenu();
    menuButton.focus();
  }
});
