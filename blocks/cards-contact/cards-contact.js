/**
 * Decorate the cards-contact block.
 * 4-up grid of contact cards. Each card has a heading plus either a phone
 * number with hours of operation, or descriptive text plus a CTA link.
 * Content is left-aligned inside each card.
 *
 * Expected authored structure (one card per row):
 *   | (h3 heading + phone/desc paragraph(s) + optional CTA link) |
 *
 * @param {Element} block The cards-contact block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    // Skip rows that contain only the block-name marker text (no real content).
    // A real card always has at least one heading or actionable element.
    if (!row.querySelector('h3, h4, a, ul, ol')) return;

    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      div.className = 'cards-contact-card-body';
    });

    // Detect cards whose last paragraph is a single CTA link and tag them
    // for distinct styling. EDS decorateButtons only auto-styles standalone
    // <p><a> links; here the link sits alongside descriptive paragraphs in
    // the same cell, so we need our own marker class.
    const lastP = li.querySelector('.cards-contact-card-body > p:last-child');
    if (lastP) {
      const a = lastP.querySelector('a');
      const onlyChild = a && lastP.children.length === 1 && lastP.textContent.trim() === a.textContent.trim();
      if (onlyChild) {
        li.classList.add('cards-contact-has-cta');
        a.classList.add('cards-contact-cta');
      }
    }

    ul.append(li);
  });

  block.replaceChildren(ul);
}
