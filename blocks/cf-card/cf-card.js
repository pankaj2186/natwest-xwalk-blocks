/*
 * CF Card Block
 * Renders a Content Fragment (Product Card model) referenced by the
 * "reference" field, either as a styled card or as its raw JSON.
 * Queries the "natwest" GraphQL endpoint (/content/cq:graphql/global/endpoint)
 * for the fragment at that path. This is a same-origin, credentialed
 * request, so it only resolves when viewed through an authenticated AEM
 * session (author host / Universal Editor) today — anonymous public
 * queries need the GraphQL path allow-listed on the publish dispatcher.
 */

const GRAPHQL_ENDPOINT = '/content/cq:graphql/global/endpoint.json';

async function fetchProductCard(path) {
  const query = `{
    productCardList(filter: { _path: { _expressions: [{ value: "${path}", _operator: EQUALS }] } }) {
      items {
        _path
        title
        description
        image { ... on ImageRef { _path } }
        linkHref
        linkText
      }
    }
  }`;
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const { data, errors } = await res.json();
  if (errors?.length) throw new Error(errors[0].message);
  const [item] = data?.productCardList?.items || [];
  if (!item) throw new Error(`No content fragment found at ${path}`);
  return item;
}

function renderJson(block, data) {
  const pre = document.createElement('pre');
  pre.className = 'cf-card-json';
  pre.textContent = JSON.stringify(data, null, 2);
  block.append(pre);
}

function renderCard(block, data) {
  const {
    title, description, image, linkHref, linkText,
  } = data;
  const card = document.createElement('div');
  card.className = 'cf-card-item';

  // eslint-disable-next-line no-underscore-dangle
  const imagePath = image?._path;
  if (imagePath) {
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'cf-card-image';
    const img = document.createElement('img');
    img.src = imagePath;
    img.alt = '';
    img.loading = 'lazy';
    imageWrapper.append(img);
    card.append(imageWrapper);
  }

  const body = document.createElement('div');
  body.className = 'cf-card-body';
  if (title) {
    const heading = document.createElement('h3');
    heading.textContent = title;
    body.append(heading);
  }
  if (description) {
    const p = document.createElement('p');
    p.textContent = description;
    body.append(p);
  }
  if (linkHref && linkText) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = linkHref;
    a.textContent = linkText;
    p.append(a);
    body.append(p);
  }
  card.append(body);
  block.append(card);
}

export default async function decorate(block) {
  const [refRow, modeRow] = block.children;
  const link = refRow ? refRow.querySelector('a[href]') : null;
  // Universal Editor rewrites internal links to end in ".html"; content
  // fragments live under /content/dam and never have that suffix.
  const path = link ? link.getAttribute('href').replace(/\.html$/, '') : '';
  const displayMode = (modeRow ? modeRow.textContent.trim().toLowerCase() : 'card') || 'card';
  block.textContent = '';

  if (!path) {
    block.textContent = 'No content fragment selected.';
    return;
  }

  let data;
  try {
    data = await fetchProductCard(path);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load content fragment', path, error);
    block.textContent = 'Unable to load content fragment.';
    return;
  }

  if (displayMode === 'json') {
    renderJson(block, data);
  } else {
    renderCard(block, data);
  }
}
