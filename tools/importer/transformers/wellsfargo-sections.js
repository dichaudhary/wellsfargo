/* eslint-disable */
/* global WebImporter */

/**
 * Wells Fargo sections transformer.
 *
 * Inserts `<hr>` section breaks and `Section Metadata` blocks based on
 * the sections defined in `tools/importer/page-templates.json`.
 * Section selectors are read from `payload.template.sections` — they
 * are the same selectors validated against the captured DOM in
 * migration-work/cleaned.html.
 *
 * Runs in `beforeTransform` so the original section anchor selectors
 * still match (block parsers will subsequently replace those anchors
 * with their generated block tables — the section markers are inserted
 * as siblings BEFORE that happens, so they survive).
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

/**
 * Resolve the first matching DOM node for a section. Selector may be a
 * string or an array of strings (the template allows either — see
 * `mortgage-benefits-3card` in page-templates.json which spans two
 * sibling containers).
 */
function resolveSectionAnchor(root, selector) {
  const selectors = Array.isArray(selector) ? selector : [selector];
  for (const sel of selectors) {
    if (!sel) continue;
    const node = root.querySelector(sel);
    if (node) return node;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.beforeTransform) return;

  const template = payload && payload.template;
  const sections = template && Array.isArray(template.sections) ? template.sections : [];
  if (sections.length < 2) return;

  const document = element.ownerDocument;

  // Walk in reverse so DOM insertions don't shift later anchors.
  for (let i = sections.length - 1; i >= 0; i -= 1) {
    const section = sections[i];
    const anchor = resolveSectionAnchor(element, section.selector);
    if (!anchor) continue;

    // Section Metadata block goes AFTER the section's content so it
    // associates with the section that precedes it (per AEM EDS
    // Section Metadata convention). Skip when no style is set.
    if (section.style) {
      const metaBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      if (anchor.parentNode) {
        anchor.parentNode.insertBefore(metaBlock, anchor.nextSibling);
      }
    }

    // Section break BEFORE every non-first section, but only if some
    // content already precedes it in the parent — guards against an
    // <hr> at the top of <main> when an earlier section selector
    // didn't match on this particular page.
    if (i > 0 && anchor.parentNode) {
      let hasPrev = false;
      let prev = anchor.previousSibling;
      while (prev) {
        if (prev.nodeType === 1 /* ELEMENT_NODE */
          || (prev.nodeType === 3 /* TEXT_NODE */ && prev.textContent && prev.textContent.trim().length > 0)) {
          hasPrev = true;
          break;
        }
        prev = prev.previousSibling;
      }
      if (hasPrev) {
        const hr = document.createElement('hr');
        anchor.parentNode.insertBefore(hr, anchor);
      }
    }
  }
}
