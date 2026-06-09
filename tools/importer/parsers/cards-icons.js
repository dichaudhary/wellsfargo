/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-icons.
 * Variant: 4-up promo grid with icon + heading + description + 'Learn more' link.
 * Base block: cards.
 * Source: Wells Fargo product landing pages (mortgage, personal-loans).
 * Variant: 4-up (or 3-up) promo grid with icon + heading + description + 'Learn more' link.
 *
 * Source DOM:
 *   div.small-promo-combined
 *     div.ps-mid-page-title-wrapper        <- section heading (default content, NOT extracted)
 *     div.ps-marketing-small-promo-items   <- (may not always exist as wrapper)
 *       div.ps-marketing-small-promo-item  <- one per card (repeats)
 *         div.mark-small-promo-icon        <- decorative leading bullet (NOT extracted)
 *           img                              (decorative bullet image — skipped)
 *           div.ps-marketing-icon-container
 *             div.ps-marketing-icon
 *               img                        <- the actual card icon
 *           div.ps-marketing-text
 *             h3                           <- card title
 *             p.ps-marketing-text-content  <- card description
 *             p.learn-more-mobile          <- mobile CTA (duplicate of desktop, skipped)
 *           div.ps-marketing-promo-link
 *             p.learn-more
 *               span > a                   <- CTA link (canonical desktop)
 *     div.ps-padding                       <- trailing 'Learn more' CTA (section default, NOT extracted)
 *
 * Output (per block library example):
 *   Row 1: ['cards-icons']
 *   Row N: [iconImage, [heading, description, ctaLink]]
 */
export default function parse(element, { document }) {
  // Find all card items within the block. Use querySelectorAll so it works whether
  // or not the items are wrapped in .ps-marketing-small-promo-items.
  const items = Array.from(element.querySelectorAll(':scope .ps-marketing-small-promo-item'));

  const cells = [];

  items.forEach((item) => {
    // ICON: the real content icon lives inside .ps-marketing-icon. The leading
    // <img> directly under .mark-small-promo-icon is a decorative bullet — skip it.
    const icon = item.querySelector('.ps-marketing-icon img, .ps-marketing-icon-container img');

    // HEADING: card title. Some pages author it as h2/h4 instead of h3.
    const heading = item.querySelector('.ps-marketing-text h3, .ps-marketing-text h2, .ps-marketing-text h4, h3, h2, h4');

    // DESCRIPTION: card body copy.
    const description = item.querySelector('.ps-marketing-text p.ps-marketing-text-content, .ps-marketing-text p:not(.learn-more):not(.learn-more-mobile)');

    // CTA: prefer the canonical desktop 'learn-more' link inside .ps-marketing-promo-link.
    // Fall back to the mobile-only variant when the desktop wrapper is absent. The
    // mobile copy is skipped when the desktop one exists to avoid duplication.
    let ctaLink = item.querySelector('.ps-marketing-promo-link p.learn-more a, .ps-marketing-promo-link a');
    if (!ctaLink) {
      ctaLink = item.querySelector('p.learn-more-mobile a');
    }

    // Skip cards that have neither heading nor description (defensive guard).
    if (!heading && !description && !icon) return;

    // Build the right-hand text cell: heading + description + optional CTA.
    const textCell = [];
    if (heading) textCell.push(heading);
    if (description) textCell.push(description);
    if (ctaLink) textCell.push(ctaLink);

    // Each row is a card: [icon, textCell].
    cells.push([icon || '', textCell]);
  });

  // Empty-block guard: if we found no cards at all, leave the original DOM in place.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards-icons',
    cells,
  });

  // Preserve the section heading (e.g. "Homebuying starts here") so it survives
  // as default content above the block in the imported page. Also preserve any
  // trailing CTA paragraph in .ps-padding.
  const heading = element.querySelector('.ps-mid-page-title-wrapper h2, .ps-mid-page-title');
  const trailing = element.querySelector(':scope > .ps-padding');
  const replacements = [];
  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = heading.textContent.replace(/\s+/g, ' ').trim();
    replacements.push(h2);
  }
  replacements.push(block);
  if (trailing) {
    const cloneRoot = document.createElement('div');
    [...trailing.children].forEach((c) => cloneRoot.appendChild(c.cloneNode(true)));
    [...cloneRoot.children].forEach((c) => replacements.push(c));
  }
  element.replaceWith(...replacements);
}
