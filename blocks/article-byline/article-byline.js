function formatDate(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function decorate(block) {
  const [authorRow, dateRow] = block.children;
  const author = authorRow ? authorRow.textContent.trim() : '';
  const rawDate = dateRow ? dateRow.textContent.trim() : '';
  block.textContent = '';

  if (author) {
    const authorEl = document.createElement('span');
    authorEl.className = 'article-byline-author';
    authorEl.textContent = `By ${author}`;
    block.append(authorEl);
  }
  if (rawDate) {
    const dateEl = document.createElement('span');
    dateEl.className = 'article-byline-date';
    dateEl.textContent = formatDate(rawDate);
    block.append(dateEl);
  }
}
