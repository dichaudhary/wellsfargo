/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the columns variant.
 *
 * Source: Wells Fargo div.horizontal-card-container
 *   .horizontal-card > .enhanced-txt-horizontal-card
 *       .horizontal-card-image > img            (optional)
 *       .horizontal-card-content
 *           .horizontal-card-title > h3
 *           .horizontal-card-body                (description)
 *           .horizontal-card-cta > a             (CTA)
 *
 * Output: a single multi-column row, one column per card. Each column cell
 * holds [image?, h3, body, cta].
 */
export default function parse(element, { document }) {
  const cards = element.querySelectorAll('.enhanced-txt-horizontal-card');
  if (!cards.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const columns = [];
  cards.forEach((card) => {
    const cellChildren = [];

    const img = card.querySelector('.horizontal-card-image img, img');
    if (img) cellChildren.push(img);

    const titleNode = card.querySelector('.horizontal-card-title h3, h3, h2');
    if (titleNode) {
      const h3 = document.createElement('h3');
      h3.textContent = titleNode.textContent.replace(/\s+/g, ' ').trim();
      cellChildren.push(h3);
    }

    const body = card.querySelector('.horizontal-card-body');
    if (body) {
      const p = document.createElement('p');
      p.append(...body.childNodes);
      cellChildren.push(p);
    }

    card.querySelectorAll('.horizontal-card-cta a, a.ps-btn-secondary, a.ps-btn-primary').forEach((a) => {
      const p = document.createElement('p');
      p.append(a);
      cellChildren.push(p);
    });

    if (cellChildren.length) columns.push(cellChildren);
  });

  if (!columns.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'columns',
    cells: [columns],
  });
  element.replaceWith(block);
}
