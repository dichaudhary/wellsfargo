/* eslint-disable */
/* global WebImporter */

/**
 * Wells Fargo site-wide cleanup transformer.
 *
 * Selectors below come directly from the captured DOM
 * (migration-work/cleaned.html). Anything not authorable on a
 * Wells Fargo product landing page (header, fat-nav, breadcrumb,
 * footer, cookie banner, feedback survey, mobile-nav placeholder,
 * support-dropdown overlays, link/script/noscript tags, etc.) is
 * stripped so the importer is left with `main.ps-body-wrapper`
 * content that authors actually edit.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

// Tracking / data attributes that may appear on element nodes inside
// authored content. The current scraped DOM has these stripped, but
// listing them keeps the cleanup robust if a future page (e.g. the
// personal-loans/ gap page) is scraped less aggressively.
const TRACKING_ATTRS = [
  'data-cid',
  'data-ctid',
  'data-platform',
  'data-host',
  'data-tagging-name',
  'data-translation-text',
  'data-footnote',
  'data-trackcat',
  'data-toggle',
  'data-target',
  'aria-controls',
  'aria-expanded',
  'aria-hidden',
];

// Tags where ARIA hooks are functionally meaningful and should be kept.
const ARIA_KEEP_TAGS = new Set(['BUTTON', 'FORM', 'DETAILS', 'SUMMARY', 'INPUT', 'SELECT', 'TEXTAREA', 'A']);

// ZWNJ (U+200C) is used as decorative content in icon spans
// (e.g. `<span class="ps-mid-page-title-top-line">‍</span>`).
// We treat any element whose text is empty or only ZWNJ/whitespace
// AND has no element children as throwaway.
function isZwnjOrEmpty(el) {
  if (el.children && el.children.length > 0) return false;
  const text = (el.textContent || '').replace(/[\s‌]+/g, '');
  return text.length === 0;
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Site chrome / non-authorable shells. Selectors confirmed in
    // migration-work/cleaned.html.
    WebImporter.DOMUtils.remove(element, [
      'header.ps-masthead',                    // top masthead with logo + utility nav
      'div.ps-fat-nav-outer',                  // mega/fat nav drawer
      'div.ps-support-dropdown-overlay',       // help/contact overlay
      'div.ps-support-dropdown-overlay-container',
      'div#containerL3Mobile',                 // mobile-only L3 nav placeholder
      'div.ps-rsk-breadcrumb-container',       // breadcrumb (parent <nav> handled below)
      'footer.ps-responsive-footer',           // global footer
      'div#onetrust-consent-sdk',              // OneTrust cookie banner
      'div#feedbackSurvey',                    // inline feedback widget
      'div.ep-modal',                          // ComeHome "leaving Wells Fargo" + language-pref interstitial dialogs (after </main>)
      'div.bottom-sheet-container',            // mobile bottom-sheet overlay (leaks a stray "Footnote" h2)
      'a.hidden[href="#skip"]',                // "Skip to main content" anchor
      'script',                                // any inline tracking scripts
      'noscript',                              // noscript fallbacks
      'link',                                  // stray <link> tags (Nuance CSS includes)
    ]);

    // The breadcrumb's containing <nav> sits at top-of-body-container.
    // Remove only that one, NOT the masthead's `nav.ps-right-nav` (already
    // dropped with the header). Using a positional walk so we don't strip
    // semantic <nav>s elsewhere in authored content.
    element.querySelectorAll('div.ps-body-container > nav').forEach((n) => n.remove());

    // Footnote-marker accessibility helper text. The visible footnote number
    // is the trailing text node inside <a>; the inner span only carries the
    // screen-reader announcement "Opens a modal dialog for footnote ". DROP
    // it entirely so the imported sup link reads as just the digit.
    // Match both the `.hidden` class and any `[data-translation-text]` (some
    // rows use the latter without the .hidden class). Apply across all anchors
    // in the document, not just sup.c20ref, since the announcement text appears
    // anywhere a footnote is referenced (block descriptions, prose, etc.).
    element.querySelectorAll('a span.hidden, a span[data-translation-text="footnote-dialog-announcement"]').forEach((span) => {
      span.remove();
    });
    // Also strip the trailing announcement text that sometimes sits as a bare
    // text node next to the footnote digit (when there is no wrapping span).
    element.querySelectorAll('a[href^="#tcm:"], a[href^="#fn-"]').forEach((a) => {
      [...a.childNodes].forEach((node) => {
        if (node.nodeType === 3 /* TEXT_NODE */) {
          const cleaned = (node.textContent || '').replace(/Opens a modal dialog for footnote\s*/gi, '').trim();
          if (!cleaned) node.remove();
          else if (cleaned !== node.textContent) node.textContent = cleaned;
        }
      });
    });

    // Rewrite footnote anchor hrefs from the source CMS form `#tcm:84-XYZ-16`
    // to the form `#fn-N` emitted by the EDS footnotes block.
    element.querySelectorAll('sup.c20ref a[href^="#tcm:"]').forEach((a) => {
      const num = (a.textContent || '').replace(/[\s‌]+/g, '').trim();
      if (/^\d+$/.test(num)) {
        a.setAttribute('href', `#fn-${num}`);
      }
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Belt-and-braces: re-run the chrome removal on the post-parse DOM in case
    // a parser surfaced shell markup back into `main`.
    WebImporter.DOMUtils.remove(element, [
      'header.ps-masthead',
      'div.ps-fat-nav-outer',
      'footer.ps-responsive-footer',
      'div#onetrust-consent-sdk',
      'div#feedbackSurvey',
      'div#containerL3Mobile',
      'div.ep-modal',                          // ComeHome leaving-site interstitials (defensive re-pass)
      'div.bottom-sheet-container',            // mobile bottom-sheet overlay (defensive re-pass)
      'iframe',
      'script',
      'noscript',
      'link',
    ]);

    // Runtime-injected interstitials/pixels not present in the scraped DOM but
    // observed leaking into imported content. (a) Spanish language-toggle dialog
    // ("Esta página solo está disponible en inglés"). Its node is injected at
    // runtime so we match defensively on the announcement <h2> text and remove
    // its nearest dialog/modal container. (b) analytics tracking pixels.
    element.querySelectorAll('h2, h3').forEach((h) => {
      if (/disponible en ingl[eé]s/i.test(h.textContent || '')) {
        const container = h.closest('div.ep-modal, [role="dialog"], div.modal') || h.parentElement;
        if (container) container.remove();
      }
    });
    // Analytics tracking pixels (Yahoo dot-pixel, global s.gif spacer/beacon).
    element.querySelectorAll('img[src]').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (/sp\.analytics\.yahoo\.com/i.test(src) || /\/global\/s\.gif/i.test(src)) {
        img.remove();
      }
    });

    // ZWNJ-only spans/divs the original CSS used as decorative spacers
    // (e.g. `ps-mid-page-title-top-line`, `contact-bar-location-icon`,
    // `collapsible-icon`). They round-trip as visible junk in markdown.
    element.querySelectorAll('span, div').forEach((el) => {
      if (isZwnjOrEmpty(el)) el.remove();
    });

    // Strip tracking / aria-state attributes site-wide. ARIA stays on real
    // interactive elements (button, form, details, etc.) so accessibility
    // semantics in authored blocks (e.g. accordion <details>) survive.
    element.querySelectorAll('*').forEach((el) => {
      const keepAria = ARIA_KEEP_TAGS.has(el.tagName);
      TRACKING_ATTRS.forEach((attr) => {
        if (keepAria && (attr === 'aria-controls' || attr === 'aria-expanded' || attr === 'aria-hidden')) return;
        if (el.hasAttribute(attr)) el.removeAttribute(attr);
      });
    });

    // Width/height on imgs are sometimes data-bound by the source CMS and
    // round-trip as wrong dimensions. Drop them — the EDS responsive image
    // pipeline will set correct dimensions on render.
    element.querySelectorAll('img').forEach((img) => {
      img.removeAttribute('width');
      img.removeAttribute('height');
    });
  }
}
