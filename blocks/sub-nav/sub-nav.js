/**
 * Decorate sub-nav block.
 * A horizontal, tab-style sub-navigation across sibling pages.
 *
 * Authored shape (one link per row):
 *   | [Overview](/mortgage/learn/)            |
 *   | [Preparing to buy](/.../preparing-to-buy/) |
 *   | [The mortgage process](/.../mortgage-process/) |
 *   | [Owning and refinancing](/.../owning-refinancing/) |
 *
 * The link matching the current page path is marked active.
 */
export default function decorate(block) {
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Section navigation');

  const ul = document.createElement('ul');
  const here = window.location.pathname.replace(/\/$/, '');

  [...block.children].forEach((row) => {
    const link = row.querySelector('a');
    if (!link) return;

    const li = document.createElement('li');
    li.className = 'sub-nav-item';

    const target = new URL(link.href, window.location.href).pathname.replace(/\/$/, '');
    if (target === here) {
      li.classList.add('sub-nav-item-active');
      link.setAttribute('aria-current', 'page');
    }

    li.append(link);
    ul.append(li);
  });

  nav.append(ul);
  block.replaceChildren(nav);
}
