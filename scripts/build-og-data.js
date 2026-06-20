#!/usr/bin/env node
// ============================================================
//  build-og-data.js — Cozycabin Kenya
//
//  WHAT THIS DOES
//  ────────────────────────────────────────────────────────────
//  Reads the real products.js, runs it in a sandboxed JS engine
//  (so it executes exactly like it would in the browser, with
//  fake stand-ins for document/window/localStorage), then reads
//  off `CC_PRODUCTS_BY_ID` — the SAME id → product map that
//  cc-deeplink.js uses on the live site — and writes it out as
//  functions/og-data.json.
//
//  WHY THIS EXISTS
//  ────────────────────────────────────────────────────────────
//  The old functions/_middleware.js had a second, hand-typed
//  copy of every product (PRODUCTS_MW) plus a hand-typed index
//  map (LEGACY_IDX). Every time products.js changed — a product
//  added, removed, or reorganised into a variant card — someone
//  had to remember to update that copy too. Nobody did, so the
//  middleware drifted out of sync with the real catalog. That's
//  why shares for some products showed the wrong image/title, or
//  no image at all.
//
//  This script makes products.js the ONLY source of truth.
//  Run it once after any products.js edit (or wire it into your
//  deploy/build command) and og-data.json is regenerated to
//  match exactly.
//
//  USAGE
//  ────────────────────────────────────────────────────────────
//    node scripts/build-og-data.js
//
//  Reads:  products.js               (repo root)
//  Writes: functions/og-data.json    (consumed by _middleware.js)
// ============================================================

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SITE = 'https://cozycabin.co.ke';
const ROOT = path.join(__dirname, '..');
const PRODUCTS_PATH = path.join(ROOT, 'products.js');
const OUTPUT_PATH = path.join(ROOT, 'functions', 'og-data.json');
const DEFAULT_IMAGE_PATH = 'Images/og-default.jpg'; // must match DEFAULT_IMAGE in functions/_middleware.js

// Set OG_ALLOW_MISSING_IMAGES=1 to downgrade missing-image errors to
// warnings instead of failing the build (not recommended — a missing
// image is exactly what causes "no image" in WhatsApp/FB/LinkedIn).
const STRICT = process.env.OG_ALLOW_MISSING_IMAGES !== '1';

// ── A safe, generic stand-in for document/window so products.js
//    can run outside a browser without crashing on DOM calls. ──
function fakeNode() {
  return {
    style: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener() {}, removeEventListener() {},
    appendChild(x) { return x; }, insertBefore(x) { return x; }, removeChild(x) { return x; },
    setAttribute() {}, removeAttribute() {}, getAttribute() { return null; },
    querySelector() { return null; }, querySelectorAll() { return []; },
    textContent: '', innerHTML: '',
  };
}

function buildSandbox() {
  const sandbox = {
    console,
    setInterval() {}, clearInterval() {}, setTimeout() {}, clearTimeout() {},
    requestAnimationFrame() {}, cancelAnimationFrame() {},
    IntersectionObserver: function () { return { observe() {}, disconnect() {}, unobserve() {} }; },
    MutationObserver: function () { return { observe() {}, disconnect() {} }; },
    URLSearchParams,
    localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    navigator: { userAgent: 'node', clipboard: undefined, share: undefined },
    document: Object.assign(fakeNode(), {
      head: fakeNode(),
      body: fakeNode(),
      getElementById() { return null; },
      createElement() { return fakeNode(); },
    }),
  };
  sandbox.window = sandbox; // products.js uses `window.X` and bare `X` interchangeably
  sandbox.window.location = { search: '', origin: SITE, pathname: '/' };
  sandbox.window.outerWidth = 0;
  sandbox.window.innerWidth = 0;
  sandbox.window.outerHeight = 0;
  sandbox.window.innerHeight = 0;
  sandbox.window.history = { replaceState() {} };
  sandbox.addEventListener = () => {};
  return sandbox;
}

// ── First image for any card, standard or variant ─────────────
// Handles every shape seen in products.js:
//   standard card        → product.images[0]
//   variant (image:)      → product.variants[0].image
//   variant (images:[])   → product.variants[0].images[0]
function firstImagePath(product) {
  if (product.images && product.images[0]) return product.images[0];
  if (product.variants && product.variants[0]) {
    const v = product.variants[0];
    if (v.image) return v.image;
    if (v.images && v.images[0]) return v.images[0];
  }
  return null;
}

function firstPrice(product) {
  if (product.price) return product.price;
  if (product.variants && product.variants[0] && product.variants[0].price) {
    return product.variants[0].price;
  }
  return null;
}

// ── Title: supports both schemas in products.js ────────────────
//   existing cards  → product.title
//   newer schema    → product.longName (falls back to shortName)
function resolveTitle(product) {
  return product.longName || product.title || product.shortName || '';
}

// ── Description: NEVER invented. If a product has no description
//    field in products.js, this script will not fabricate one — it
//    falls back to the title and prints a warning so you know to
//    add a real description, rather than silently shipping
//    placeholder marketing copy. ──
function resolveDescription(product, warnings) {
  if (product.description) return product.description.replace(/\s+/g, ' ').trim();
  const fallback = product.shortName || product.longName || product.title || '';
  warnings.push(`"${fallback}" has no "description" field — using its name as a placeholder. Add a description in products.js for a better-looking share preview.`);
  return fallback;
}

function toAbsoluteUrl(imgPath) {
  if (!imgPath) return null;
  if (/^https?:\/\//i.test(imgPath)) return imgPath;
  return SITE + '/' + imgPath.replace(/^\/+/, '');
}

// ── Confirm the image actually exists in the repo, case-sensitive,
//    exactly as Cloudflare will serve it. This is what would have
//    caught og-default.jpg silently not existing on the live site:
//    instead of shipping a broken og:image, the build now fails
//    loudly and tells you exactly which file is missing. ──────
function imageExistsOnDisk(imgPath) {
  if (!imgPath) return true; // nothing to check
  const cleanPath = imgPath.replace(/^\/+/, '');
  const fullPath = path.join(ROOT, cleanPath);
  if (!fs.existsSync(fullPath)) return false;
  // Case-sensitivity check: existsSync can return true on
  // case-insensitive filesystems even if the case doesn't match.
  // Confirm the actual directory listing contains this exact name.
  const dir = path.dirname(fullPath);
  const base = path.basename(fullPath);
  try {
    return fs.readdirSync(dir).includes(base);
  } catch {
    return false;
  }
}

function run() {
  const src = fs.readFileSync(PRODUCTS_PATH, 'utf8');
  const sandbox = buildSandbox();
  vm.createContext(sandbox);

  try {
    vm.runInContext(src, sandbox, { filename: 'products.js' });
  } catch (err) {
    console.error('✖ Failed to execute products.js in sandbox:', err.message);
    console.error('  This usually means products.js now calls a browser API this');
    console.error('  script does not stub yet. Add a no-op stub for it in buildSandbox()');
    console.error('  inside scripts/build-og-data.js and re-run.');
    process.exit(1);
  }

  const byId = sandbox.CC_PRODUCTS_BY_ID;
  if (!byId || typeof byId !== 'object') {
    console.error('✖ products.js ran, but window.CC_PRODUCTS_BY_ID was not found.');
    console.error('  Check that products.js still exposes it via `window.CC_PRODUCTS_BY_ID = ...`.');
    process.exit(1);
  }

  const entries = {};
  const warnings = [];
  const missingFiles = [];

  Object.keys(byId).forEach((id) => {
    const { category, index, product } = byId[id];
    const imgPath = firstImagePath(product);
    const title = resolveTitle(product);
    const description = resolveDescription(product, warnings);

    if (!imgPath) {
      warnings.push(`"${title}" (${id}) has no image field at all — it will use the default share image.`);
    } else if (!imageExistsOnDisk(imgPath)) {
      missingFiles.push(`"${title}" (${id}) references "${imgPath}", but that file does not exist in the repo (checked: ${path.join(ROOT, imgPath.replace(/^\/+/, ''))}). This is exactly what makes WhatsApp/Facebook/LinkedIn show no image — they fetch the URL, get your site's HTML fallback instead of an image, and silently drop it.`);
    }

    entries[id] = {
      category,
      index,
      title,
      description,
      image: toAbsoluteUrl(imgPath), // null → middleware falls back to DEFAULT_IMAGE
      price: firstPrice(product),
      url: `${SITE}/?id=${id}`,
    };
  });

  // The homepage / category-fallback default image matters just as
  // much — if it's missing, every link without a specific product
  // (including plain https://cozycabin.co.ke/) shows no image either.
  if (!imageExistsOnDisk(DEFAULT_IMAGE_PATH)) {
    missingFiles.push(`Default share image "${DEFAULT_IMAGE_PATH}" does not exist in the repo (checked: ${path.join(ROOT, DEFAULT_IMAGE_PATH)}). Add this file at exactly 1200×630px — it's used whenever a link has no specific product.`);
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(entries, null, 2) + '\n');

  console.log(`✓ Wrote ${Object.keys(entries).length} products to functions/og-data.json`);
  if (warnings.length) {
    console.log(`  ${warnings.length} warning(s):`);
    warnings.forEach((w) => console.log('  ⚠ ' + w));
  }

  if (missingFiles.length) {
    console.error(`\n✖ ${missingFiles.length} image file(s) referenced in products.js are missing from the repo:`);
    missingFiles.forEach((m) => console.error('  ✖ ' + m));
    if (STRICT) {
      console.error('\nBuild failed — fix the path(s) above or add the missing file(s), then redeploy.');
      console.error('(To deploy anyway with a broken image, set OG_ALLOW_MISSING_IMAGES=1 — not recommended.)');
      process.exit(1);
    } else {
      console.error('\nOG_ALLOW_MISSING_IMAGES=1 is set — continuing with a broken og:image for these products.');
    }
  }
}

run();
