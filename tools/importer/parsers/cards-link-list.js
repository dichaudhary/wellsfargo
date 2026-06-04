/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-link-list variant.
 *
 * Source: Wells Fargo "Helpful resources" section on personal-loans, which is
 *   div.card-container.three-card.card-left.card-theme1
 *     > div.three-card-content (one per column)
 *         > div.enhanced-txt-body
 *             > .title2-SemiBold (the column heading text)
 *             > .subheadline-regular > .link-list-desc > ul (the link list)
 *
 * Output: 1-column block, one row per column. Each row's single cell holds the
 * column heading (promoted to <h3>) and the original <ul> of links.
 *
 * The section heading "Helpful resources" is captured as section default
 * content, so this parser deliberately omits it.
 */
export default function parse(element, { document }) {
  const columns = element.querySelectorAll('.three-card-content, [class*="three-card-content"]');
  const cells = [];

  columns.forEach((col) => {
    const titleNode = col.querySelector('.title2-SemiBold, [class*="title"]');
    const list = col.querySelector('ul');

    const cellChildren = [];

    if (titleNode) {
      const h3 = document.createElement('h3');
      h3.textContent = titleNode.textContent.replace(/\s+/g, ' ').trim();
      cellChildren.push(h3);
    }

    if (list) cellChildren.push(list);

    if (cellChildren.length) cells.push([cellChildren]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards-link-list',
    cells,
  });

  // Preserve the section heading (e.g. "Helpful resources") above the block.
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
