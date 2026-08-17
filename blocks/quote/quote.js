export default function decorate(block) {
  const [quoteRow, authorRow] = block.children;
  const quoteHTML = quoteRow ? quoteRow.innerHTML : '';
  const author = authorRow ? authorRow.textContent.trim() : '';

  block.textContent = '';

  const blockquote = document.createElement('blockquote');
  blockquote.innerHTML = quoteHTML;
  block.append(blockquote);

  if (author) {
    const cite = document.createElement('cite');
    cite.textContent = author;
    block.append(cite);
  }
}
