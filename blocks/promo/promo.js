/**
 * Decorate the promo block.
 *
 * Authored as a single row with two cells:
 *   | (phone screenshot image) | (heading + description + app-store badges) |
 *
 * The image-only cell gets `promo-media`; the cell containing the heading
 * and copy gets `promo-content`. Because the content cell also holds
 * app-store badge images (each an <a><picture>), we identify the media cell
 * as the one whose ONLY content is a picture (no heading/text), rather than
 * "any cell that contains a picture".
 *
 * The trailing badge links (<p><a><picture></a></p>) are grouped into a
 * single `.promo-badges` row so they sit side by side, matching the source
 * App Store / Google Play layout.
 *
 * @param {Element} block The promo block element
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;

  const cells = [...row.children];
  cells.forEach((cell) => {
    const hasText = cell.querySelector('h1, h2, h3, h4, h5, h6')
      || [...cell.querySelectorAll('p')].some((p) => p.textContent.trim() && !p.querySelector('picture'));
    if (!hasText && cell.querySelector('picture')) {
      cell.classList.add('promo-media');
    } else {
      cell.classList.add('promo-content');
    }
  });

  const content = row.querySelector('.promo-content');
  if (!content) return;

  // Group the app-store badge links (paragraphs whose only content is an
  // <a> wrapping a picture) into a single flex row.
  const badgeParas = [...content.querySelectorAll('p')].filter((p) => {
    const a = p.querySelector('a');
    return a && a.querySelector('picture') && p.textContent.trim() === '';
  });

  if (badgeParas.length) {
    const badges = document.createElement('div');
    badges.className = 'promo-badges';
    badgeParas[0].before(badges);
    badgeParas.forEach((p) => {
      const a = p.querySelector('a');
      badges.append(a);
      p.remove();
    });
  }
}
