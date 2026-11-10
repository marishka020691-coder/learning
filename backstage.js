const issues = [...document.querySelectorAll('.issue')];
const issueLinks = [...document.querySelectorAll('.issue-nav a')];
const themeColor = document.querySelector('meta[name="theme-color"]');
let activeIssue;
let scheduledFrame = 0;

function activateIssue(issue) {
  if (!issue || issue === activeIssue) return;
  activeIssue = issue;
  document.documentElement.style.setProperty('--page-color', issue.dataset.color);
  themeColor.content = issue.dataset.color;

  issues.forEach(section => section.classList.toggle('is-active', section === issue));
  issueLinks.forEach(link => {
    if (link.hash === `#${issue.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function syncWithScroll() {
  scheduledFrame = 0;
  const center = window.innerHeight / 2;
  // Read all positions first, then update the colour and active link together.
  const positions = issues.map(issue => {
    const bounds = issue.getBoundingClientRect();
    return { issue, distance: Math.abs(bounds.top + bounds.height / 2 - center) };
  });
  const closest = positions.reduce((best, item) => item.distance < best.distance ? item : best);
  activateIssue(closest.issue);
}

function scheduleSync() {
  if (!scheduledFrame) scheduledFrame = requestAnimationFrame(syncWithScroll);
}

// Set the correct initial colour for direct links such as backstage.html#issue-2.
activateIssue(issues.find(issue => `#${issue.id}` === location.hash) || issues[0]);
document.documentElement.classList.add('js');
window.addEventListener('scroll', scheduleSync, { passive: true });
window.addEventListener('resize', scheduleSync);
window.addEventListener('hashchange', scheduleSync);
window.addEventListener('load', scheduleSync);
scheduleSync();
