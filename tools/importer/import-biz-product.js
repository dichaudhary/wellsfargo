/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import accordionParser from './parsers/accordion.js';
import cardsContactParser from './parsers/cards-contact.js';
import cardsIconBarParser from './parsers/cards-icon-bar.js';
import cardsIconsParser from './parsers/cards-icons.js';
import cardsImageParser from './parsers/cards-image.js';
import cardsLinkListParser from './parsers/cards-link-list.js';
import columnsParser from './parsers/columns.js';
import footnotesParser from './parsers/footnotes.js';
import heroBannerParser from './parsers/hero-banner.js';
import promoParser from './parsers/promo.js';
import tableCompareParser from './parsers/table-compare.js';

// TRANSFORMER IMPORTS
import wellsfargoCleanupTransformer from './transformers/wellsfargo-cleanup.js';
import wellsfargoSectionsTransformer from './transformers/wellsfargo-sections.js';

// PARSER REGISTRY
const parsers = {
  accordion: accordionParser,
  'cards-contact': cardsContactParser,
  'cards-icon-bar': cardsIconBarParser,
  'cards-icons': cardsIconsParser,
  'cards-image': cardsImageParser,
  'cards-link-list': cardsLinkListParser,
  columns: columnsParser,
  footnotes: footnotesParser,
  'hero-banner': heroBannerParser,
  promo: promoParser,
  'table-compare': tableCompareParser,
};

const MAIN = '#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper';

// Block detection is class-based and shared across all /biz/ product pages.
// findBlocksOnPage dedups by element, and the first selector to claim an
// element wins; parsers no-op when their element has already been replaced.
const BLOCKS = [
  { name: 'hero-banner', instances: [`${MAIN} > div.rsk-marquee-container`] },
  // table-compare must run before cards-* so the comparison matrix is claimed first.
  { name: 'table-compare', instances: [`${MAIN} > div.rsk-compare-table`] },
  // 3-up image cards ("Find the right line", merchant "Services").
  { name: 'cards-image', instances: [`${MAIN} div.card-container.three-card`] },
  // 2-up text contact cards (merchant "Connect with us").
  { name: 'cards-contact', instances: [`${MAIN} div.card-container.two-card`] },
  // grouped link directory ("Customer help / Account tools / Banking basics").
  { name: 'cards-link-list', instances: [`${MAIN} div.card-container.one-card.card-left`] },
  // icon promo grids. Outer .small-promo-combined wins when present; bare
  // .ps-marketing-small-promo-items covers pages without the wrapper.
  {
    name: 'cards-icons',
    instances: [
      `${MAIN} > div.small-promo-combined`,
      `${MAIN} > div.ps-marketing-small-promo-items`,
    ],
  },
  // image-beside-text story cards (practice-finance).
  { name: 'columns', instances: [`${MAIN} > div.horizontal-card-container`] },
  // large full-width promo (practice-finance).
  { name: 'promo', instances: [`${MAIN} > div.ps-large-promo-full-container`] },
  // FAQ accordion — first <details>; parser absorbs the sibling items.
  { name: 'accordion', instances: [`${MAIN} > details.show-hide-content-wrapper.first-show-hide`] },
  // "How can we help?" collapsible contact bar.
  { name: 'cards-icon-bar', instances: [`${MAIN} > div.contact-bar-container`] },
  { name: 'footnotes', instances: [`${MAIN} > div.ps-footnote`] },
];

// Per-page section breaks + styling. Each section is anchored by a distinctive
// selector; the sections transformer inserts an <hr> before every non-first
// section (that has preceding content) and a Section Metadata block when a
// `style` is set. Centered styling reproduces the source's `.text-aligned-center`
// intros/CTAs (project styles.css centers `main > .section.centered > div`).
const TITLE = `${MAIN} > div.ps-page-title`;
const HERO = `${MAIN} > div.rsk-marquee-container`;
const ICONS = [`${MAIN} > div.small-promo-combined`, `${MAIN} > div.ps-marketing-small-promo-items`];
const THREE_CARD = `${MAIN} div.card-container.three-card`;
const TWO_CARD = `${MAIN} div.card-container.two-card`;
const LINK_LIST = `${MAIN} div.card-container.one-card.card-left`;
const CTA_CENTER = `${MAIN} > div.card-background-white.text-aligned-center`;
const CONTACT_BAR = `${MAIN} > div.contact-bar-container`;
const ACCORDION = `${MAIN} > details.show-hide-content-wrapper.first-show-hide`;
const FAQ_HEAD = `${MAIN} > div.enhanced-txt-cm.text-aligned-left`;
const FOOTNOTES = `${MAIN} > div.ps-footnote`;
const COMPARE = `${MAIN} > div.rsk-compare-table`;
const PROMO = `${MAIN} > div.ps-large-promo-full-container`;
const HCARD = `${MAIN} > div.horizontal-card-container`;

const TEMPLATES = {
  '/biz/business-credit/': [
    { id: 'title', selector: TITLE, style: 'centered', blocks: [], defaultContent: ['h1'] },
    { id: 'hero', selector: HERO, style: null, blocks: ['hero-banner'], defaultContent: [] },
    { id: 'find-line', selector: THREE_CARD, style: 'centered', blocks: ['cards-image'], defaultContent: ['h2'] },
    { id: 'benefits', selector: ICONS, style: 'centered', blocks: ['cards-icons'], defaultContent: ['h2'] },
    { id: 'faq', selector: FAQ_HEAD, style: null, blocks: [], defaultContent: ['h2'] },
    { id: 'accordion', selector: ACCORDION, style: null, blocks: ['accordion'], defaultContent: [] },
    { id: 'contact-bar', selector: CONTACT_BAR, style: null, blocks: ['cards-icon-bar'], defaultContent: ['h2'] },
    { id: 'link-list', selector: LINK_LIST, style: null, blocks: ['cards-link-list'], defaultContent: ['h2'] },
    { id: 'footnotes', selector: FOOTNOTES, style: null, blocks: ['footnotes'], defaultContent: [] },
  ],
  '/biz/sba/': [
    { id: 'title', selector: TITLE, style: 'centered', blocks: [], defaultContent: ['h1'] },
    { id: 'hero', selector: HERO, style: null, blocks: ['hero-banner'], defaultContent: [] },
    { id: 'compare', selector: COMPARE, style: 'centered', blocks: ['table-compare'], defaultContent: [] },
    { id: 'preferred', selector: ICONS, style: 'centered', blocks: ['cards-icons'], defaultContent: ['h2'] },
    { id: 'contact-bar', selector: CONTACT_BAR, style: null, blocks: ['cards-icon-bar'], defaultContent: ['h2'] },
    { id: 'link-list', selector: LINK_LIST, style: null, blocks: ['cards-link-list'], defaultContent: ['h2'] },
    { id: 'footnotes', selector: FOOTNOTES, style: null, blocks: ['footnotes'], defaultContent: [] },
  ],
  '/biz/practice-finance-medical-dental-loans/': [
    { id: 'title', selector: TITLE, style: 'centered', blocks: [], defaultContent: ['h1'] },
    { id: 'hero', selector: HERO, style: null, blocks: ['hero-banner'], defaultContent: [] },
    { id: 'value-props', selector: `${MAIN} > div.ps-marketing-small-promo-items`, style: 'centered', blocks: ['cards-icons'], defaultContent: [] },
    { id: 'columns', selector: HCARD, style: 'centered', blocks: ['columns'], defaultContent: ['h2'] },
    { id: 'features', selector: `${MAIN} > div.ps-marketing-small-promo-items:nth-of-type(2)`, style: 'centered', blocks: ['cards-icons'], defaultContent: [] },
    { id: 'promo', selector: PROMO, style: 'grey', blocks: ['promo'], defaultContent: [] },
    { id: 'footnotes', selector: FOOTNOTES, style: null, blocks: ['footnotes'], defaultContent: [] },
  ],
  '/biz/signify-rewards/': [
    { id: 'title', selector: TITLE, style: 'centered', blocks: [], defaultContent: ['h1'] },
    { id: 'hero', selector: HERO, style: null, blocks: ['hero-banner'], defaultContent: [] },
    // Loose "Connect to Wells Fargo Vantage" CTA between hero and the icon grid.
    { id: 'vantage-cta', selector: `${MAIN} > div.enhanced-txt-cm.text-aligned-center:nth-of-type(4)`, style: 'centered', blocks: [], defaultContent: ['a'] },
    { id: 'choices', selector: ICONS, style: 'centered', blocks: ['cards-icons'], defaultContent: ['h2'] },
    { id: 'need-card', selector: `${MAIN} > div.card-background-gray.text-aligned-center`, style: 'grey', blocks: [], defaultContent: ['h2', 'a'] },
    // Loose "Looking for consumer rewards?" CTA between the grey band and the FAQ.
    { id: 'consumer-cta', selector: `${MAIN} > div.enhanced-txt-cm.text-aligned-center:nth-of-type(7)`, style: 'centered', blocks: [], defaultContent: ['a'] },
    { id: 'faq', selector: FAQ_HEAD, style: null, blocks: [], defaultContent: ['h2'] },
    { id: 'accordion', selector: ACCORDION, style: null, blocks: ['accordion'], defaultContent: [] },
    { id: 'footnotes', selector: FOOTNOTES, style: null, blocks: ['footnotes'], defaultContent: [] },
  ],
  '/biz/merchant/': [
    { id: 'title', selector: TITLE, style: 'centered', blocks: [], defaultContent: ['h1'] },
    { id: 'hero', selector: HERO, style: null, blocks: ['hero-banner'], defaultContent: [] },
    { id: 'services', selector: THREE_CARD, style: 'centered', blocks: ['cards-image'], defaultContent: ['h2'] },
    { id: 'connect', selector: TWO_CARD, style: 'centered', blocks: ['cards-contact'], defaultContent: ['h2'] },
    { id: 'footnotes', selector: FOOTNOTES, style: null, blocks: ['footnotes'], defaultContent: [] },
  ],
};

function pathnameOf(url) {
  try {
    const p = new URL(url).pathname;
    return p.endsWith('/') ? p : `${p}/`;
  } catch (e) {
    return url;
  }
}

function templateForUrl(url) {
  const path = pathnameOf(url);
  const sections = TEMPLATES[path] || [];
  return {
    name: 'biz-product',
    blocks: BLOCKS,
    sections,
  };
}

function executeTransformers(transformers, hookName, element, payload, template) {
  const enhancedPayload = { ...payload, template };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

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
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    const template = templateForUrl(params.originalURL || url);

    const transformers = [
      wellsfargoCleanupTransformer,
      ...(template.sections && template.sections.length > 1 ? [wellsfargoSectionsTransformer] : []),
    ];

    // 1. beforeTransform — cleanup + section markers
    executeTransformers(transformers, 'beforeTransform', main, payload, template);

    // 2. Find blocks
    const pageBlocks = findBlocksOnPage(document, template);

    // 3. Parse each block
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
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

    // 4. afterTransform — final cleanup
    executeTransformers(transformers, 'afterTransform', main, payload, template);

    // 5. Built-in WebImporter rules
    try { window.__tmain = main.innerHTML; } catch (e) { /* noop */ }
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: template.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
