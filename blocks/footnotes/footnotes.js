/**
 * Decorate the footnotes block.
 * Renders a numbered footnote list (each item gets an anchor id `fn-{n}`),
 * followed by any optional disclosure paragraphs (e.g., Equal Housing Lender
 * notice, division statement). Each row in the authored block becomes one
 * footnote item; rows with a single paragraph and no leading number are kept
 * as plain disclosure paragraphs at the end.
 *
 * Expected authored structure:
 *   | 1 | First footnote text. |
 *   | 2 | Second footnote text. |
 *   | ... |
 *   | (Equal Housing Lender icon) | Equal Housing Lender |
 *   | | Disclosure paragraph(s).  |
 *
 * @param {Element} block The footnotes block element
 */
export default function decorate(block) {
  const ol = document.createElement('ol');
  ol.className = 'footnotes-list';

  const trailing = [];

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const firstCellText = cells[0] ? cells[0].textContent.trim() : '';
    const isNumbered = /^\d+$/.test(firstCellText);

    if (isNumbered) {
      const li = document.createElement('li');
      li.id = `fn-${firstCellText}`;
      li.value = parseInt(firstCellText, 10);

      // Combine remaining cells into the list item body.
      cells.slice(1).forEach((cell) => {
        while (cell.firstChild) li.append(cell.firstChild);
      });

      ol.append(li);
    } else {
      // Trailing disclosure / housing-notice rows preserved verbatim.
      const div = document.createElement('div');
      div.className = 'footnotes-disclosure';
      cells.forEach((cell) => {
        while (cell.firstChild) div.append(cell.firstChild);
      });
      // Tag the Equal Housing Lender notice so it can be styled (bold label,
      // optional icon). On the source this is `.ps-footnote-footer` and is
      // rendered bold. Match on the icon (picture/img) OR the label text,
      // since the icon may arrive as a glyph rather than an image.
      if (div.querySelector('picture, img')
        || /equal housing lender/i.test(div.textContent)) {
        div.classList.add('footnotes-housing');
      }
      trailing.push(div);
    }
  });

  block.replaceChildren(ol, ...trailing);
}
