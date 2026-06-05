import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Decorate the cards-image-4up block.
 * 4-up grid of image-led cards. Each card has a featured image at top followed
 * by heading, description and a "Learn more >" text link.
 *
 * Variant of cards-image: identical content model and decoration, but renders
 * four cards across on desktop (insights / news / careers rows on the Wells
 * Fargo CIB landing page) instead of three.
 *
 * Expected authored structure (one card per row):
 *   | (featured image) | (h3 + description paragraph + link) |
 *
 * @param {Element} block The cards-image-4up block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-image-4up-card-image';
      } else {
        div.className = 'cards-image-4up-card-body';
      }
    });

    ul.append(li);
  });

  // Optimize images.
  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ width: '500' }]),
    );
  });

  // Wells Fargo footnote sup-links use <span class="hidden"> to provide the
  // "Opens a modal dialog for footnote " prefix to screen readers, with only
  // the number visible. The plain HTML import flattens the span away so the
  // long descriptor becomes the visible link text. Strip that prefix back out
  // and keep the trailing footnote number for visual display.
  ul.querySelectorAll('.cards-image-4up-card-body a[href^="#tcm:"]').forEach((a) => {
    const original = a.textContent.trim();
    const match = original.match(/^Opens a modal dialog for footnote\s+(\S+)$/i);
    if (match) {
      const number = match[1];
      a.setAttribute('aria-label', original);
      a.textContent = '';
      const sup = document.createElement('sup');
      sup.textContent = number;
      a.append(sup);
    }
  });

  // The plain HTML import splits inline runs (text/<sup>/<a><sup>/text) into
  // multiple sibling <p> elements, which renders as broken-up lines instead of
  // a flowing paragraph. Re-flow consecutive <p> fragments back into a single
  // paragraph when one of them is a short fragment (single sup, single
  // footnote link, or a text run that does not end with sentence-final
  // punctuation).
  ul.querySelectorAll('.cards-image-4up-card-body').forEach((body) => {
    const paragraphs = [...body.children].filter((c) => c.tagName === 'P');

    function isFragment(p) {
      if (!p) return false;
      const onlyChild = p.children.length === 1 ? p.children[0] : null;
      if (onlyChild && onlyChild.tagName === 'SUP' && p.textContent.trim().length <= 3) return true;
      if (onlyChild && onlyChild.tagName === 'A' && onlyChild.matches('a[href^="#tcm:"]')) return true;
      // Trailing learn-more link is a real, separate paragraph -- never merge.
      if (onlyChild && onlyChild.tagName === 'A' && !onlyChild.matches('a[href^="#tcm:"]')) return false;
      // Plain text fragment: short and lacks terminal punctuation.
      const txt = p.textContent.trim();
      if (txt.length === 0) return true;
      if (txt.length < 80 && !/[.!?:]$/.test(txt)) return true;
      return false;
    }

    function isStandaloneCta(p) {
      const onlyChild = p.children.length === 1 ? p.children[0] : null;
      return !!(onlyChild && onlyChild.tagName === 'A' && !onlyChild.matches('a[href^="#tcm:"]'));
    }

    let i = 0;
    while (i < paragraphs.length - 1) {
      const current = paragraphs[i];
      const next = paragraphs[i + 1];
      // Stop merging once we hit the trailing CTA paragraph in either slot.
      if (isStandaloneCta(current) || isStandaloneCta(next)) {
        i += 1;
      } else if (isFragment(current) || isFragment(next)) {
        // Append a space then absorb next's children into current.
        if (current.textContent && !/\s$/.test(current.textContent)) {
          current.append(' ');
        }
        while (next.firstChild) current.append(next.firstChild);
        next.remove();
        paragraphs.splice(i + 1, 1);
        // do not advance i: keep merging into current.
      } else {
        i += 1;
      }
    }
  });

  block.replaceChildren(ul);
}
