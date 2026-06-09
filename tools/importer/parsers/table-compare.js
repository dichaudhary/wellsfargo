/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the table-compare variant (table block).
 *
 * Source: Wells Fargo SBA page div.rsk-compare-table
 *   .table
 *     .table-heading-wrapper > h2.table-heading-text          (table title)
 *     .row-group-header-wrapper
 *       .table-row.center > span.table-column.column1/.column2 > p   (column labels)
 *     (repeated, one logical row per row-header)
 *       .table-row.row-header-wrapper > span.row-header        (row label)
 *       .table-row > span.table-column.column1 / .column2      (the two values)
 *
 * Output: table block. First row is the header
 *   [ '' | <col1 label> | <col2 label> ]
 * followed by one row per feature
 *   [ <row-header> | <col1 value> | <col2 value> ].
 *
 * The heading is emitted as an <h2> above the block (section default content).
 */
export default function parse(element, { document }) {
  const table = element.querySelector('.table') || element;

  // Column labels (SBA 7(a) / SBA 504). Take the first header group only;
  // the page duplicates it as a sticky scroll header which we ignore.
  const headerGroup = table.querySelector('.row-group-header-wrapper');
  const col1Label = headerGroup
    && headerGroup.querySelector('.table-column.column1 p, .table-column.column1');
  const col2Label = headerGroup
    && headerGroup.querySelector('.table-column.column2 p, .table-column.column2');

  const rows = [];

  const headerCell1 = document.createElement('div');
  const headerCell2 = document.createElement('div');
  if (col1Label) headerCell1.textContent = col1Label.textContent.replace(/\s+/g, ' ').trim();
  if (col2Label) headerCell2.textContent = col2Label.textContent.replace(/\s+/g, ' ').trim();
  rows.push([document.createElement('div'), headerCell1, headerCell2]);

  // Each feature row is a .row-header-wrapper followed by a value .table-row.
  table.querySelectorAll('.table-row.row-header-wrapper').forEach((headerRow) => {
    const label = headerRow.querySelector('.row-header');

    // The value row is the next .table-row sibling that is not itself a header.
    let valueRow = headerRow.nextElementSibling;
    while (valueRow
      && !(valueRow.classList.contains('table-row')
        && !valueRow.classList.contains('row-header-wrapper'))) {
      valueRow = valueRow.nextElementSibling;
    }
    if (!valueRow) return;

    const v1 = valueRow.querySelector('.table-column.column1');
    const v2 = valueRow.querySelector('.table-column.column2');

    const labelCell = document.createElement('div');
    if (label) labelCell.textContent = label.textContent.replace(/\s+/g, ' ').trim();

    const cell1 = document.createElement('div');
    if (v1) cell1.append(...v1.childNodes);
    const cell2 = document.createElement('div');
    if (v2) cell2.append(...v2.childNodes);

    rows.push([labelCell, cell1, cell2]);
  });

  if (rows.length <= 1) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'table-compare',
    cells: rows,
  });

  const replacements = [];
  const heading = table.querySelector('.table-heading-text, h2');
  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = heading.textContent.replace(/\s+/g, ' ').trim();
    replacements.push(h2);
  }
  replacements.push(block);
  element.replaceWith(...replacements);
}
