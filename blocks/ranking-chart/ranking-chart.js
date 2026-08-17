/*
 * Ranking Chart Block
 * Renders a ranked list of percentage bars (e.g. a regulatory service-quality
 * comparison). Bold the name (e.g. <strong>NatWest</strong>) to mark the
 * "own brand" row: it gets an outlined bar instead of a filled one.
 */
export default function decorate(block) {
  [...block.children].forEach((row, index) => {
    const [nameCell, pctCell] = row.children;
    row.classList.add('ranking-chart-row');
    nameCell.classList.add('ranking-chart-name');

    const isOwnBrand = !!nameCell.querySelector('strong');
    if (isOwnBrand) row.classList.add('ranking-chart-row-highlight');

    const rank = document.createElement('span');
    rank.className = 'ranking-chart-rank';
    rank.textContent = index + 1;
    nameCell.prepend(rank);

    const value = parseFloat(pctCell.textContent) || 0;
    pctCell.textContent = '';
    pctCell.className = 'ranking-chart-pct-cell';

    const bar = document.createElement('div');
    bar.className = 'ranking-chart-bar';
    const fill = document.createElement('div');
    fill.className = 'ranking-chart-bar-fill';
    fill.style.width = `${Math.min(value, 100)}%`;
    bar.append(fill);

    const pct = document.createElement('span');
    pct.className = 'ranking-chart-pct';
    pct.textContent = `${value}%`;

    pctCell.append(bar, pct);
  });
}
