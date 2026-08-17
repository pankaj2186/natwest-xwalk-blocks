async function fetchIndex() {
  const res = await fetch(`${window.hlx.codeBasePath}/query-index.json`);
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

function titleForPath(path, data) {
  const entry = data.find((e) => e.path === path);
  if (entry && entry.title) return entry.title;
  const segment = path.split('/').filter(Boolean).pop() || '';
  return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function decorate(block) {
  const rootLabel = block.textContent.trim() || 'Home';
  block.textContent = '';

  // Strip a trailing .html (present when viewed in the authoring canvas) and
  // only display the last two meaningful segments (immediate section + current
  // page). Links still use the full path (including any content-root segment
  // like "index/" that the real site keeps for nested pages), so they resolve
  // correctly even though only the last two labels are shown. A leading
  // "index" segment is the homepage's JCR node name (aliased to "/"), not a
  // real section, so it never gets a visible crumb of its own even when it
  // would otherwise fall within the last two segments.
  const cleanPathname = window.location.pathname.replace(/\.html$/, '');
  const allSegments = cleanPathname.split('/').filter(Boolean);
  const labelSegments = allSegments[0] === 'index' ? allSegments.slice(1) : allSegments;
  const visibleSegments = labelSegments.slice(-2);
  const hiddenCount = allSegments.length - visibleSegments.length;

  const data = visibleSegments.length ? await fetchIndex() : [];

  const crumbs = [{ path: '/', label: rootLabel }];
  visibleSegments.forEach((segment, index) => {
    const path = `/${allSegments.slice(0, hiddenCount + index + 1).join('/')}`;
    crumbs.push({ path, label: titleForPath(path, data) });
  });

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  const list = document.createElement('ol');

  crumbs.forEach((crumb, index) => {
    const li = document.createElement('li');
    if (index === crumbs.length - 1) {
      li.textContent = crumb.label;
      li.setAttribute('aria-current', 'page');
    } else {
      const a = document.createElement('a');
      a.href = crumb.path;
      a.textContent = crumb.label;
      li.append(a);
    }
    list.append(li);
  });

  nav.append(list);
  block.append(nav);
}
