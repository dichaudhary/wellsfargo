import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Decorate the cards-icons block.
 * Each row produces a card with: optional small icon image, heading, description,
 * and a "Learn more" style text link. Designed for 4-up promo grids.
 *
 * Expected authored structure (one card per row):
 *   | (icon image) | (h3 heading + description paragraph + link) |
 *
 * @param {Element} block The cards-icons block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-icons-card-icon';
      } else {
        div.className = 'cards-icons-card-body';
      }
    });

    ul.append(li);
  });

  // Optimize icon images with smaller default width (these are icons, not photos).
  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '120' }]),
    );
  });

  block.replaceChildren(ul);
}
