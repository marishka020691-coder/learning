document.documentElement.classList.add('js');

// The mobile menu stays out of the way until its button is selected.
const menuButton = document.querySelector('.menu-toggle');
const primaryNavigation = document.querySelector('.primary-nav');
const mobileQuery = window.matchMedia('(max-width: 900px)');
menuButton.hidden = false;

function setNavigation(isOpen) {
  const open = mobileQuery.matches && isOpen;
  const isHidden = mobileQuery.matches && !open;

  // Move focus before making a closing menu unavailable to the keyboard.
  if (isHidden && primaryNavigation.contains(document.activeElement)) {
    menuButton.focus({ preventScroll: true });
  }

  document.body.classList.toggle('nav-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  primaryNavigation.inert = isHidden;
  if (isHidden) primaryNavigation.setAttribute('aria-hidden', 'true');
  else primaryNavigation.removeAttribute('aria-hidden');
}

function closeNavigation() {
  setNavigation(false);
}

closeNavigation();
menuButton.addEventListener('click', event => {
  const isOpen = menuButton.getAttribute('aria-expanded') !== 'true';
  setNavigation(isOpen);
  if (isOpen && event.detail === 0) {
    primaryNavigation.querySelector('a').focus({ preventScroll: true });
  }
});

document.querySelectorAll('.primary-nav a, .header-actions a').forEach(link => {
  link.addEventListener('click', closeNavigation);
});
mobileQuery.addEventListener('change', closeNavigation);

document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeNavigation();
});

// Open the original video only after a click, with no iframe on initial load.
const videoLauncher = document.querySelector('#open-video');
const videoDialog = document.querySelector('#tour-video-dialog');
const videoMount = document.querySelector('#video-mount');
const closeVideoButton = document.querySelector('#close-video');

function openVideo() {
  if (videoDialog.open) return;
  closeNavigation();

  const frame = document.createElement('iframe');
  const url = new URL('https://www.youtube-nocookie.com/embed/Mdcw3Sb98DA');
  url.searchParams.set('autoplay', '1');
  url.searchParams.set('rel', '0');
  frame.src = url.toString();
  frame.title = 'Introducing Lobe — build your first machine learning model in ten minutes';
  frame.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  frame.allowFullscreen = true;
  videoMount.replaceChildren(frame);

  videoDialog.showModal();
  closeVideoButton.focus({ preventScroll: true });
}

videoLauncher.addEventListener('click', openVideo);
closeVideoButton.addEventListener('click', () => videoDialog.close());

videoDialog.addEventListener('close', () => {
  if (videoDialog.open) return;
  // Remove the player so sound and video stop immediately.
  videoMount.replaceChildren();
  videoLauncher.focus({ preventScroll: true });
});

videoDialog.addEventListener('click', event => {
  const bounds = videoDialog.getBoundingClientRect();
  if (event.target === videoDialog && (
    event.clientX < bounds.left || event.clientX > bounds.right ||
    event.clientY < bounds.top || event.clientY > bounds.bottom
  )) videoDialog.close();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !videoDialog.open && menuButton.getAttribute('aria-expanded') === 'true') {
    closeNavigation();
    menuButton.focus();
  }
});
