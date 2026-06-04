/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-contact — text-only contact card grid.
 * Base block: cards (no-images variant; 1 column per card).
 * Source: https://www.wellsfargo.com/mortgage/ (and similar product landing pages)
 *
 * Source DOM (validated against migration-work/block-context/cards-contact/source.html):
 *   div.card-background-white.text-aligned-center
 *     └─ div.ps-mid-page-title-wrapper > h2.ps-mid-page-title       (section title — handled at section level)
 *     └─ div.card-container.four-card
 *          └─ div.enhanced-txt-cm.text-aligned-left  (one per card; 4 cards typical)
 *               └─ div > div.enhanced-txt-body
 *                    ├─ div.title2-SemiBold > h3                    (card heading)
 *                    └─ div.subheadline-regular                     (card body: phone+hours OR description+CTA)
 *
 * Output (cards no-images variant — 1 column):
 *   Row 1: cards-contact (block name)
 *   Row 2..N: one card per row, single cell containing [h3, ...body nodes]
 *
 * Cross-instance variations handled:
 *   - Card body may be either phone+hours-of-operation paragraphs OR description+CTA link.
 *   - subheadline-regular may have an extra wrapper <div>; we extract direct content nodes either way.
 *   - Card count may vary (selector .four-card hints 4 but we accept any count of cards).
 */
export default function parse(element, { document }) {
  // Find the cards container. Try the specific class chain first, then fall back to any
  // child grid that contains enhanced-txt-cm cards.
  const cardsContainer = element.querySelector(
    '.card-container.four-card, .card-container, [class*="card-container"]',
  );

  // Each card is a div.enhanced-txt-cm inside the container. Use :scope > to avoid picking up
  // any nested matches outside the immediate card grid.
  const cards = cardsContainer
    ? Array.from(cardsContainer.querySelectorAll(':scope > .enhanced-txt-cm'))
    : Array.from(element.querySelectorAll(':scope > .card-container > .enhanced-txt-cm'));

  // Empty-block guard: if no cards found, leave content in place and skip block creation.
  if (!cards.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Build cells: one row per card (single cell each). Block name is supplied
  // via createBlock's `name`, no need for a header row in `cells`.
  const cells = [];

  cards.forEach((card) => {
    // Heading lives inside .title2-SemiBold; fall back to any h3 within the card.
    const heading = card.querySelector('.title2-SemiBold h3, h3');

    // Body is everything inside .subheadline-regular. Sometimes there's an extra wrapper div
    // (e.g. <div class="subheadline-regular"><div><p>...</p></div></div>) — unwrap by collecting
    // direct children of either the wrapper itself or its first nested div container.
    const bodyEl = card.querySelector('.subheadline-regular');
    const bodyNodes = [];
    if (bodyEl) {
      // If the only direct child is a single <div>, descend into it to get the real nodes;
      // otherwise use the body element's direct children.
      const directChildren = Array.from(bodyEl.children);
      const source =
        directChildren.length === 1 && directChildren[0].tagName === 'DIV'
          ? directChildren[0]
          : bodyEl;
      Array.from(source.children).forEach((node) => {
        bodyNodes.push(node);
      });
    }

    // Card cell = heading + all body nodes (phone span+hours, or description + CTA link).
    const cardCell = [];
    if (heading) cardCell.push(heading);
    cardCell.push(...bodyNodes);

    // Skip empty cards (defensive — shouldn't happen on the validated source).
    if (cardCell.length === 0) return;

    cells.push([cardCell]);
  });

  // Bail if no cards extracted.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards-contact',
    cells,
  });

  // Preserve the section heading (e.g. "Talk to a mortgage consultant") so it
  // renders as default content above the block.
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
