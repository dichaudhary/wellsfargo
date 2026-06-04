/**
 * Decorate the cards-text block.
 * 4-up grid of text-only cards. Each card has heading + description + link.
 * No icons or images. Used for tools/resources/navigation grids.
 *
 * Expected authored structure (one card per row):
 *   | (h3 heading + description paragraph + link) |
 *
 * @param {Element} block The cards-text block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    // Skip empty rows (e.g. blank first row from authored content)
    if (!row.textContent.trim() && !row.querySelector('img, picture, a')) return;

    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      div.className = 'cards-text-card-body';
    });

    ul.append(li);
  });

  block.replaceChildren(ul);
}
