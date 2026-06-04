/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-icon-bar variant (Cards block, no-images, 1 column).
 *
 * Base block: cards.
 * Source: Wells Fargo product landing pages (mortgage, personal-loans).
 *   div.contact-bar-container > .row > ul.contact-bar-links > li (x3)
 *
 * Each <li> represents a "How can we help?" contact action:
 *   1. "Call us"            — collapsible header + expandable phone numbers / hours
 *   2. "Find a location"    — collapsible header + a locator form (we replace the
 *                              form with a single CTA link to /locator/)
 *   3. "Make an appointment" — a direct anchor link
 *
 * The visual icons (phone, pin, calendar) are rendered via CSS background images
 * on empty <span> elements; there is no <img> to migrate, so this is a "no images"
 * Cards variant with 1 column per card.
 *
 * Output: 1-column Cards block. Each card row contains a heading + body content.
 *
 * The H2 "How can we help?" is intentionally NOT included — it is captured as
 * section default content per page-templates.json.
 */
export default function parse(element, { document }) {
  // Locate each card item. Primary selector matches the documented Wells Fargo
  // markup; broader fallbacks defend against minor cross-page DOM variation.
  const items = element.querySelectorAll(
    'ul.contact-bar-links > li, ul.contact-bar-list > li, [class*="contact-bar"] > ul > li',
  );

  const cells = [];

  items.forEach((li) => {
    // Heading text. Three possibilities, in priority order:
    //   a) collapsible cards (Call us / Find a location): a <span> with role="heading"
    //      inside the header anchor — text is the visible label.
    //   b) direct-link cards (Make an appointment): the anchor's own text content.
    //   c) defensive fallback to any heading-like element inside the li.
    let headingText = '';
    const headingSpan = li.querySelector(
      'a.contact-bar-collapsible span.contact-bar-select, span[role="heading"]',
    );
    const directLink = li.querySelector(
      ':scope > a:not(.contact-bar-collapsible)',
    );
    if (headingSpan && headingSpan.textContent.trim()) {
      headingText = headingSpan.textContent.trim();
    } else if (directLink && directLink.textContent.trim()) {
      headingText = directLink.textContent.trim();
    }

    // Build a strong heading element so the cards block renders it as a card title.
    let headingEl = null;
    if (headingText) {
      headingEl = document.createElement('h3');
      headingEl.textContent = headingText;
    }

    // Build the body content for this card.
    const contentCell = [];
    if (headingEl) contentCell.push(headingEl);

    // Branch on card type using selectors validated against source.html.
    const callusContent = li.querySelector('.contact-bar-callus-content, .contact-bar-callus-desc');
    const locationContent = li.querySelector('.contact-bar-content:not(.contact-bar-callus-content)');
    const locationForm = li.querySelector('form.find_location, form[action*="locator"]');

    if (callusContent) {
      // "Call us" — preserve all the inner phone numbers / hours markup.
      // Each <li> inside .contact-bar-callus-list holds a labelled phone block.
      const callItems = callusContent.querySelectorAll('ul.contact-bar-callus-list > li, :scope > ul > li');
      if (callItems.length) {
        callItems.forEach((callItem) => {
          // Push the children of each <li> directly so the resulting markdown is
          // a sequence of paragraphs (the source already wraps content in <p>).
          Array.from(callItem.children).forEach((child) => contentCell.push(child));
        });
      } else {
        // Fallback: take everything inside the collapsible content block.
        Array.from(callusContent.children).forEach((child) => contentCell.push(child));
      }
    } else if (locationForm || locationContent) {
      // "Find a location" — drop the form (it is interactive and cannot be migrated
      // directly). Replace with a single CTA link to the locator landing page.
      // Use the form's action when available so the link target is inherited from
      // source rather than hard-coded.
      const ctaHref = (locationForm && locationForm.getAttribute('action')) || '/locator/';
      const cta = document.createElement('a');
      cta.setAttribute('href', ctaHref);
      cta.textContent = 'Find a location';
      contentCell.push(cta);
    } else if (directLink) {
      // "Make an appointment" — keep the existing anchor as the CTA.
      // Replace the heading we synthesized above: the link itself carries the
      // label, so promote it instead of duplicating the text. We do this by
      // dropping the synthesized heading when it matches the link's text.
      if (headingEl && headingEl.textContent.trim() === directLink.textContent.trim()) {
        contentCell.length = 0; // remove the synthesized heading
      }
      contentCell.push(directLink);
    }

    // Skip empty / unrecognised items defensively.
    if (contentCell.length === 0) return;

    cells.push([contentCell]);
  });

  // Empty-block guard: if no cards were extracted, leave the original DOM intact.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards-icon-bar',
    cells,
  });

  // Preserve the section heading (e.g. "How can we help?") so it renders as
  // default content above the block.
  const heading = element.querySelector('h2.contact-bar-heading, .contact-bar-container h2, h2');
  const replacements = [];
  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = heading.textContent.replace(/\s+/g, ' ').trim();
    replacements.push(h2);
  }
  replacements.push(block);
  element.replaceWith(...replacements);
}
