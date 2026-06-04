/* eslint-disable */
/* global WebImporter */
/**
 * Parser for promo variant. Base: promo.
 * Source: Wells Fargo product landing page (e.g. /personal-loans/, /mortgage/)
 * Generated: 2026-06-03.
 *
 * Source DOM:
 *   <div class="ps-large-promo-full-container">
 *     <div class="ps-large-promo-full">
 *       <div class="ps-large-promo-full-wrapper">
 *         <div class="ps-promo-full-items">
 *           <div class="ps-promo-full-item">
 *             <div class="ps-promo-full-image">
 *               <img src="..." alt="">
 *             </div>
 *             <div class="ps-promo-full-content">
 *               <h2>Heading text<sup><a href="#tcm:..."/></sup>...</h2>
 *               <p>Description...</p>
 *               <div class="ps-promo-full-links">
 *                 <a class="ps-btn-secondary" href="...">CTA</a>
 *               </div>
 *             </div>
 *           </div>
 *         </div>
 *       </div>
 *     </div>
 *   </div>
 *
 * Target table (from library example): single content row, two columns.
 *   Row 1: block name 'promo'
 *   Row 2: [image] | [heading + description + CTA]
 *
 * Notes:
 * - Inline `<sup><a href="#tcm:..."></a></sup>` footnote markers in the heading are preserved
 *   as-is. The cleanup transformer rewrites those hrefs to `#fn-N`.
 * - Multiple CTAs are supported via the `.ps-promo-full-links a` collection, though
 *   typical content has a single CTA.
 */
export default function parse(element, { document }) {
  // Source has a single .ps-promo-full-item; treat the first one as the promo body.
  // Fallback to the element itself if the inner wrapper isn't present.
  const item = element.querySelector('.ps-promo-full-item') || element;

  // Image: first <img> inside the image wrapper, with fallbacks.
  const image = item.querySelector('.ps-promo-full-image img, img');

  // Heading: <h2> inside the content wrapper, with fallbacks across heading levels.
  const heading = item.querySelector('.ps-promo-full-content h2, h2, h1, h3');

  // Description: first <p> inside the content wrapper. Use :scope > so we only match
  // direct paragraph children of the content area and don't accidentally pick up
  // copy from nested wrappers.
  const description = item.querySelector('.ps-promo-full-content > p, .ps-promo-full-content p');

  // CTA link(s): anchors inside the dedicated links wrapper. Fall back to known
  // button classes if the wrapper is absent on a variant page.
  const ctaLinks = Array.from(
    item.querySelectorAll('.ps-promo-full-links a, .ps-promo-full-content a.ps-btn-secondary, .ps-promo-full-content a.ps-btn-primary, .ps-promo-full-content a.ps-btn-text'),
  );

  // De-duplicate CTAs in case the fallback selectors match the same anchor.
  const uniqueCtas = [];
  const seenCtas = new Set();
  ctaLinks.forEach((a) => {
    if (!seenCtas.has(a)) {
      seenCtas.add(a);
      uniqueCtas.push(a);
    }
  });

  // Empty-block guard: if no meaningful content was found, unwrap and bail.
  if (!image && !heading && !description && uniqueCtas.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Build the right-hand content cell: heading, description, then CTA(s).
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
