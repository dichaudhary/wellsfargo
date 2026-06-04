/**
 * Decorate cards-link-list block.
 * Each row is one column with a heading + link list.
 *
 * Authored shape (one column per row):
 *   | (heading + ul of links) |
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    li.className = 'cards-link-list-card';
    ul.append(li);
  });

  block.replaceChildren(ul);
}
