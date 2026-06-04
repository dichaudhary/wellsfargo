/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-testimonials.
 * Base block: cards.
 * Source: https://www.wellsfargo.com/mortgage/ (testimonials section)
 * Generated: 2026-06-03
 *
 * Notes:
 * - The section heading (e.g. "Hear from our customers") is rendered as section
 *   default content (.ps-mid-page-title-wrapper h2) per page-templates.json and is
 *   NOT included in the block table.
 * - Text-only Cards variant: 1 column per card (no image). One row per card.
 * - Each source card lives at: .card-container > .two-card-content (direct child),
 *   with content inside .subheadline-regular containing a quote <p> and a name <p>.
 */
export default function parse(element, { document }) {
  // Find each testimonial card. Use direct-child scope on the card container so we
  // don't accidentally pick up nested wrappers, with a fallback for cross-page variation.
  const cardContainer = element.querySelector('.card-container, [class*="card-container"]');
  let cardEls = [];
  if (cardContainer) {
    cardEls = Array.from(cardContainer.querySelectorAll(':scope > .two-card-content, :scope > .enhanced-txt-cm'));
  }
  if (cardEls.length === 0) {
    // Fallback: look anywhere within the element for testimonial card units.
    cardEls = Array.from(element.querySelectorAll('.two-card-content, .enhanced-txt-cm.two-card-content'));
  }

  // Empty-block guard: if no cards were found, leave the source content in place.
  if (cardEls.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  cardEls.forEach((card) => {
    // The actual testimonial text lives inside .subheadline-regular (preferred) or
    // .enhanced-txt-body as a fallback. Each card has two <p>s: quote, then name.
    const textRoot = card.querySelector('.subheadline-regular') || card.querySelector('.enhanced-txt-body') || card;
    const paragraphs = Array.from(textRoot.querySelectorAll(':scope > p'));

    // If :scope > p didn't catch them (variation in DOM nesting), fall back to all <p>.
    const paras = paragraphs.length ? paragraphs : Array.from(textRoot.querySelectorAll('p'));

    if (paras.length === 0) {
      // Skip cards that have no usable text content.
      return;
    }

    // Single column per card (text-only Cards variant).
    cells.push([paras]);
  });

  // If filtering removed every card, bail gracefully.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards-testimonials',
    cells,
  });

  // Preserve the section heading (e.g. "Hear from our customers") that lives
  // alongside the block in the source DOM so it survives as default content
  // above the block in the imported page.
  const heading = element.querySelector('.ps-mid-page-title-wrapper h2, .ps-mid-page-title');
  const replacements = [];
  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = heading.textContent.replace(/\s+/g, ' ').trim();
    replacements.push(h2);
  }
  replacements.push(block);
  element.replaceWith(...replacements);
}
