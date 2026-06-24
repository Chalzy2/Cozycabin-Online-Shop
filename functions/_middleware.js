// functions/_middleware.js
// ============================================================
//  Cozycabin Kenya — Cloudflare Pages Middleware  v4
//
//  Platforms: WhatsApp · Facebook · Instagram · LinkedIn
//             Telegram · Twitter/X · TikTok · Slack · Discord
//             iMessage · Google · Bing
//
//  HOW IT WORKS
//  ─────────────────────────────────────────────────────────
//  Social crawlers fetch a shared product URL, e.g.:
//    https://cozycabin.co.ke/?id=solar-security-floodlight
//  This middleware detects the bot, looks up the product in
//  og-data.json (auto-generated from products.js at build time),
//  and injects the correct og:image / og:title / og:description
//  before the response reaches the crawler.
//
//  NO MORE MANUAL PRODUCTS_MW
//  ─────────────────────────────────────────────────────────
//  The old PRODUCTS_MW object was a hand-maintained duplicate
//  of products.js that drifted out of sync — missing 23+ products
//  and causing "no image" on every share of a missing slug.
//
//  og-data.json is generated automatically by:
//    node scripts/build-og-data.js
//  which runs as the Cloudflare Pages build command (npm run build)
//  on every deploy. It reads CC_PRODUCTS_BY_ID directly from
//  products.js — the SAME map cc-deeplink.js uses — so every
//  product that exists in products.js is automatically covered.
//
//  URL FORMATS SUPPORTED
//  ─────────────────────────────────────────────────────────
//  Permanent:    ?id=solar-security-floodlight
//  Legacy:       ?shop=floodlights&idx=0   (still works)
//  Category:     ?shop=floodlights
//  Homepage:     (no params)
// ============================================================

import ogData from './og-data.json';

const SITE         = 'https://cozycabin.co.ke';
const SITE_NAME    = 'Cozycabin Kenya';
const DEFAULT_IMAGE = SITE + '/Images/og-default.jpg';

// ── Category display labels (for category-level share fallback) ──
const CAT_LABELS = {
  shoes:'Shoes & Footwear', travel:'Travel Bags & Suitcases',
  cutlery:'Kitchenware & Cutlery', hotpots:'Hot Pots', flasks:'Vacuum Flasks',
  solarlights:'Solar Lights', panels:'Solar Panels', inverters:'Solar Inverters',
  batteries:'Solar Batteries', chargers:'Solar Chargers',
  streetlights:'Solar Street Lights', floodlights:'Solar Floodlights',
  solarfans:'Solar Fans', fridges:'Refrigerators', washingmachines:'Washing Machines',
  cookers:'Cookers', heaters:'Room Heaters', microwaves:'Microwave Ovens',
  fashion:'Fashion', kitchen:'Kitchen', solar:'Solar', appliances:'Appliances',
  decor:'Home Décor', bedding:'Bedding', security:'Security',
  electronics:'Electronics', computers:'Computers',
  emobility:'E-Mobility', crafts:'Crafts', services:'Services',
};

// ── Build { category → { index → id } } once at module load ──
// This is what makes legacy ?shop=&idx= links resolve without
// any hand-maintained index map.
const LEGACY_LOOKUP = (() => {
  const map = {};
  for (const id in ogData) {
    const { category, index } = ogData[id];
    if (!map[category]) map[category] = {};
    map[category][index] = id;
  }
  return map;
})();

// ── Crawler detection ─────────────────────────────────────────
function isCrawler(ua) {
  if (!ua) return false;
  const u = ua.toLowerCase();
  return (
    u.includes('whatsapp') || u.includes('facebookexternalhit') ||
    u.includes('facebookcatalog') || u.includes('meta-externalagent') ||
    u.includes('instagram') || u.includes('twitterbot') || u.includes('xbot') ||
    u.includes('telegrambot') || u.includes('linkedinbot') ||
    u.includes('slackbot') || u.includes('discordbot') ||
    u.includes('applebot') || u.includes('googlebot') || u.includes('bingbot') ||
    u.includes('tiktok') || u.includes('crawler') ||
    u.includes('spider') || u.includes('preview')
  );
}

// ── OG + Twitter + TikTok meta block ─────────────────────────
function buildOGTags(title, desc, imageUrl, pageUrl, price) {
  const e = s => String(s)
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

  const priceTag = price ? `
  <meta property="product:price:amount"   content="${e(price)}">
  <meta property="product:price:currency" content="KES">` : '';

  return `
  <!-- ═══ Open Graph ═══ -->
  <meta property="og:type"             content="website">
  <meta property="og:site_name"        content="${e(SITE_NAME)}">
  <meta property="og:url"              content="${e(pageUrl)}">
  <meta property="og:title"            content="${e(title)}">
  <meta property="og:description"      content="${e(desc)}">
  <meta property="og:image"            content="${e(imageUrl)}">
  <meta property="og:image:secure_url" content="${e(imageUrl)}">
  <meta property="og:image:alt"        content="${e(title)}">
  <meta property="og:locale"           content="en_KE">${priceTag}

  <!-- ═══ Twitter / X ═══ -->
  <meta name="twitter:card"            content="summary_large_image">
  <meta name="twitter:site"            content="@CozycabinKenya">
  <meta name="twitter:title"           content="${e(title)}">
  <meta name="twitter:description"     content="${e(desc)}">
  <meta name="twitter:image"           content="${e(imageUrl)}">
  <meta name="twitter:image:alt"       content="${e(title)}">

  <!-- ═══ TikTok ═══ -->
  <meta name="tiktok:card"             content="summary_large_image">
  <meta name="tiktok:title"            content="${e(title)}">
  <meta name="tiktok:description"      content="${e(desc)}">
  <meta name="tiktok:image"            content="${e(imageUrl)}">

  <!-- ═══ SEO ═══ -->
  <meta name="description"             content="${e(desc)}">
  <link rel="canonical"                href="${e(pageUrl)}">`;
}

// ── Middleware entry point ────────────────────────────────────
export async function onRequest(context) {
  const { request, next } = context;
  const ua = request.headers.get('user-agent') || '';

  // Humans pass straight through — zero overhead
  if (!isCrawler(ua)) return next();

  const url   = new URL(request.url);
  const path  = url.pathname;

  // Skip non-HTML assets and internal pages
  const SKIP_PAGES = ['/affiliate.html','/admin.html','/cozyreceipt.html','/cozyreceipt-1.html','/fashion.html'];
  if (SKIP_PAGES.some(s => path === s || path.endsWith(s))) return next();
  if (path.includes('.') && !path.endsWith('/') && !path.endsWith('.html')) return next();

  const id   = url.searchParams.get('id')   || '';
  const shop = url.searchParams.get('shop') || '';
  const idx  = parseInt(url.searchParams.get('idx') || '0', 10);

  let ogTitle = `${SITE_NAME} — Quality Products`;
  let ogDesc  = 'Shop shoes, kitchenware, suitcases & more at Cozycabin Kenya. Delivered nationwide.';
  let ogImage = DEFAULT_IMAGE;
  let ogPrice = null;
  let ogUrl   = request.url;

  // ── 1. Permanent ?id= link ────────────────────────────────
  let resolvedId = null;
  if (id && ogData[id]) {
    resolvedId = id;
  }
  // ── 2. Legacy ?shop=&idx= link ────────────────────────────
  else if (shop && LEGACY_LOOKUP[shop] && LEGACY_LOOKUP[shop][idx] !== undefined) {
    resolvedId = LEGACY_LOOKUP[shop][idx];
  }

  if (resolvedId) {
    const p     = ogData[resolvedId];
    ogTitle = p.title;
    ogDesc  = p.description || ogDesc;
    ogImage = p.image || DEFAULT_IMAGE;
    ogPrice = p.price;
    ogUrl   = p.url; // canonical ?id= URL even if shared via legacy link
  } else if (shop) {
    // Category-level fallback
    const label = CAT_LABELS[shop] || shop;
    ogTitle = `Shop ${label} | ${SITE_NAME}`;
    ogDesc  = `Browse our ${label} collection at Cozycabin Kenya. Quality products, fast delivery.`;
  }

  const response = await next();
  const ct = response.headers.get('content-type') || '';
  if (!ct.includes('text/html')) return response;

  const ogBlock = buildOGTags(ogTitle, ogDesc, ogImage, ogUrl, ogPrice);

  return new HTMLRewriter()
    .on('head', { element(el) { el.prepend(ogBlock, { html: true }); } })
    .on('meta[property^="og:"]',      { element: el => el.remove() })
    .on('meta[property^="product:"]', { element: el => el.remove() })
    .on('meta[name^="twitter:"]',     { element: el => el.remove() })
    .on('meta[name^="tiktok:"]',      { element: el => el.remove() })
    .on('meta[name="description"]',   { element: el => el.remove() })
    .on('link[rel="canonical"]',      { element: el => el.remove() })
    .transform(response);
}
