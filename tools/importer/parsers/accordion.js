/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the accordion variant.
 *
 * Source: Wells Fargo product landing pages — Q&A accordions are rendered as
 * sibling <details class="show-hide-content-wrapper"> elements. Page-templates
 * maps the FIRST <details> as the block instance; this parser walks the
 * adjacent show-hide-content-wrapper siblings and folds them into a single
 * accordion block, removing each absorbed sibling so it isn't double-imported.
 *
 * Each accordion item is captured as a 2-column row:
 *   [question (from <summary>) | answer (from details body)]
 *
 * Markdown round-trip note: GFM table cells cannot contain block-level lists
 * cleanly. We flatten any <ul>/<ol> in the answer body into <p>• item</p>
 * paragraphs so the rich answer survives the html→md→da pipeline. Multi-row
 * accordions silently lose rows after the first if any cell contains a list.
 */
function flattenLists(root, document) {
  // Convert <ul> / <ol> children to bullet/number paragraphs in place.
  // Works depth-first so nested lists collapse correctly.
  root.querySelectorAll('ul, ol').forEach((list) => {
    const isOrdered = list.tagName.toLowerCase() === 'ol';
    const replacements = [];
    let counter = 1;
    list.querySelectorAll(':scope > li').forEach((li) => {
      const p = document.createElement('p');
      const prefix = isOrdered ? `${counter}. ` : '• ';
      counter += 1;
      p.append(document.createTextNode(prefix));
      while (li.firstChild) p.append(li.firstChild);
      replacements.push(p);
    });
    list.replaceWith(...replacements);
  });
}

export default function parse(element, { document }) {
  // Collect ALL details.show-hide-content-wrapper that share a parent with
  // the matched element. Using a parent-scoped query is robust against the
  // sections transformer inserting section-metadata blocks BETWEEN sibling
  // <details> elements (which would break a nextElementSibling walk).
  const parent = element.parentElement;
  const siblings = parent
    ? Array.from(parent.querySelectorAll(':scope > details.show-hide-content-wrapper'))
    : [element];
  const items = siblings.length ? siblings : [element];

  // Remove the absorbed siblings (other than `element`) so they aren't
  // re-imported as default content.
  items.forEach((item) => {
    if (item !== element) item.remove();
  });

  if (!items.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Emit one accordion block with one row per item. To survive the GFM
  // markdown table round-trip (which can't carry block-level content like
  // lists or multiple paragraphs in a cell), the answer body is collapsed to
  // a single paragraph: text content joined with line breaks (rendered as
  // <br> in markdown so they survive). Lists become "• item" lines. Embedded
  // links are preserved as inline anchors.
  function flattenAnswerToParagraph(host) {
    const lines = [];
    function walk(node) {
      if (node.nodeType === 3) {
        const t = node.textContent.replace(/\s+/g, ' ');
        if (t.trim()) lines[lines.length - 1] = (lines[lines.length - 1] || '') + t;
        return;
      }
      if (node.nodeType !== 1) return;
      const tag = node.tagName.toLowerCase();
      if (tag === 'p' || tag === 'div') {
        if (lines.length === 0 || lines[lines.length - 1].trim()) lines.push('');
        [...node.childNodes].forEach(walk);
        if (lines[lines.length - 1] && lines[lines.length - 1].trim()) lines.push('');
      } else if (tag === 'ul' || tag === 'ol') {
        const ordered = tag === 'ol';
        let n = 1;
        [...node.children].forEach((li) => {
          if (li.tagName.toLowerCase() !== 'li') return;
          if (lines.length === 0 || lines[lines.length - 1].trim()) lines.push('');
          const prefix = ordered ? `${n}. ` : '• ';
          n += 1;
          lines[lines.length - 1] = prefix;
          [...li.childNodes].forEach(walk);
          lines.push('');
        });
      } else if (tag === 'li') {
        [...node.childNodes].forEach(walk);
      } else if (tag === 'a') {
        // Preserve link as a placeholder; we'll re-insert as <a> below.
        const href = node.getAttribute('href') || '';
        const text = node.textContent.replace(/\s+/g, ' ').trim();
        if (href && text) {
          lines[lines.length - 1] = (lines[lines.length - 1] || '') + `[[A:${href}|${text}]]`;
        } else if (text) {
          lines[lines.length - 1] = (lines[lines.length - 1] || '') + text;
        }
      } else if (tag === 'br') {
        lines.push('');
      } else if (tag === 'strong' || tag === 'b' || tag === 'em' || tag === 'i' || tag === 'sup' || tag === 'sub' || tag === 'span') {
        [...node.childNodes].forEach(walk);
      } else {
        [...node.childNodes].forEach(walk);
      }
    }
    walk(host);
    // Trim and rebuild a single <p> with <br> separators and inline <a> tags.
    const cleaned = lines.map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean);
    const p = document.createElement('p');
    cleaned.forEach((line, idx) => {
      if (idx > 0) p.append(document.createElement('br'));
      // Re-hydrate links from placeholders.
      const re = /\[\[A:([^|]+)\|([^\]]+)\]\]/g;
      let lastEnd = 0;
      let m;
      while ((m = re.exec(line))) {
        if (m.index > lastEnd) p.append(document.createTextNode(line.slice(lastEnd, m.index)));
        const a = document.createElement('a');
        a.setAttribute('href', m[1]);
        a.textContent = m[2];
        p.append(a);
        lastEnd = m.index + m[0].length;
      }
      if (lastEnd < line.length) p.append(document.createTextNode(line.slice(lastEnd)));
    });
    return p;
  }

  const cells = [];
  items.forEach((item) => {
    const summary = item.querySelector('summary');
    let question = null;
    if (summary) {
      const hidden = summary.querySelector('.hidden');
      const text = (hidden && hidden.textContent.trim())
        ? hidden.textContent.trim()
        : summary.textContent.replace(/\s+/g, ' ').trim();
      question = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = text;
      question.append(strong);
    }
    const bodyHost = item.querySelector('.show-hide-content-text-wrapper-collapsible')
      || item.querySelector(':scope > div');
    const sourceHost = bodyHost || item;
    const answer = flattenAnswerToParagraph(sourceHost);
    cells.push([question || '', answer]);
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'accordion',
    cells,
  });
  element.replaceWith(block);
}
