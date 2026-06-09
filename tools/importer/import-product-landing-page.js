/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import accordionParser from './parsers/accordion.js';
import cardsContactParser from './parsers/cards-contact.js';
import cardsIconBarParser from './parsers/cards-icon-bar.js';
import cardsIconsParser from './parsers/cards-icons.js';
import cardsImageParser from './parsers/cards-image.js';
import cardsLinkListParser from './parsers/cards-link-list.js';
import cardsTestimonialsParser from './parsers/cards-testimonials.js';
import cardsTextParser from './parsers/cards-text.js';
import footnotesParser from './parsers/footnotes.js';
import heroBannerParser from './parsers/hero-banner.js';
import promoParser from './parsers/promo.js';

// TRANSFORMER IMPORTS
import wellsfargoCleanupTransformer from './transformers/wellsfargo-cleanup.js';
import wellsfargoSectionsTransformer from './transformers/wellsfargo-sections.js';

// PARSER REGISTRY
const parsers = {
  'accordion': accordionParser,
  'cards-contact': cardsContactParser,
  'cards-icon-bar': cardsIconBarParser,
  'cards-icons': cardsIconsParser,
  'cards-image': cardsImageParser,
  'cards-link-list': cardsLinkListParser,
  'cards-testimonials': cardsTestimonialsParser,
  'cards-text': cardsTextParser,
  'footnotes': footnotesParser,
  'hero-banner': heroBannerParser,
  'promo': promoParser,
};

// PAGE TEMPLATE — embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'product-landing-page',
  description: 'Wells Fargo personal product landing page (mortgage, personal loans) with hero/page-title, marketing promo grids, info cards, FAQ accordions, contact bar, and footnotes',
  urls: [
    'https://www.wellsfargo.com/mortgage/',
    'https://www.wellsfargo.com/personal-loans/',
  ],
  blocks: [
    {
      name: 'hero-banner',
      instances: [
        '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.rsk-marquee-container',
      ],
    },
    {
      name: 'cards-icons',
      instances: [
        '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.small-promo-combined:nth-of-type(5)',
        '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.small-promo-combined:nth-of-type(6)',
        '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.small-promo-combined:nth-of-type(4)',
      ],
    },
    {
      name: 'cards-image',
      instances: [
        '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.card-background-white.text-aligned-center:nth-of-type(7)',
        '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.card-background-white.text-aligned-center:nth-of-type(6)',
      ],
    },
    {
      name: 'cards-text',
      instances: [
        '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.small-promo-combined:nth-of-type(8)',
      ],
    },
    {
      name: 'cards-testimonials',
      instances: [
        '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.card-background-white.text-aligned-center:nth-of-type(11)',
      ],
    },
    {
      name: 'cards-contact',
      instances: [
        '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.card-background-white.text-aligned-center:nth-of-type(12)',
      ],
    },
    {
      name: 'cards-icon-bar',
      instances: [
        '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.contact-bar-container',
      ],
    },
    {
      name: 'cards-link-list',
      instances: [
        '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.card-background-white.text-aligned-center:nth-of-type(8)',
      ],
    },
    {
      name: 'accordion',
      instances: [
        '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > details.show-hide-content-wrapper.first-show-hide',
      ],
    },
    {
      name: 'footnotes',
      instances: [
        '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.ps-footnote',
      ],
    },
    {
      name: 'promo',
      instances: [
        '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.ps-large-promo-full-container',
      ],
    },
  ],
  sections: [
    { id: 'page-title', name: 'Page title', selector: '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.ps-page-title', style: null, blocks: [], defaultContent: ['h1'] },
    { id: 'marquee', name: 'Hero marquee', selector: '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.rsk-marquee-container', style: 'image-banner', blocks: ['hero-banner'], defaultContent: [] },
    { id: 'rate-quote-cta', name: 'Rate quote CTA', selector: '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.enhanced-txt-cm.text-aligned-center', style: 'centered', blocks: [], defaultContent: ['h3', 'p'] },
    { id: 'homebuying-steps', name: 'Homebuying steps', selector: '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.small-promo-combined:nth-of-type(5)', style: null, blocks: ['cards-icons'], defaultContent: ['.ps-mid-page-title-wrapper h2', '.ps-padding'] },
    { id: 'refinance-benefits', name: 'Refinance benefits', selector: '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.small-promo-combined:nth-of-type(6)', style: null, blocks: ['cards-icons'], defaultContent: ['.ps-mid-page-title-wrapper h2', '.ps-padding'] },
    { id: 'mortgage-benefits-3card', name: 'Mortgage benefits 3-card', selector: ['#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.card-background-white.text-aligned-center:nth-of-type(7)', '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.card-background-white.text-aligned-center:nth-of-type(6)'], style: 'white, centered', blocks: ['cards-image'], defaultContent: ['.ps-mid-page-title-wrapper h2'] },
    { id: 'mortgage-tools', name: 'Mortgage tools', selector: '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.small-promo-combined:nth-of-type(8)', style: null, blocks: ['cards-text'], defaultContent: ['.ps-mid-page-title-wrapper h2'] },
    { id: 'faq-heading', name: 'FAQ heading', selector: ['#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.card-background-white.text-aligned-center:nth-of-type(9)', '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.card-background-white.text-aligned-center:nth-of-type(7)'], style: 'white', blocks: [], defaultContent: ['h2'] },
    { id: 'faq-accordion', name: 'FAQ accordion', selector: '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > details.show-hide-content-wrapper.first-show-hide', style: 'white', blocks: ['accordion'], defaultContent: [] },
    { id: 'faq-cta', name: 'FAQ CTA', selector: '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.card-background-white.text-aligned-center:nth-of-type(10)', style: 'white', blocks: [], defaultContent: ['a'] },
    { id: 'testimonials', name: 'Testimonials', selector: '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.card-background-white.text-aligned-center:nth-of-type(11)', style: 'white, centered', blocks: ['cards-testimonials'], defaultContent: ['.ps-mid-page-title-wrapper h2'] },
    { id: 'contact-consultant', name: 'Talk to consultant', selector: '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.card-background-white.text-aligned-center:nth-of-type(12)', style: 'white, centered', blocks: ['cards-contact'], defaultContent: ['.ps-mid-page-title-wrapper h2'] },
    { id: 'helpful-resources', name: 'Helpful resources', selector: '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.card-background-white.text-aligned-center:nth-of-type(8)', style: 'white', blocks: ['cards-link-list'], defaultContent: ['.ps-mid-page-title-wrapper h2'] },
    { id: 'quick-help', name: 'Quick help', selector: '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.enhanced-txt-cm.text-aligned-left:nth-of-type(13)', style: null, blocks: [], defaultContent: ['h3', 'ul'] },
    { id: 'disclaimer', name: 'Disclaimer', selector: '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.enhanced-txt-cm.text-aligned-left:nth-of-type(14)', style: null, blocks: [], defaultContent: ['p'] },
    { id: 'footnotes', name: 'Footnotes', selector: '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.ps-footnote', style: null, blocks: ['footnotes'], defaultContent: [] },
    { id: 'gap-large-promo', name: 'Large promo', selector: '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.ps-large-promo-full-container', style: 'grey', blocks: ['promo'], defaultContent: [] },
    { id: 'gap-contact-bar', name: 'Contact bar', selector: '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper > div.contact-bar-container', style: null, blocks: ['cards-icon-bar'], defaultContent: ['h2'] },
  ],
};

// TRANSFORMER REGISTRY — sections runs after cleanup in afterTransform
const transformers = [
  wellsfargoCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [wellsfargoSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 * Each instance selector is tried; the FIRST match wins (so the first matching
 * element for a given block name is the one that gets parsed).
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      let elements;
      try {
        elements = document.querySelectorAll(selector);
      } catch (e) {
        console.warn(`Invalid selector for "${blockDef.name}": ${selector}`);
        return;
      }
      elements.forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    // 1. beforeTransform — initial cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform — final cleanup + section breaks
    executeTransformers('afterTransform', main, payload);

    // 5. Built-in WebImporter rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
