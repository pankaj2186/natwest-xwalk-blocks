export default function decorate(block) {
  const rows = [...block.children];
  // Identify the image row and the content (text) row.
  const imageRow = rows.find((r) => r.querySelector('picture'));
  const contentRow = rows.find((r) => r !== imageRow && r.textContent.trim());

  if (imageRow) imageRow.classList.add('hero-purple-image');
  if (contentRow) contentRow.classList.add('hero-purple-content');

  if (!imageRow) {
    block.classList.add('no-image');
  }
}
