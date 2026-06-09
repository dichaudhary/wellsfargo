/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the promo variant (large full-width promo).
 *
 * Base block: promo.
 * Source: Wells Fargo product landing pages.
 *   .ps-large-promo-full-container > .ps-promo-full-item with
 *   image (.ps-promo-full-image img), heading, description, and CTA links.
 *
 * Output: 2-cell promo block [image, contentCell] where contentCell holds
 *   the heading, description, and de-duplicated CTA links.
 */
export default function parse(element, { document }) {
  const item = element.querySelector('.ps-promo-full-item') || element;
  const image = item.querySelector('.ps-promo-full-image img, img');
  const heading = item.querySelector('.ps-promo-full-content h2, h2, h1, h3');
  const description = item.querySelector('.ps-promo-full-content > p, .ps-promo-full-content p');
  const ctaLinks = Array.from(
    item.querySelectorAll('.ps-promo-full-links a, .ps-promo-full-content a.ps-btn-secondary, .ps-promo-full-content a.ps-btn-primary, .ps-promo-full-content a.ps-btn-text'),
  );

  const uniqueCtas = [];
  const seenCtas = new Set();
  ctaLinks.forEach((a) => {
    if (!seenCtas.has(a)) {
      seenCtas.add(a);
      uniqueCtas.push(a);
    }
  });

  // Empty-block guard: leave original DOM intact when nothing matched.
  if (!image && !heading && !description && uniqueCtas.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);
  contentCell.push(...uniqueCtas);

  const cells = [
    [image || '', contentCell],
  ];

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'promo',
    cells,
  });
  element.replaceWith(block);
}
