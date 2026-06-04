import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Decorate hero-banner block.
 * Authored as a single row with two cells: image and overlay text content.
 * The image is layered behind the heading/copy via CSS.
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
      if (cell.querySelector('picture, img')) cell.classList.add('hero-banner-image');
      else cell.classList.add('hero-banner-content');
    });
  });
}
