/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-text variant (Cards block, text-only / no-images, 1 column).
 *
 * Base block: cards.
 * Source: Wells Fargo product landing pages (mortgage, personal-loans).
 *   .small-promo-combined > .ps-marketing-small-promo-items > .ps-marketing-small-promo-item
 *   Each card: heading (h3), description (p.ps-marketing-text-content), CTA link.
 *
 * Output: 1-column Cards block. Each subsequent row is one card with
 *   [heading, description, ctaLink] inside a single cell. The decorative
 *   placeholder <img> (a generic spacer used by the source CMS) is omitted
 *   so cards.js can render a "Cards (text)" variant.
 *
 * The section heading (".ps-mid-page-title-wrapper h2") is intentionally NOT
 * included here — it is captured separately as section default content.
 */
export default function parse(element, { document }) {
  // Locate each card item. Primary selector matches the documented Wells Fargo
  // markup; the class-substring selector is a defensive fallback. The plural
  // container `.ps-marketing-small-promo-items` also matches the substring
  // selector, so exclude it — otherwise it surfaces as a phantom leading card.
  const cardItems = element.querySelectorAll(
    '.ps-marketing-small-promo-item:not(.ps-marketing-small-promo-items), [class*="small-promo-item"]:not(.ps-marketing-small-promo-items)',
  );

  const cells = [];

  cardItems.forEach((item) => {
    // Heading: h3 is the documented card title; fall back to other heading levels.
    const heading = item.querySelector('h3, h4, h2, [class*="title"]');

    // Description: explicit class first, then any descriptive paragraph.
    const description = item.querySelector(
      '.ps-marketing-text-content, .ps-marketing-text > p:not(.learn-more):not(.learn-more-mobile)',
    );

    // CTA link: prefer the desktop ".learn-more" variant. The source duplicates
    // the same link in ".learn-more-mobile"; use querySelector OR chain so we
    // pick exactly one (avoid double-selection). Fall back to any anchor inside
    // .ps-marketing-promo-link, then any anchor outside the heading.
    let ctaLink = item.querySelector('.ps-marketing-promo-link a')
      || item.querySelector('p.learn-more a')
      || item.querySelector('p.learn-more-mobile a');
    if (!ctaLink) {
      // Last-resort fallback: first anchor in the card that isn't inside the heading.
      const anchors = Array.from(item.querySelectorAll('a'))
        .filter((a) => !a.closest('h1, h2, h3, h4, h5, h6'));
      if (anchors.length) ctaLink = anchors[0];
    }

    // Skip empty cards (defensive — handles instances variations).
    if (!heading && !description) return;

    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (description) contentCell.push(description);
    if (ctaLink) contentCell.push(ctaLink);

    // Robust empty-card guard. The Wells Fargo CMS emits decorative/spacer
    // promo items whose heading element exists but contains only zero-width
    // glyphs (ZWSP U+200B, ZWNJ U+200C, ZWJ U+200D, BOM U+FEFF) and/or
    // whitespace. Element-existence checks above let those through and render
    // a blank leading card that breaks the grid. Compute the combined visible
    // text of heading + description (the CTA alone is not enough to justify a
    // card) and skip the item if nothing meaningful remains.
    const meaningfulText = [heading, description]
      .filter(Boolean)
      .map((el) => (el.textContent || ''))
      .join('')
      // strip zero-width and BOM characters, then collapse whitespace
      .replace(/[​‌‍﻿]/g, '')
      .replace(/\s+/g, '')
      .trim();
    if (!contentCell.length || !meaningfulText) return;

    cells.push([contentCell]);
  });

  // Empty-block guard: if no cards were extracted, leave the original DOM intact.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards-text',
    cells,
  });

  // Preserve the section heading (e.g. "Grow your knowledge with our mortgage
  // tools") as default content above the block.
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
