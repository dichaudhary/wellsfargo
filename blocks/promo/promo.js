/**
 * Decorate the promo block.
 *
 * Authored as a single row with two cells:
 *   | (image) | (heading + description + CTA) |
 *
 * The image side gets `promo-media`, the text side gets `promo-content`.
 * On mobile the cells stack vertically; on desktop the content cell is
 * positioned absolutely and overlays the left side of the image.
 *
 * The CTA link (final standalone <p><a> in the content cell) is upgraded
 * to a button so it picks up the Wells Fargo secondary outline styling.
 *
 * @param {Element} block The promo block element
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;

  const cells = [...row.children];
  cells.forEach((cell) => {
    if (cell.querySelector('picture')) {
      cell.classList.add('promo-media');
    } else {
      cell.classList.add('promo-content');
    }
  });

  // Promote the trailing standalone <p><a> to a button styled link so the
  // global a.button:any-link rules apply.
  const content = row.querySelector('.promo-content');
  if (content) {
    const lastP = content.querySelector('p:last-of-type');
    if (lastP) {
      const a = lastP.querySelector('a');
      if (a && lastP.textContent.trim() === a.textContent.trim()) {
        a.classList.add('button');
        lastP.classList.add('button-container');
      }
    }
  }
}
