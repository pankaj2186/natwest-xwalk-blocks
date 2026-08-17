function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function decorate(block) {
  const heading = block.textContent.trim() || 'On this page';
  const section = block.closest('.section');
  const headings = section ? [...section.querySelectorAll('h2')] : [];

  block.textContent = '';

  const headingEl = document.createElement('p');
  headingEl.className = 'toc-heading';
  headingEl.textContent = heading;
  block.append(headingEl);

  if (!headings.length) {
    block.classList.add('toc-empty');
    return;
  }

  const nav = document.createElement('nav');
  const list = document.createElement('ul');
  headings.forEach((h) => {
    if (!h.id) h.id = slugify(h.textContent);
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${h.id}`;
    a.textContent = h.textContent;
    li.append(a);
    list.append(li);
  });
  nav.append(list);
  block.append(nav);
}
