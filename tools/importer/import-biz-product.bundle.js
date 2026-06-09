/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-biz-product.js
  var import_biz_product_exports = {};
  __export(import_biz_product_exports, {
    default: () => import_biz_product_default
  });

  // tools/importer/parsers/accordion.js
  function parse(element, { document }) {
    const parent = element.parentElement;
    const siblings = parent ? Array.from(parent.querySelectorAll(":scope > details.show-hide-content-wrapper")) : [element];
    const items = siblings.length ? siblings : [element];
    items.forEach((item) => {
      if (item !== element) item.remove();
    });
    if (!items.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    function flattenAnswerToParagraph(host) {
      const lines = [];
      function walk(node) {
        if (node.nodeType === 3) {
          const t = node.textContent.replace(/\s+/g, " ");
          if (t.trim()) lines[lines.length - 1] = (lines[lines.length - 1] || "") + t;
          return;
        }
        if (node.nodeType !== 1) return;
        const tag = node.tagName.toLowerCase();
        if (tag === "p" || tag === "div") {
          if (lines.length === 0 || lines[lines.length - 1].trim()) lines.push("");
          [...node.childNodes].forEach(walk);
          if (lines[lines.length - 1] && lines[lines.length - 1].trim()) lines.push("");
        } else if (tag === "ul" || tag === "ol") {
          const ordered = tag === "ol";
          let n = 1;
          [...node.children].forEach((li) => {
            if (li.tagName.toLowerCase() !== "li") return;
            if (lines.length === 0 || lines[lines.length - 1].trim()) lines.push("");
            const prefix = ordered ? `${n}. ` : "\u2022 ";
            n += 1;
            lines[lines.length - 1] = prefix;
            [...li.childNodes].forEach(walk);
            lines.push("");
          });
        } else if (tag === "li") {
          [...node.childNodes].forEach(walk);
        } else if (tag === "a") {
          const href = node.getAttribute("href") || "";
          const text = node.textContent.replace(/\s+/g, " ").trim();
          if (href && text) {
            lines[lines.length - 1] = (lines[lines.length - 1] || "") + `[[A:${href}|${text}]]`;
          } else if (text) {
            lines[lines.length - 1] = (lines[lines.length - 1] || "") + text;
          }
        } else if (tag === "br") {
          lines.push("");
        } else if (tag === "strong" || tag === "b" || tag === "em" || tag === "i" || tag === "sup" || tag === "sub" || tag === "span") {
          [...node.childNodes].forEach(walk);
        } else {
          [...node.childNodes].forEach(walk);
        }
      }
      walk(host);
      const cleaned = lines.map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
      const p = document.createElement("p");
      cleaned.forEach((line, idx) => {
        if (idx > 0) p.append(document.createElement("br"));
        const re = /\[\[A:([^|]+)\|([^\]]+)\]\]/g;
        let lastEnd = 0;
        let m;
        while (m = re.exec(line)) {
          if (m.index > lastEnd) p.append(document.createTextNode(line.slice(lastEnd, m.index)));
          const a = document.createElement("a");
          a.setAttribute("href", m[1]);
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
      const summary = item.querySelector("summary");
      let question = null;
      if (summary) {
        const hidden = summary.querySelector(".hidden");
        const text = hidden && hidden.textContent.trim() ? hidden.textContent.trim() : summary.textContent.replace(/\s+/g, " ").trim();
        question = document.createElement("p");
        const strong = document.createElement("strong");
        strong.textContent = text;
        question.append(strong);
      }
      const bodyHost = item.querySelector(".show-hide-content-text-wrapper-collapsible") || item.querySelector(":scope > div");
      const sourceHost = bodyHost || item;
      const answer = flattenAnswerToParagraph(sourceHost);
      cells.push([question || "", answer]);
    });
    const block = WebImporter.Blocks.createBlock(document, {
      name: "accordion",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-contact.js
  function parse2(element, { document }) {
    const cardsContainer = element.querySelector(
      '.card-container.four-card, .card-container, [class*="card-container"]'
    );
    const cards = cardsContainer ? Array.from(cardsContainer.querySelectorAll(":scope > .enhanced-txt-cm")) : Array.from(element.querySelectorAll(":scope > .card-container > .enhanced-txt-cm"));
    if (!cards.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cards.forEach((card) => {
      const heading2 = card.querySelector(".title2-SemiBold h3, h3");
      const bodyEl = card.querySelector(".subheadline-regular");
      const bodyNodes = [];
      if (bodyEl) {
        const directChildren = Array.from(bodyEl.children);
        const source = directChildren.length === 1 && directChildren[0].tagName === "DIV" ? directChildren[0] : bodyEl;
        Array.from(source.children).forEach((node) => {
          bodyNodes.push(node);
        });
      }
      const cardCell = [];
      if (heading2) cardCell.push(heading2);
      cardCell.push(...bodyNodes);
      if (cardCell.length === 0) return;
      cells.push([cardCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, {
      name: "cards-contact",
      cells
    });
    const heading = element.querySelector(".ps-mid-page-title-wrapper h2, .ps-mid-page-title");
    const replacements = [];
    if (heading) {
      const h2 = document.createElement("h2");
      h2.textContent = heading.textContent.replace(/\s+/g, " ").trim();
      replacements.push(h2);
    }
    replacements.push(block);
    element.replaceWith(...replacements);
  }

  // tools/importer/parsers/cards-icon-bar.js
  function parse3(element, { document }) {
    const items = element.querySelectorAll(
      'ul.contact-bar-links > li, ul.contact-bar-list > li, [class*="contact-bar"] > ul > li'
    );
    const cells = [];
    items.forEach((li) => {
      let headingText = "";
      const headingSpan = li.querySelector(
        'a.contact-bar-collapsible span.contact-bar-select, span[role="heading"]'
      );
      const directLink = li.querySelector(
        ":scope > a:not(.contact-bar-collapsible)"
      );
      if (headingSpan && headingSpan.textContent.trim()) {
        headingText = headingSpan.textContent.trim();
      } else if (directLink && directLink.textContent.trim()) {
        headingText = directLink.textContent.trim();
      }
      let headingEl = null;
      if (headingText) {
        headingEl = document.createElement("h3");
        headingEl.textContent = headingText;
      }
      const contentCell = [];
      if (headingEl) contentCell.push(headingEl);
      const callusContent = li.querySelector(".contact-bar-callus-content, .contact-bar-callus-desc");
      const locationContent = li.querySelector(".contact-bar-content:not(.contact-bar-callus-content)");
      const locationForm = li.querySelector('form.find_location, form[action*="locator"]');
      if (callusContent) {
        const callItems = callusContent.querySelectorAll("ul.contact-bar-callus-list > li, :scope > ul > li");
        if (callItems.length) {
          callItems.forEach((callItem) => {
            Array.from(callItem.children).forEach((child) => contentCell.push(child));
          });
        } else {
          Array.from(callusContent.children).forEach((child) => contentCell.push(child));
        }
      } else if (locationForm || locationContent) {
        const ctaHref = locationForm && locationForm.getAttribute("action") || "/locator/";
        const cta = document.createElement("a");
        cta.setAttribute("href", ctaHref);
        cta.textContent = "Find a location";
        contentCell.push(cta);
      } else if (directLink) {
        if (headingEl && headingEl.textContent.trim() === directLink.textContent.trim()) {
          contentCell.length = 0;
        }
        contentCell.push(directLink);
      }
      if (contentCell.length === 0) return;
      cells.push([contentCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, {
      name: "cards-icon-bar",
      cells
    });
    const heading = element.querySelector("h2.contact-bar-heading, .contact-bar-container h2, h2");
    const replacements = [];
    if (heading) {
      const h2 = document.createElement("h2");
      h2.textContent = heading.textContent.replace(/\s+/g, " ").trim();
      replacements.push(h2);
    }
    replacements.push(block);
    element.replaceWith(...replacements);
  }

  // tools/importer/parsers/cards-icons.js
  function parse4(element, { document }) {
    const items = Array.from(element.querySelectorAll(":scope .ps-marketing-small-promo-item"));
    const cells = [];
    items.forEach((item) => {
      const icon = item.querySelector(".ps-marketing-icon img, .ps-marketing-icon-container img");
      const heading2 = item.querySelector(".ps-marketing-text h3, .ps-marketing-text h2, .ps-marketing-text h4, h3, h2, h4");
      const description = item.querySelector(".ps-marketing-text p.ps-marketing-text-content, .ps-marketing-text p:not(.learn-more):not(.learn-more-mobile)");
      let ctaLink = item.querySelector(".ps-marketing-promo-link p.learn-more a, .ps-marketing-promo-link a");
      if (!ctaLink) {
        ctaLink = item.querySelector("p.learn-more-mobile a");
      }
      if (!heading2 && !description && !icon) return;
      const textCell = [];
      if (heading2) textCell.push(heading2);
      if (description) textCell.push(description);
      if (ctaLink) textCell.push(ctaLink);
      cells.push([icon || "", textCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, {
      name: "cards-icons",
      cells
    });
    const heading = element.querySelector(".ps-mid-page-title-wrapper h2, .ps-mid-page-title");
    const trailing = element.querySelector(":scope > .ps-padding");
    const replacements = [];
    if (heading) {
      const h2 = document.createElement("h2");
      h2.textContent = heading.textContent.replace(/\s+/g, " ").trim();
      replacements.push(h2);
    }
    replacements.push(block);
    if (trailing) {
      const cloneRoot = document.createElement("div");
      [...trailing.children].forEach((c) => cloneRoot.appendChild(c.cloneNode(true)));
      [...cloneRoot.children].forEach((c) => replacements.push(c));
    }
    element.replaceWith(...replacements);
  }

  // tools/importer/parsers/cards-image.js
  function parse5(element, { document }) {
    const cardEls = Array.from(
      element.querySelectorAll(".three-card-content, .enhanced-txt-cm.presentedElement")
    );
    const uniqueCards = [];
    const seen = /* @__PURE__ */ new Set();
    cardEls.forEach((c) => {
      if (!seen.has(c)) {
        seen.add(c);
        uniqueCards.push(c);
      }
    });
    const cells = [];
    uniqueCards.forEach((card) => {
      const image = card.querySelector("img");
      let heading2 = card.querySelector(".title2-SemiBold h3, h3, h2, h4");
      if (!heading2) {
        const titleDiv = card.querySelector(".title2-SemiBold");
        const titleText = titleDiv && titleDiv.textContent.replace(/\s+/g, " ").trim();
        if (titleText) {
          heading2 = document.createElement("h3");
          heading2.textContent = titleText;
        }
      }
      const description = card.querySelector(".subheadline-regular, .enhanced-txt-body > div:not(.title2-SemiBold):not(.ps-btn-text)");
      const cta = card.querySelector("a.ps-btn-text, .enhanced-txt-body p a, p a");
      if (!image && !heading2 && !description && !cta) return;
      const textCell = [];
      if (heading2) textCell.push(heading2);
      if (description) textCell.push(description);
      if (cta) textCell.push(cta);
      cells.push([image || "", textCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, {
      name: "cards-image",
      cells
    });
    const heading = element.querySelector(".ps-mid-page-title-wrapper h2, .ps-mid-page-title");
    const replacements = [];
    if (heading) {
      const h2 = document.createElement("h2");
      h2.textContent = heading.textContent.replace(/\s+/g, " ").trim();
      replacements.push(h2);
    }
    replacements.push(block);
    element.replaceWith(...replacements);
  }

  // tools/importer/parsers/cards-link-list.js
  function parse6(element, { document }) {
    let columns = element.querySelectorAll('.three-card-content, [class*="three-card-content"]');
    if (!columns.length) {
      columns = Array.from(element.querySelectorAll(".enhanced-txt-cm")).filter((col) => col.querySelector(".link-list-desc"));
    }
    const cells = [];
    columns.forEach((col) => {
      const titleNode = col.querySelector('.title2-SemiBold, [class*="title"]');
      const list = col.querySelector("ul");
      const cellChildren = [];
      if (titleNode) {
        const h3 = document.createElement("h3");
        h3.textContent = titleNode.textContent.replace(/\s+/g, " ").trim();
        cellChildren.push(h3);
      }
      if (list) cellChildren.push(list);
      if (cellChildren.length) cells.push([cellChildren]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, {
      name: "cards-link-list",
      cells
    });
    const heading = element.querySelector(".ps-mid-page-title-wrapper h2, .ps-mid-page-title");
    const replacements = [];
    if (heading) {
      const h2 = document.createElement("h2");
      h2.textContent = heading.textContent.replace(/\s+/g, " ").trim();
      replacements.push(h2);
    }
    replacements.push(block);
    element.replaceWith(...replacements);
  }

  // tools/importer/parsers/columns.js
  function parse7(element, { document }) {
    const cards = element.querySelectorAll(".enhanced-txt-horizontal-card");
    if (!cards.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const columns = [];
    cards.forEach((card) => {
      const cellChildren = [];
      const img = card.querySelector(".horizontal-card-image img, img");
      if (img) cellChildren.push(img);
      const titleNode = card.querySelector(".horizontal-card-title h3, h3, h2");
      if (titleNode) {
        const h3 = document.createElement("h3");
        h3.textContent = titleNode.textContent.replace(/\s+/g, " ").trim();
        cellChildren.push(h3);
      }
      const body = card.querySelector(".horizontal-card-body");
      if (body) {
        const p = document.createElement("p");
        p.append(...body.childNodes);
        cellChildren.push(p);
      }
      card.querySelectorAll(".horizontal-card-cta a, a.ps-btn-secondary, a.ps-btn-primary").forEach((a) => {
        const p = document.createElement("p");
        p.append(a);
        cellChildren.push(p);
      });
      if (cellChildren.length) columns.push(cellChildren);
    });
    if (!columns.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, {
      name: "columns",
      cells: [columns]
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/footnotes.js
  function parse8(element, { document }) {
    const cells = [];
    const children = Array.from(element.children);
    children.forEach((child) => {
      const c20Content = child.querySelector(":scope > p.c20Content");
      if (c20Content) {
        const numSpan = c20Content.querySelector(":scope > span.c20no");
        const textSpan = c20Content.querySelector(":scope > span.c20Text");
        const rawNum = numSpan ? numSpan.textContent.trim() : "";
        const numMatch = rawNum.match(/^(\d+)\.?$/);
        const number = numMatch ? numMatch[1] : "";
        const bodyFragment = document.createDocumentFragment();
        if (textSpan) {
          const spanText = (textSpan.textContent || "").replace(/\s|‌/g, "");
          const spanHasBlockChildren = Array.from(textSpan.children).some(
            (el) => /^(p|ul|ol|div|h[1-6])$/i.test(el.tagName)
          );
          if (spanHasBlockChildren) {
            while (textSpan.firstChild) bodyFragment.append(textSpan.firstChild);
          } else if (spanText.length > 0) {
            const p = document.createElement("p");
            while (textSpan.firstChild) p.append(textSpan.firstChild);
            bodyFragment.append(p);
          }
        }
        let sibling = c20Content.nextElementSibling;
        while (sibling) {
          const tag = sibling.tagName.toLowerCase();
          if (/^(p|ul|ol|div|h[1-6])$/i.test(tag)) {
            const text = (sibling.textContent || "").replace(/\s|‌/g, "");
            if (text.length > 0) bodyFragment.append(sibling.cloneNode(true));
          }
          sibling = sibling.nextElementSibling;
        }
        if (!number && !bodyFragment.childNodes.length) return;
        cells.push([number, bodyFragment]);
        return;
      }
      if (child.classList && child.classList.contains("ps-footnote-footer")) {
        const fragment = document.createDocumentFragment();
        while (child.firstChild) fragment.append(child.firstChild);
        if (fragment.childNodes.length) cells.push([fragment]);
        return;
      }
      if (child.classList && child.classList.contains("ps-footnote-text")) {
        const fragment = document.createDocumentFragment();
        while (child.firstChild) fragment.append(child.firstChild);
        if (fragment.childNodes.length) cells.push([fragment]);
      }
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, {
      name: "footnotes",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-banner.js
  function parse9(element, { document }) {
    const picture = element.querySelector("picture");
    const img = element.querySelector("img");
    const heading = element.querySelector("h1, h2, h3");
    if (!img && !heading) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const imageNode = picture || img;
    const headingNode = heading || document.createElement("span");
    const block = WebImporter.Blocks.createBlock(document, {
      name: "hero-banner",
      cells: [[imageNode, headingNode]]
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/promo.js
  function parse10(element, { document }) {
    const item = element.querySelector(".ps-promo-full-item") || element;
    const image = item.querySelector(".ps-promo-full-image img, img");
    const heading = item.querySelector(".ps-promo-full-content h2, h2, h1, h3");
    const description = item.querySelector(".ps-promo-full-content > p, .ps-promo-full-content p");
    const ctaLinks = Array.from(
      item.querySelectorAll(".ps-promo-full-links a, .ps-promo-full-content a.ps-btn-secondary, .ps-promo-full-content a.ps-btn-primary, .ps-promo-full-content a.ps-btn-text")
    );
    const uniqueCtas = [];
    const seenCtas = /* @__PURE__ */ new Set();
    ctaLinks.forEach((a) => {
      if (!seenCtas.has(a)) {
        seenCtas.add(a);
        uniqueCtas.push(a);
      }
    });
    if (!image && !heading && !description && uniqueCtas.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (description) contentCell.push(description);
    contentCell.push(...uniqueCtas);
    const cells = [
      [image || "", contentCell]
    ];
    const block = WebImporter.Blocks.createBlock(document, {
      name: "promo",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/table-compare.js
  function parse11(element, { document }) {
    const table = element.querySelector(".table") || element;
    const headerGroup = table.querySelector(".row-group-header-wrapper");
    const col1Label = headerGroup && headerGroup.querySelector(".table-column.column1 p, .table-column.column1");
    const col2Label = headerGroup && headerGroup.querySelector(".table-column.column2 p, .table-column.column2");
    const rows = [];
    const headerCell1 = document.createElement("div");
    const headerCell2 = document.createElement("div");
    if (col1Label) headerCell1.textContent = col1Label.textContent.replace(/\s+/g, " ").trim();
    if (col2Label) headerCell2.textContent = col2Label.textContent.replace(/\s+/g, " ").trim();
    rows.push([document.createElement("div"), headerCell1, headerCell2]);
    table.querySelectorAll(".table-row.row-header-wrapper").forEach((headerRow) => {
      const label = headerRow.querySelector(".row-header");
      let valueRow = headerRow.nextElementSibling;
      while (valueRow && !(valueRow.classList.contains("table-row") && !valueRow.classList.contains("row-header-wrapper"))) {
        valueRow = valueRow.nextElementSibling;
      }
      if (!valueRow) return;
      const v1 = valueRow.querySelector(".table-column.column1");
      const v2 = valueRow.querySelector(".table-column.column2");
      const labelCell = document.createElement("div");
      if (label) labelCell.textContent = label.textContent.replace(/\s+/g, " ").trim();
      const cell1 = document.createElement("div");
      if (v1) cell1.append(...v1.childNodes);
      const cell2 = document.createElement("div");
      if (v2) cell2.append(...v2.childNodes);
      rows.push([labelCell, cell1, cell2]);
    });
    if (rows.length <= 1) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, {
      name: "table-compare",
      cells: rows
    });
    const replacements = [];
    const heading = table.querySelector(".table-heading-text, h2");
    if (heading) {
      const h2 = document.createElement("h2");
      h2.textContent = heading.textContent.replace(/\s+/g, " ").trim();
      replacements.push(h2);
    }
    replacements.push(block);
    element.replaceWith(...replacements);
  }

  // tools/importer/transformers/wellsfargo-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  var TRACKING_ATTRS = [
    "data-cid",
    "data-ctid",
    "data-platform",
    "data-host",
    "data-tagging-name",
    "data-translation-text",
    "data-footnote",
    "data-trackcat",
    "data-toggle",
    "data-target",
    "aria-controls",
    "aria-expanded",
    "aria-hidden"
  ];
  var ARIA_KEEP_TAGS = /* @__PURE__ */ new Set(["BUTTON", "FORM", "DETAILS", "SUMMARY", "INPUT", "SELECT", "TEXTAREA", "A"]);
  function isZwnjOrEmpty(el) {
    if (el.children && el.children.length > 0) return false;
    const text = (el.textContent || "").replace(/[\s‌]+/g, "");
    return text.length === 0;
  }
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.ps-masthead",
        // top masthead with logo + utility nav
        "div.ps-fat-nav-outer",
        // mega/fat nav drawer
        "div.ps-support-dropdown-overlay",
        // help/contact overlay
        "div.ps-support-dropdown-overlay-container",
        "div#containerL3Mobile",
        // mobile-only L3 nav placeholder
        "div.ps-rsk-breadcrumb-container",
        // breadcrumb (parent <nav> handled below)
        "footer.ps-responsive-footer",
        // global footer
        "div#onetrust-consent-sdk",
        // OneTrust cookie banner
        "div#feedbackSurvey",
        // inline feedback widget
        "div.ep-modal",
        // ComeHome "leaving Wells Fargo" + language-pref interstitial dialogs (after </main>)
        "div.bottom-sheet-container",
        // mobile bottom-sheet overlay (leaks a stray "Footnote" h2)
        'a.hidden[href="#skip"]',
        // "Skip to main content" anchor
        "script",
        // any inline tracking scripts
        "noscript",
        // noscript fallbacks
        "link"
        // stray <link> tags (Nuance CSS includes)
      ]);
      element.querySelectorAll("div.ps-body-container > nav").forEach((n) => n.remove());
      element.querySelectorAll('a span.hidden, a span[data-translation-text="footnote-dialog-announcement"]').forEach((span) => {
        span.remove();
      });
      element.querySelectorAll('a[href^="#tcm:"], a[href^="#fn-"]').forEach((a) => {
        [...a.childNodes].forEach((node) => {
          if (node.nodeType === 3) {
            const cleaned = (node.textContent || "").replace(/Opens a modal dialog for footnote\s*/gi, "").trim();
            if (!cleaned) node.remove();
            else if (cleaned !== node.textContent) node.textContent = cleaned;
          }
        });
      });
      element.querySelectorAll('sup.c20ref a[href^="#tcm:"]').forEach((a) => {
        const num = (a.textContent || "").replace(/[\s‌]+/g, "").trim();
        if (/^\d+$/.test(num)) {
          a.setAttribute("href", `#fn-${num}`);
        }
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.ps-masthead",
        "div.ps-fat-nav-outer",
        "footer.ps-responsive-footer",
        "div#onetrust-consent-sdk",
        "div#feedbackSurvey",
        "div#containerL3Mobile",
        "div.ep-modal",
        // ComeHome leaving-site interstitials (defensive re-pass)
        "div.bottom-sheet-container",
        // mobile bottom-sheet overlay (defensive re-pass)
        "iframe",
        "script",
        "noscript",
        "link"
      ]);
      element.querySelectorAll("h2, h3").forEach((h) => {
        if (/disponible en ingl[eé]s/i.test(h.textContent || "")) {
          const container = h.closest('div.ep-modal, [role="dialog"], div.modal') || h.parentElement;
          if (container) container.remove();
        }
      });
      element.querySelectorAll("img[src]").forEach((img) => {
        const src = img.getAttribute("src") || "";
        if (/sp\.analytics\.yahoo\.com/i.test(src) || /\/global\/s\.gif/i.test(src)) {
          img.remove();
        }
      });
      element.querySelectorAll("span, div").forEach((el) => {
        if (isZwnjOrEmpty(el)) el.remove();
      });
      element.querySelectorAll("*").forEach((el) => {
        const keepAria = ARIA_KEEP_TAGS.has(el.tagName);
        TRACKING_ATTRS.forEach((attr) => {
          if (keepAria && (attr === "aria-controls" || attr === "aria-expanded" || attr === "aria-hidden")) return;
          if (el.hasAttribute(attr)) el.removeAttribute(attr);
        });
      });
      element.querySelectorAll("img").forEach((img) => {
        img.removeAttribute("width");
        img.removeAttribute("height");
      });
    }
  }

  // tools/importer/transformers/wellsfargo-sections.js
  var TransformHook2 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function resolveSectionAnchor(root, selector) {
    const selectors = Array.isArray(selector) ? selector : [selector];
    for (const sel of selectors) {
      if (!sel) continue;
      const node = root.querySelector(sel);
      if (node) return node;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.beforeTransform) return;
    const template = payload && payload.template;
    const sections = template && Array.isArray(template.sections) ? template.sections : [];
    if (sections.length < 2) return;
    const document = element.ownerDocument;
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const anchor = resolveSectionAnchor(element, section.selector);
      if (!anchor) continue;
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        if (anchor.parentNode) {
          anchor.parentNode.insertBefore(metaBlock, anchor.nextSibling);
        }
      }
      if (i > 0 && anchor.parentNode) {
        let hasPrev = false;
        let prev = anchor.previousSibling;
        while (prev) {
          if (prev.nodeType === 1 || prev.nodeType === 3 && prev.textContent && prev.textContent.trim().length > 0) {
            hasPrev = true;
            break;
          }
          prev = prev.previousSibling;
        }
        if (hasPrev) {
          const hr = document.createElement("hr");
          anchor.parentNode.insertBefore(hr, anchor);
        }
      }
    }
  }

  // tools/importer/import-biz-product.js
  var parsers = {
    accordion: parse,
    "cards-contact": parse2,
    "cards-icon-bar": parse3,
    "cards-icons": parse4,
    "cards-image": parse5,
    "cards-link-list": parse6,
    columns: parse7,
    footnotes: parse8,
    "hero-banner": parse9,
    promo: parse10,
    "table-compare": parse11
  };
  var MAIN = "#ps-rsk-foundation > div.ps-body-container > main.ps-body-wrapper";
  var BLOCKS = [
    { name: "hero-banner", instances: [`${MAIN} > div.rsk-marquee-container`] },
    // table-compare must run before cards-* so the comparison matrix is claimed first.
    { name: "table-compare", instances: [`${MAIN} > div.rsk-compare-table`] },
    // 3-up image cards ("Find the right line", merchant "Services").
    { name: "cards-image", instances: [`${MAIN} div.card-container.three-card`] },
    // 2-up text contact cards (merchant "Connect with us").
    { name: "cards-contact", instances: [`${MAIN} div.card-container.two-card`] },
    // grouped link directory ("Customer help / Account tools / Banking basics").
    { name: "cards-link-list", instances: [`${MAIN} div.card-container.one-card.card-left`] },
    // icon promo grids. Outer .small-promo-combined wins when present; bare
    // .ps-marketing-small-promo-items covers pages without the wrapper.
    {
      name: "cards-icons",
      instances: [
        `${MAIN} > div.small-promo-combined`,
        `${MAIN} > div.ps-marketing-small-promo-items`
      ]
    },
    // image-beside-text story cards (practice-finance).
    { name: "columns", instances: [`${MAIN} > div.horizontal-card-container`] },
    // large full-width promo (practice-finance).
    { name: "promo", instances: [`${MAIN} > div.ps-large-promo-full-container`] },
    // FAQ accordion — first <details>; parser absorbs the sibling items.
    { name: "accordion", instances: [`${MAIN} > details.show-hide-content-wrapper.first-show-hide`] },
    // "How can we help?" collapsible contact bar.
    { name: "cards-icon-bar", instances: [`${MAIN} > div.contact-bar-container`] },
    { name: "footnotes", instances: [`${MAIN} > div.ps-footnote`] }
  ];
  var TITLE = `${MAIN} > div.ps-page-title`;
  var HERO = `${MAIN} > div.rsk-marquee-container`;
  var ICONS = [`${MAIN} > div.small-promo-combined`, `${MAIN} > div.ps-marketing-small-promo-items`];
  var THREE_CARD = `${MAIN} div.card-container.three-card`;
  var TWO_CARD = `${MAIN} div.card-container.two-card`;
  var LINK_LIST = `${MAIN} div.card-container.one-card.card-left`;
  var CTA_CENTER = `${MAIN} > div.card-background-white.text-aligned-center`;
  var CONTACT_BAR = `${MAIN} > div.contact-bar-container`;
  var ACCORDION = `${MAIN} > details.show-hide-content-wrapper.first-show-hide`;
  var FAQ_HEAD = `${MAIN} > div.enhanced-txt-cm.text-aligned-left`;
  var FOOTNOTES = `${MAIN} > div.ps-footnote`;
  var COMPARE = `${MAIN} > div.rsk-compare-table`;
  var PROMO = `${MAIN} > div.ps-large-promo-full-container`;
  var HCARD = `${MAIN} > div.horizontal-card-container`;
  var TEMPLATES = {
    "/biz/business-credit/": [
      { id: "title", selector: TITLE, style: "centered", blocks: [], defaultContent: ["h1"] },
      { id: "hero", selector: HERO, style: null, blocks: ["hero-banner"], defaultContent: [] },
      { id: "find-line", selector: THREE_CARD, style: "centered", blocks: ["cards-image"], defaultContent: ["h2"] },
      { id: "benefits", selector: ICONS, style: "centered", blocks: ["cards-icons"], defaultContent: ["h2"] },
      { id: "faq", selector: FAQ_HEAD, style: null, blocks: [], defaultContent: ["h2"] },
      { id: "accordion", selector: ACCORDION, style: null, blocks: ["accordion"], defaultContent: [] },
      { id: "contact-bar", selector: CONTACT_BAR, style: null, blocks: ["cards-icon-bar"], defaultContent: ["h2"] },
      { id: "link-list", selector: LINK_LIST, style: null, blocks: ["cards-link-list"], defaultContent: ["h2"] },
      { id: "footnotes", selector: FOOTNOTES, style: null, blocks: ["footnotes"], defaultContent: [] }
    ],
    "/biz/sba/": [
      { id: "title", selector: TITLE, style: "centered", blocks: [], defaultContent: ["h1"] },
      { id: "hero", selector: HERO, style: null, blocks: ["hero-banner"], defaultContent: [] },
      { id: "compare", selector: COMPARE, style: "centered", blocks: ["table-compare"], defaultContent: [] },
      { id: "preferred", selector: ICONS, style: "centered", blocks: ["cards-icons"], defaultContent: ["h2"] },
      { id: "contact-bar", selector: CONTACT_BAR, style: null, blocks: ["cards-icon-bar"], defaultContent: ["h2"] },
      { id: "link-list", selector: LINK_LIST, style: null, blocks: ["cards-link-list"], defaultContent: ["h2"] },
      { id: "footnotes", selector: FOOTNOTES, style: null, blocks: ["footnotes"], defaultContent: [] }
    ],
    "/biz/practice-finance-medical-dental-loans/": [
      { id: "title", selector: TITLE, style: "centered", blocks: [], defaultContent: ["h1"] },
      { id: "hero", selector: HERO, style: null, blocks: ["hero-banner"], defaultContent: [] },
      { id: "value-props", selector: `${MAIN} > div.ps-marketing-small-promo-items`, style: "centered", blocks: ["cards-icons"], defaultContent: [] },
      { id: "columns", selector: HCARD, style: "centered", blocks: ["columns"], defaultContent: ["h2"] },
      { id: "features", selector: `${MAIN} > div.ps-marketing-small-promo-items:nth-of-type(2)`, style: "centered", blocks: ["cards-icons"], defaultContent: [] },
      { id: "promo", selector: PROMO, style: "grey", blocks: ["promo"], defaultContent: [] },
      { id: "footnotes", selector: FOOTNOTES, style: null, blocks: ["footnotes"], defaultContent: [] }
    ],
    "/biz/signify-rewards/": [
      { id: "title", selector: TITLE, style: "centered", blocks: [], defaultContent: ["h1"] },
      { id: "hero", selector: HERO, style: null, blocks: ["hero-banner"], defaultContent: [] },
      // Loose "Connect to Wells Fargo Vantage" CTA between hero and the icon grid.
      { id: "vantage-cta", selector: `${MAIN} > div.enhanced-txt-cm.text-aligned-center:nth-of-type(4)`, style: "centered", blocks: [], defaultContent: ["a"] },
      { id: "choices", selector: ICONS, style: "centered", blocks: ["cards-icons"], defaultContent: ["h2"] },
      { id: "need-card", selector: `${MAIN} > div.card-background-gray.text-aligned-center`, style: "grey", blocks: [], defaultContent: ["h2", "a"] },
      // Loose "Looking for consumer rewards?" CTA between the grey band and the FAQ.
      { id: "consumer-cta", selector: `${MAIN} > div.enhanced-txt-cm.text-aligned-center:nth-of-type(7)`, style: "centered", blocks: [], defaultContent: ["a"] },
      { id: "faq", selector: FAQ_HEAD, style: null, blocks: [], defaultContent: ["h2"] },
      { id: "accordion", selector: ACCORDION, style: null, blocks: ["accordion"], defaultContent: [] },
      { id: "footnotes", selector: FOOTNOTES, style: null, blocks: ["footnotes"], defaultContent: [] }
    ],
    "/biz/merchant/": [
      { id: "title", selector: TITLE, style: "centered", blocks: [], defaultContent: ["h1"] },
      { id: "hero", selector: HERO, style: null, blocks: ["hero-banner"], defaultContent: [] },
      { id: "services", selector: THREE_CARD, style: "centered", blocks: ["cards-image"], defaultContent: ["h2"] },
      { id: "connect", selector: TWO_CARD, style: "centered", blocks: ["cards-contact"], defaultContent: ["h2"] },
      { id: "footnotes", selector: FOOTNOTES, style: null, blocks: ["footnotes"], defaultContent: [] }
    ]
  };
  function pathnameOf(url) {
    try {
      const p = new URL(url).pathname;
      return p.endsWith("/") ? p : `${p}/`;
    } catch (e) {
      return url;
    }
  }
  function templateForUrl(url) {
    const path = pathnameOf(url);
    const sections = TEMPLATES[path] || [];
    return {
      name: "biz-product",
      blocks: BLOCKS,
      sections
    };
  }
  function executeTransformers(transformers, hookName, element, payload, template) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template });
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
    const seen = /* @__PURE__ */ new Set();
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
  var import_biz_product_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      const template = templateForUrl(params.originalURL || url);
      const transformers = [
        transform,
        ...template.sections && template.sections.length > 1 ? [transform2] : []
      ];
      executeTransformers(transformers, "beforeTransform", main, payload, template);
      const pageBlocks = findBlocksOnPage(document, template);
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
      executeTransformers(transformers, "afterTransform", main, payload, template);
      try {
        window.__tmain = main.innerHTML;
      } catch (e) {
      }
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: template.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_biz_product_exports);
})();
