/**
 * Decorate the cards-testimonials block.
 * 2-up grid of testimonial cards. Each card has an italicized quote followed by
 * the customer name (typically rendered bold).
 *
 * Expected authored structure (one testimonial per row):
 *   | (quote paragraph + customer name) |
 *
 * @param {Element} block The cards-testimonials block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      div.className = 'cards-testimonials-card-body';
    });

    // Try to identify the last paragraph as the customer name attribution.
    const body = li.querySelector('.cards-testimonials-card-body');
    if (body) {
      const paragraphs = body.querySelectorAll('p');
      if (paragraphs.length > 1) {
        paragraphs[paragraphs.length - 1].classList.add('cards-testimonials-attribution');
      }
    }

    ul.append(li);
  });

  block.replaceChildren(ul);
}
