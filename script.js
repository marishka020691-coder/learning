// Search only the six topics on this local practice page.
const searchForm = document.querySelector('.search-form');
const searchInput = document.querySelector('#help-search');
const topics = [...document.querySelectorAll('.topic')];
const searchStatus = document.querySelector('#search-status');
const emptyState = document.querySelector('.empty-state');

function filterTopics() {
  const query = searchInput.value.trim().toLowerCase();
  const words = query.split(/\s+/).filter(Boolean);
  let visibleCount = 0;

  topics.forEach((topic) => {
    const searchableText = `${topic.dataset.search} ${topic.textContent}`.toLowerCase();
    const matches = words.every((word) => searchableText.includes(word));
    topic.hidden = !matches;
    if (matches) visibleCount += 1;
  });

  searchStatus.hidden = !query;
  searchStatus.textContent = query
    ? `${visibleCount} ${visibleCount === 1 ? 'topic' : 'topics'} found for “${searchInput.value.trim()}”`
    : '';
  emptyState.hidden = visibleCount > 0;
}

function showAllTopics() {
  searchInput.value = '';
  filterTopics();
}

searchInput.addEventListener('input', filterTopics);
searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  filterTopics();
  document.querySelector('.topics-section').scrollIntoView({ block: 'start' });
});

document.querySelector('#clear-search').addEventListener('click', () => {
  showAllTopics();
  searchInput.focus();
});

document.querySelector('#browse-topics').addEventListener('click', showAllTopics);

// The same dialog displays a short preview for each topic.
const dialog = document.querySelector('#help-dialog');
const dialogTitle = document.querySelector('#dialog-title');
const dialogDescription = document.querySelector('#dialog-description');
const dialogContent = document.querySelector('#dialog-content');

const topicDetails = {
  branches: ['Manage your design files', 'Keep track of versions', 'Document your design work'],
  account: ['Email and profile details', 'Password and account settings', 'Your personal preferences'],
  organizations: ['Organize your workspace', 'Manage people and teams', 'Keep projects in order'],
  billing: ['Subscriptions', 'Payment details', 'Billing questions'],
  authentication: ['Single sign-on (SSO)', 'SCIM', 'Just-in-Time provisioning'],
  support: ['Account questions', 'Troubleshooting', 'Getting in touch'],
};

function openDialog(title, description) {
  dialogTitle.textContent = title;
  dialogDescription.textContent = description;
  dialogContent.replaceChildren();
  if (!dialog.open) dialog.showModal();
}

function openTopic(id) {
  const topic = document.getElementById(id);
  if (!topic || !topicDetails[id]) return;

  openDialog(topic.querySelector('h2').textContent, topic.querySelector('p').textContent);

  const list = document.createElement('ul');
  topicDetails[id].forEach((text) => {
    const item = document.createElement('li');
    item.textContent = text;
    list.append(item);
  });
  dialogContent.append(list);
}

function addDialogNote(text) {
  const note = document.createElement('p');
  note.className = 'dialog-note';
  note.textContent = text;
  dialogContent.append(note);
}

document.querySelectorAll('[data-topic]').forEach((button) => {
  button.addEventListener('click', () => openTopic(button.dataset.topic));
});

document.querySelectorAll('[data-action]').forEach((button) => {
  button.addEventListener('click', () => {
    switch (button.dataset.action) {
      case 'search':
        searchInput.scrollIntoView({ block: 'center' });
        searchInput.focus({ preventScroll: true });
        break;
      case 'request':
        openDialog('Submit a request', 'Need a hand? This is where you’ll be able to contact support.');
        addDialogNote('This is a local practice page. Sending support requests isn’t connected yet.');
        break;
      case 'signin':
        openDialog('Sign in', 'A little help is available without an account.');
        addDialogNote('This is a local practice page. Account sign-in isn’t connected yet.');
        break;
      case 'about':
        openDialog('A little help, right here.', 'An HTML, CSS, and JavaScript practice page inspired by the Abstract Help Center.');
        addDialogNote('Explore the six topics, try the search, and make this page your own.');
        break;
    }
  });
});

document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());

// A click outside the dialog closes it; Escape works natively too.
dialog.addEventListener('click', (event) => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (
    event.clientX < bounds.left || event.clientX > bounds.right ||
    event.clientY < bounds.top || event.clientY > bounds.bottom
  )) {
    dialog.close();
  }
});
