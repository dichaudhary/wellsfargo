/* eslint-disable */
/* global WebImporter */
/**
 * Parser for footnotes block variant.
 * Base block: footnotes (custom block, see /blocks/footnotes/).
 * Source: Wells Fargo product landing pages (mortgage, personal-loans).
 *
 * Source DOM:
 *   div.ps-footnote
 *     div.ps-footnote-text[id="tcm:..."]            <- numbered footnote row (repeats)
 *       p.c20Content
 *         span.c20no       "1. "                    <- numeric prefix (with period + space)
 *         span.c20Text     "..."                    <- explanatory body (plain text or one-or-more <p>)
 *     div.ps-footnote-footer                        <- Equal Housing Lender notice
 *       span.ps-home-lending-icon                   <- icon glyph
 *       span "Equal Housing Lender"
 *     div.ps-footnote-text                          <- trailing disclosure rows (no id, no number)
 *       p "Wells Fargo Home Mortgage is a division ..."
 *     div.ps-footnote-text
 *       p "DT1-07152026-12-8344616-1.1"             <- tracking ID
 *
 * Output (per block library example & decorator contract in blocks/footnotes/footnotes.js):
 *   Row 1: ['footnotes']                             <- block header
 *   Numbered rows:    [number, bodyContent]          <- number is bare digit (no period)
 *   Disclosure rows:  [singleCellContent]            <- single cell, no leading number
 *
 * The block decorator assigns id="fn-{number}" to numbered rows so existing
 * <sup><a href="#fn-N"> references in the page resolve correctly.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Iterate direct children in source order so numbered footnotes and
  // trailing disclosure rows preserve their relative ordering.
  const children = Array.from(element.children);

  children.forEach((child) => {
    // --- Numbered footnote row: div.ps-footnote-text containing p.c20Content ---
    const c20Content = child.querySelector(':scope > p.c20Content');
    if (c20Content) {
      const numSpan = c20Content.querySelector(':scope > span.c20no');
      const textSpan = c20Content.querySelector(':scope > span.c20Text');
      const rawNum = numSpan ? numSpan.textContent.trim() : '';
      // Strip the trailing period (e.g. "1." → "1"). Decorator regex is /^\d+$/.
      const numMatch = rawNum.match(/^(\d+)\.?$/);
      const number = numMatch ? numMatch[1] : '';

      // Body cell: collect content from c20Text PLUS any sibling block-level
      // elements (<p>, <ul>, <ol>) inside the same <div class="ps-footnote-text">.
      // Wells Fargo authors the body in two places interchangeably:
      //   - inside <span class="c20Text"> (e.g. footnote #1, #5)
      //   - as sibling <p> elements that follow <p class="c20Content"> in the
      //     same <div> (e.g. footnotes #2, #3, #4, #6, #7 — multi-paragraph,
      //     nested list, or long-form copy).
      const bodyFragment = document.createDocumentFragment();
      if (textSpan) {
        const spanText = (textSpan.textContent || '').replace(/\s|‌/g, '');
        const spanHasBlockChildren = Array.from(textSpan.children).some(
          (el) => /^(p|ul|ol|div|h[1-6])$/i.test(el.tagName),
        );
        if (spanHasBlockChildren) {
          while (textSpan.firstChild) bodyFragment.append(textSpan.firstChild);
        } else if (spanText.length > 0) {
          const p = document.createElement('p');
          while (textSpan.firstChild) p.append(textSpan.firstChild);
          bodyFragment.append(p);
        }
      }
      // Append any block-level siblings of c20Content (same <div>) that
      // come after it. Skip empty or zwnj-only paragraphs.
      let sibling = c20Content.nextElementSibling;
      while (sibling) {
        const tag = sibling.tagName.toLowerCase();
        if (/^(p|ul|ol|div|h[1-6])$/i.test(tag)) {
          const text = (sibling.textContent || '').replace(/\s|‌/g, '');
          if (text.length > 0) bodyFragment.append(sibling.cloneNode(true));
        }
        sibling = sibling.nextElementSibling;
      }

      // Skip rows that have no number AND no body (defensive guard).
      if (!number && !bodyFragment.childNodes.length) return;

      cells.push([number, bodyFragment]);
      return;
    }

    // --- Equal Housing Lender footer: div.ps-footnote-footer ---
    if (child.classList && child.classList.contains('ps-footnote-footer')) {
      // Single cell containing the housing-notice content. Preserve the
      // icon span and label so the decorator can render them verbatim.
      const fragment = document.createDocumentFragment();
      while (child.firstChild) fragment.append(child.firstChild);
      if (fragment.childNodes.length) cells.push([fragment]);
      return;
    }

    // --- Trailing disclosure row: div.ps-footnote-text with no c20Content ---
    // (e.g. division statement, tracking ID — usually a single <p>)
    if (child.classList && child.classList.contains('ps-footnote-text')) {
      const fragment = document.createDocumentFragment();
      while (child.firstChild) fragment.append(child.firstChild);
      if (fragment.childNodes.length) cells.push([fragment]);
    }
  });

  // Empty-block guard: if no rows were produced, leave original DOM in place.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'footnotes',
    cells,
  });

  element.replaceWith(block);
}
