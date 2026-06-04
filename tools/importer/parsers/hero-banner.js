/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the hero-banner variant.
 *
 * Source: Wells Fargo div.rsk-marquee-container
 *   .rsk-marquee-img-container > <picture> with full-bleed banner image
 *   .rsk-marquee-content > .rsk-marquee-inner-content > <h2> overlay heading
 *
 * Output: 2-column block, single content row with [image | heading].
 */
export default function parse(element, { document }) {
  const picture = element.querySelector('picture');
  const img = element.querySelector('img');
  const heading = element.querySelector('h1, h2, h3');

  if (!img && !heading) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Use the picture if present, otherwise fall back to the bare img.
  const imageNode = picture || img;
  const headingNode = heading || document.createElement('span');

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'hero-banner',
    cells: [[imageNode, headingNode]],
  });
  element.replaceWith(block);
}
