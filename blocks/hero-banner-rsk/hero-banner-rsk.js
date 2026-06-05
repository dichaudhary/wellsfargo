import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Decorate hero-banner-rsk block.
 * The "rsk" marquee variant: a full-width banner image stacked ABOVE a centered
 * content block (heading + copy + CTA), as opposed to the overlay-style
 * hero-banner. Authored as a single row with two cells: image and content.
 */
export default function decorate(block) {
  // Re-optimize picture for responsive delivery.
  const img = block.querySelector('img');
  if (img) {
    const picture = img.closest('picture');
    if (picture) {
      picture.replaceWith(createOptimizedPicture(img.src, img.alt || '', false, [{ width: '1600' }]));
    }
  }

  // Tag image vs content cells for CSS styling.
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      if (cell.querySelector('picture, img')) cell.classList.add('hero-banner-rsk-image');
      else cell.classList.add('hero-banner-rsk-content');
    });
  });
}
