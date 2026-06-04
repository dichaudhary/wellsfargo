/**
 * Decorate accordion block.
 * Each row is one accordion item: first cell is the question/summary,
 * second cell (if present) is the answer/details body.
 * Falls back to one cell per row meaning summary-only items.
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const summary = cells[0];
    const body = cells[1];

    const details = document.createElement('details');
    const summaryEl = document.createElement('summary');
    while (summary.firstChild) summaryEl.append(summary.firstChild);
    details.append(summaryEl);

    if (body) {
      const wrapper = document.createElement('div');
      while (body.firstChild) wrapper.append(body.firstChild);
      details.append(wrapper);
    }

    row.replaceChildren(details);
    row.className = 'accordion-item';
  });
}
