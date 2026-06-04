/**
 * Decorate the cards-icon-bar block.
 * Horizontal icon bar of contact-help entries (Call us, Find a location, Make an appointment).
 *
 * Authored structure (each row is one entry):
 *   | h3 (label) + body content |             — expandable item (Call us, Find a location)
 *   | a (single link only)      |             — direct link item (Make an appointment)
 *
 * The icon for each entry is inferred from the heading slug / link text and
 * rendered from the Wells Fargo sprite via CSS modifier classes
 * (`is-call`, `is-location`, `is-appointment`). Items that have body content
 * beyond a single link become collapsible (button toggles aria-expanded);
 * items with only a link render as a flat link (no toggle).
 *
 * @param {Element} block The cards-icon-bar block element
 */
function slugifyText(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function iconModifierFor(text) {
  const slug = slugifyText(text);
  if (slug.includes('call')) return 'is-call';
  if (slug.includes('location') || slug.includes('find')) return 'is-location';
  if (slug.includes('appoint')) return 'is-appointment';
  return '';
}

function buildExpandable(li, heading, bodyNodes) {
  const headingText = heading.textContent.trim();
  const iconClass = iconModifierFor(headingText);

  // Build collapsible region container
  const region = document.createElement('div');
  region.className = 'cards-icon-bar-content';
  region.hidden = true;
  bodyNodes.forEach((n) => region.append(n));

  // Build header button
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'cards-icon-bar-toggle';
  button.setAttribute('aria-expanded', 'false');

  const icon = document.createElement('span');
  icon.className = `cards-icon-bar-icon ${iconClass}`.trim();
  icon.setAttribute('aria-hidden', 'true');

  const label = document.createElement('span');
  label.className = 'cards-icon-bar-label';
  label.textContent = headingText;

  const chevron = document.createElement('span');
  chevron.className = 'cards-icon-bar-chevron';
  chevron.setAttribute('aria-hidden', 'true');

  button.append(icon, label, chevron);

  // Connect ARIA
  const regionId = `cards-icon-bar-${slugifyText(headingText)}-${Math.random().toString(36).slice(2, 7)}`;
  region.id = regionId;
  button.setAttribute('aria-controls', regionId);

  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!open));
    region.hidden = open;
  });

  li.replaceChildren(button, region);
}

function buildDirectLink(li, link) {
  const linkText = link.textContent.trim();
  const iconClass = iconModifierFor(linkText);

  const wrapper = document.createElement('a');
  wrapper.className = 'cards-icon-bar-link';
  wrapper.href = link.getAttribute('href') || '#';
  if (link.target) wrapper.target = link.target;

  const icon = document.createElement('span');
  icon.className = `cards-icon-bar-icon ${iconClass}`.trim();
  icon.setAttribute('aria-hidden', 'true');

  const label = document.createElement('span');
  label.className = 'cards-icon-bar-label';
  label.textContent = linkText;

  wrapper.append(icon, label);
  li.replaceChildren(wrapper);
}

export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');

    // Flatten cell content into the li (authored row may contain nested cell wrappers)
    const cells = [...row.children];
    cells.forEach((cell) => {
      while (cell.firstElementChild) li.append(cell.firstElementChild);
    });

    const heading = li.querySelector('h3');
    const bodyChildren = [...li.children].filter((n) => n !== heading);

    // Direct-link case: only a single paragraph holding a link.
    const onlyLinkParagraph = bodyChildren.length === 1
      && bodyChildren[0].tagName === 'P'
      && bodyChildren[0].children.length === 1
      && bodyChildren[0].firstElementChild.tagName === 'A';

    if (!heading && onlyLinkParagraph) {
      buildDirectLink(li, bodyChildren[0].firstElementChild);
    } else if (heading) {
      buildExpandable(li, heading, bodyChildren);
    } else {
      // Fallback — keep as-is
      const wrap = document.createElement('div');
      wrap.className = 'cards-icon-bar-body';
      [...li.children].forEach((c) => wrap.append(c));
      li.append(wrap);
    }

    ul.append(li);
  });

  block.replaceChildren(ul);
}
