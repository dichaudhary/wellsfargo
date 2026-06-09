/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-image variant. Base: cards.
 * Source: Wells Fargo product landing page (e.g. /mortgage/, /personal-loans/)
 *
 * Source DOM:
 *   <div class="card-background-white text-aligned-center">
 *     <div class="ps-mid-page-title-wrapper"> ... <h2/> </div>  (section heading; not part of cards block)
 *     <div class="card-container three-card ...">
 *       <div class="enhanced-txt-cm three-card-content presentedElement">
 *         <div><div><img/></div></div>
 *         <div class="enhanced-txt-body">
 *           <div class="title2-SemiBold"><h3>Title</h3></div>
 *           <div class="subheadline-regular">Description with <sup><a/></sup> footnote refs</div>
 *           <p><a class="ps-btn-text">Learn more &gt;</a></p>
 *         </div>
 *       </div>
 *       ... 2 more cards (3-up grid) ...
 *     </div>
 *   </div>
 *
 * Target table (from library example): 2 columns per card row.
 *   Row 1: block name 'cards-image'
 *   Row N: [image] | [heading + description + CTA]
 */
export default function parse(element, { document }) {
  // Each card is a `.three-card-content` (also marked `.presentedElement`).
  // Use this class to pick out card root nodes regardless of nesting depth in source.
  const cardEls = Array.from(
    element.querySelectorAll('.three-card-content, .enhanced-txt-cm.presentedElement'),
  );

  // De-duplicate in case both selectors match the same element.
  const uniqueCards = [];
  const seen = new Set();
  cardEls.forEach((c) => {
    if (!seen.has(c)) {
      seen.add(c);
      uniqueCards.push(c);
    }
  });

  const cells = [];

  uniqueCards.forEach((card) => {
    // Card image: first <img> in the card. Fallback selectors handle future variation.
    const image = card.querySelector('img');

    // Card heading: <h3> inside .title2-SemiBold; fallback to any heading inside
    // the card. Some variants put the title as plain text directly in
    // .title2-SemiBold (no inner heading element) — synthesize an <h3> then.
    let heading = card.querySelector('.title2-SemiBold h3, h3, h2, h4');
    if (!heading) {
      const titleDiv = card.querySelector('.title2-SemiBold');
      const titleText = titleDiv && titleDiv.textContent.replace(/\s+/g, ' ').trim();
      if (titleText) {
        heading = document.createElement('h3');
        heading.textContent = titleText;
      }
    }

    // Description: .subheadline-regular div carries description text plus inline footnote refs.
    const description = card.querySelector('.subheadline-regular, .enhanced-txt-body > div:not(.title2-SemiBold):not(.ps-btn-text)');

    // CTA link: "Learn more >" anchor. Match by class first, then any anchor in trailing <p>.
    const cta = card.querySelector('a.ps-btn-text, .enhanced-txt-body p a, p a');

    // Skip cards that have no meaningful content (defensive guard).
    if (!image && !heading && !description && !cta) return;

    const textCell = [];
    if (heading) textCell.push(heading);
    if (description) textCell.push(description);
    if (cta) textCell.push(cta);

    cells.push([image || '', textCell]);
  });

  // Empty-block guard: if no cards found, unwrap and bail.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards-image',
    cells,
  });

  // Preserve the section heading (e.g. "Get more with your mortgage") so it
  // renders as default content above the block in the imported page.
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
