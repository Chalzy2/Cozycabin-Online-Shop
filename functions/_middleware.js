// functions/_middleware.js
// ============================================================
//  Cozycabin Kenya — Cloudflare Pages Middleware  v4
//
//  Platforms covered:
//  ✅ WhatsApp  ✅ Facebook/Instagram  ✅ LinkedIn  ✅ Twitter/X
//  ✅ Telegram  ✅ Slack  ✅ Discord  ✅ iMessage  ✅ Google/Bing
//
//  HOW IT WORKS
//  ────────────────────────────────────────────────────────────
//  Social crawlers fetch your shared link, e.g.:
//    https://cozycabin.co.ke/?shop=streetlights&idx=1
//  This middleware detects the bot (by User-Agent), looks up the
//  product in og-data.json, and injects the matching og:image,
//  og:title and og:description into <head> before the response
//  is sent back to the crawler. Human visitors are not touched —
//  they pass straight through to the normal site.
//
//  WHERE THE PRODUCT DATA COMES FROM
//  ────────────────────────────────────────────────────────────
//  og-data.json is NOT hand-typed. It's generated straight from
//  products.js by scripts/build-og-data.js, which:
//    1. Runs products.js in a sandbox (same id/index logic the
//       browser uses, via cc-deeplink.js's CC_PRODUCTS_BY_ID map)
//    2. Reads off { id → category, index, title, description,
//       image, price, url } for every product card. Title reads
//       longName/title/shortName (whichever exists); description
//       is only ever taken from products.js — never invented.
//    3. Writes it to functions/og-data.json
//
//  This means a product's shared image/title/description can
//  never drift out of sync with the live site — there is only
//  ONE place product data is defined (products.js).
//
//  THIS RUNS AUTOMATICALLY ON EVERY DEPLOY
//  ────────────────────────────────────────────────────────────
//  Cloudflare Pages is configured to run:
//    node scripts/build-og-data.js
//  as its Build command, before each deploy. So adding a product
//  to products.js and pushing to Git is the only step required —
//  og-data.json regenerates itself as part of the build. You
//  should never hand-edit og-data.json.
//
//  URL FORMATS SUPPORTED
//  ────────────────────────────────────────────────────────────
//  Permanent:        ?id=mens-premium-formal-shoes
//  Legacy:            ?shop=shoes&idx=7   (category + card position)
//  Category only:     ?shop=shoes
//  Homepage:          (no params)
//
//  DEPLOY
//  ────────────────────────────────────────────────────────────
//  This file MUST live at exactly this path in your repo:
//    functions/_middleware.js
//  Cloudflare Pages only auto-detects Pages Functions inside the
//  /functions directory — a file named middleware.js sitting at
//  the repo root (or anywhere else) is never executed and will
//  silently do nothing, which is why OG tags weren't updating.
// ============================================================

import ogData from './og-data.json';

const SITE          = 'https://cozycabin.co.ke';
const SITE_NAME     = 'Cozycabin Kenya';
const DEFAULT_IMAGE = SITE + '/Images/og-default.jpg'; // keep this file at exactly 1200×630px

// ── Category display labels (used only for the category-level
//    fallback, when a link has no specific product attached) ──
const CAT_LABELS = {
  shoes: 'Shoes', travel: 'Travel Bags & Suitcases', hotpots: 'Hotpots',
  flasks: 'Vacuum Flasks', bottles: 'Water Bottles', cutlery: 'Cutlery Sets',
  dispenser: 'Water Dispensers', racks: 'Storage Racks', cookers: 'Cookers',
  blenders: 'Blenders', kettles: 'Electric Kettles', microwaves: 'Microwave Ovens',
  fridges: 'Refrigerators', washing: 'Washing Machines', irons: 'Electric Irons',
  heaters: 'Water Heaters', fansapp: 'Appliances', fans: 'Electric Fans',
  solarlights: 'Solar Lights', solarfans: 'Solar Fans', floodlights: 'Solar Floodlights',
  streetlights: 'Solar Street Lights', panels: 'Solar Panels', inverters: 'Solar Inverters',
  batteries: 'Solar Batteries', chargers: 'Solar Chargers', speakers: 'Speakers',
  earbuds: 'Earbuds', radios: 'Radios', tvbox: 'TV Boxes', smartwatch: 'Smart Watches',
  gaming: 'Gaming Accessories', phones: 'Mobile Phones', tablets: 'Tablets',
  laptops: 'Laptops', keyboards: 'Keyboards', mouse: 'Computer Mouse',
  printers: 'Printers', storage: 'Storage Devices', flashdisks: 'Flash Disks',
  powerbanks: 'Power Banks', cameras: 'Security Cameras', alarms: 'Alarm Systems',
  locks: 'Smart Locks', doorbells: 'Smart Doorbells', trackers: 'Trackers',
  sensors: 'Sensors', safes: 'Safes', recorders: 'Video Recorders',
  wallart: 'Wall Art', mirrors: 'Mirrors', flowers: 'Artificial Flowers',
  lamps: 'Decorative Lamps', carpets: 'Carpets', curtains: 'Curtains',
  frames: 'Photo Frames', vases: 'Flower Vases', duvets: 'Duvets',
  bedsheets: 'Bedsheets', blankets: 'Blankets', pillows: 'Pillows',
  mattress: 'Mattresses', covers: 'Mattress Covers', nets: 'Mosquito Nets',
  towels: 'Towels',
};

// ── Build { category: { index: id } } once, at module load,
//    straight from og-data.json — this is what makes legacy
//    ?shop=&idx= links work without a second hand-typed map. ──
const LEGACY_LOOKUP = (() => {
  const map = {};
  for (const id in ogData) {
    const { category, index } = ogData[id];
    if (!map[category]) map[category] = {};
    map[category][index] = id;
  }
  return map;
})();

// ── Detect social crawlers by User-Agent ──────────────────────
function isCrawler(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return (
    ua.includes('whatsapp') ||
    ua.includes('facebookexternalhit') ||
    ua.includes('facebookcatalog') ||
    ua.includes('meta-externalagent') ||
    ua.includes('instagram') ||
    ua.includes('twitterbot') ||
    ua.includes('xbot') ||
    ua.includes('telegrambot') ||
    ua.includes('linkedinbot') ||
    ua.includes('slackbot') ||
    ua.includes('discordbot') ||
    ua.includes('imessage') ||
    ua.includes('applebot') ||
    ua.includes('googlebot') ||
    ua.includes('bingbot') ||
    ua.includes('crawler') ||
    ua.includes('spider') ||
    ua.includes('preview')
  );
}

// ── Build the full OG / Twitter meta tag block ────────────────
function buildOGTags(title, desc, imageUrl, pageUrl, price) {
  const e = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');

  const priceTag = price
    ? `
  <meta property="product:price:amount"   content="${e(price)}">
  <meta property="product:price:currency" content="KES">`
    : '';

  return `
  <!-- ═══ Open Graph (WhatsApp, Facebook, LinkedIn, Discord, Slack, Telegram) ═══ -->
  <meta property="og:type"              content="website">
  <meta property="og:site_name"         content="${e(SITE_NAME)}">
  <meta property="og:url"               content="${e(pageUrl)}">
  <meta property="og:title"             content="${e(title)}">
  <meta property="og:description"       content="${e(desc)}">
  <meta property="og:image"             content="${e(imageUrl)}">
  <meta property="og:image:secure_url"  content="${e(imageUrl)}">
  <meta property="og:image:alt"         content="${e(title)}">
  <meta property="og:locale"            content="en_KE">${priceTag}

  <!-- ═══ Twitter / X ═══ -->
  <meta name="twitter:card"             content="summary_large_image">
  <meta name="twitter:site"             content="@CozycabinKenya">
  <meta name="twitter:title"            content="${e(title)}">
  <meta name="twitter:description"      content="${e(desc)}">
  <meta name="twitter:image"            content="${e(imageUrl)}">
  <meta name="twitter:image:alt"        content="${e(title)}">

  <!-- ═══ General / SEO ═══ -->
  <meta name="description"              content="${e(desc)}">
  <link rel="canonical"                 href="${e(pageUrl)}">`;
}

// ── Middleware entry point ─────────────────────────────────────
export async function onRequest(context) {
  const { request, next } = context;
  const userAgent = request.headers.get('user-agent') || '';

  // Human visitors pass straight through — zero overhead
  if (!isCrawler(userAgent)) return next();

  const url  = new URL(request.url);
  const id   = url.searchParams.get('id') || '';
  const shop = url.searchParams.get('shop') || '';
  const idx  = parseInt(url.searchParams.get('idx') || '0', 10);

  let ogTitle = `${SITE_NAME} — Quality Products`;
  let ogDesc  = 'Shop shoes, kitchenware, suitcases & more at Cozycabin Kenya. Delivered nationwide.';
  let ogImage = DEFAULT_IMAGE;
  let ogPrice = null;
  let ogUrl   = request.url;

  // Resolve a final product id from either ?id= or legacy ?shop=&idx=
  let resolvedId = null;
  if (id && ogData[id]) {
    resolvedId = id;
  } else if (shop && LEGACY_LOOKUP[shop] && LEGACY_LOOKUP[shop][idx] !== undefined) {
    resolvedId = LEGACY_LOOKUP[shop][idx];
  }

  if (resolvedId) {
    const p = ogData[resolvedId];
    ogTitle = p.title;             // plain product title — no price or site-name appended
    ogDesc  = p.description || ogDesc;
    ogImage = p.image || DEFAULT_IMAGE;
    ogPrice = p.price;
    ogUrl   = p.url;               // canonical ?id= link, even if shared via legacy ?shop=&idx=
  } else if (shop) {
    // Category-level fallback — link has a category but no
    // resolvable product (unknown idx, or category-only link)
    const catLabel = CAT_LABELS[shop] || shop;
    ogTitle = `Shop ${catLabel} | ${SITE_NAME}`;
    ogDesc  = `Browse our ${catLabel} collection at Cozycabin Kenya. Quality products delivered nationwide.`;
  }

  // Fetch the original page from origin, then rewrite its <head>
  const response = await next();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return response;

  const ogBlock = buildOGTags(ogTitle, ogDesc, ogImage, ogUrl, ogPrice);

  return new HTMLRewriter()
    .on('head', {
      element(element) { element.prepend(ogBlock, { html: true }); },
    })
    .on('meta[property^="og:"]',      { element: (el) => el.remove() })
    .on('meta[property^="product:"]', { element: (el) => el.remove() })
    .on('meta[name^="twitter:"]',     { element: (el) => el.remove() })
    .on('meta[name="description"]',   { element: (el) => el.remove() })
    .on('link[rel="canonical"]',      { element: (el) => el.remove() })
    .transform(response);
}
