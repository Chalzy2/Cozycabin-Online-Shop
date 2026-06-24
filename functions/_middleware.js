// functions/_middleware.js
// ============================================================
//  Cozycabin Kenya — Cloudflare Pages Middleware  v5
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
//  ROOT CAUSE FIXED (v5)
//  ─────────────────────────────────────────────────────────
//  The previous middleware was injecting the correct product
//  title and description but the IMAGE was not rendering in
//  WhatsApp. Three bugs caused this:
//
//  BUG 1 — Missing og:image:type
//    WhatsApp's crawler requires the og:image:type meta tag to
//    know the image format before fetching it. Without it, many
//    WhatsApp versions (particularly Android) silently skip the
//    image even when the URL is valid and the file exists.
//
//  BUG 2 — Missing og:image:width and og:image:height
//    Facebook and WhatsApp use these tags to validate the image
//    dimensions before committing to a fetch. Without them, some
//    crawler versions skip the image fetch entirely — even if
//    og:image:type is present.
//
//  BUG 3 — WebP-only images with no JPG fallback
//    42 out of 43 product images in og-data.json are .webp.
//    WhatsApp has inconsistent WebP support across platforms and
//    app versions. Some Android versions of WhatsApp and all
//    older iOS WhatsApp builds cannot render WebP og:images at
//    all, even when og:image:type is correctly declared.
//    Fix: when the product image is WebP, emit TWO og:image
//    blocks. The first block serves the product's actual WebP
//    image (used by Facebook, Telegram, Slack, LinkedIn and
//    Discord, which all support WebP). The second block serves
//    the DEFAULT JPG image as a fallback. WhatsApp picks the
//    first format it can render, so it falls through to the JPG
//    and always shows something. Platforms that support WebP
//    use the product image.
//
//  WHAT WAS NOT BROKEN
//  ─────────────────────────────────────────────────────────
//  - og-data.json: correct, 43 products, all IDs match ccSlug()
//  - build-og-data.js: generates og-data.json correctly
//  - cc-deeplink.js: client-side only, not in the OG path
//  - Product ID generation: ccSlug() matches every og-data key
//  - The middleware was never showing the wrong product title or
//    description — it correctly resolved ?id= to the exact entry.
//    The only failure was the image not rendering on WhatsApp.
//
//  URL FORMATS SUPPORTED
//  ─────────────────────────────────────────────────────────
//  Permanent:    ?id=solar-security-floodlight
//  With variant: ?id=solar-security-floodlight&v=2  (v= ignored for OG)
//  Legacy:       ?shop=floodlights&idx=0   (still works)
//  Category:     ?shop=floodlights
//  Homepage:     (no params)
// ============================================================

import ogData from './og-data.json';

const SITE          = 'https://cozycabin.co.ke';
const SITE_NAME     = 'Cozycabin Kenya';
const DEFAULT_IMAGE = SITE + '/Images/og-default.jpg';

// Standard OG image dimensions — declare these so WhatsApp/Facebook
// validates and fetches the image rather than skipping it.
const OG_IMG_W = '1200';
const OG_IMG_H = '630';

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
// Used to resolve legacy ?shop=&idx= links without any hand-maintained map.
const LEGACY_LOOKUP = (() => {
  const map = {};
  for (const id in ogData) {
    const { category, index } = ogData[id];
    if (!map[category]) map[category] = {};
    map[category][index] = id;
  }
  return map;
})();

// ── Detect social crawlers ──────────────────────────────────────
function isCrawler(ua) {
  if (!ua) return false;
  const u = ua.toLowerCase();
  return (
    u.includes('whatsapp')             ||
    u.includes('facebookexternalhit')  ||
    u.includes('facebookcatalog')      ||
    u.includes('meta-externalagent')   ||
    u.includes('instagram')            ||
    u.includes('twitterbot')           ||
    u.includes('xbot')                 ||
    u.includes('telegrambot')          ||
    u.includes('linkedinbot')          ||
    u.includes('slackbot')             ||
    u.includes('discordbot')           ||
    u.includes('applebot')             ||
    u.includes('googlebot')            ||
    u.includes('bingbot')              ||
    u.includes('tiktok')               ||
    u.includes('crawler')              ||
    u.includes('spider')               ||
    u.includes('preview')
  );
}

// ── Determine MIME type from image URL ─────────────────────────
function imageMimeType(url) {
  if (!url) return 'image/jpeg';
  const u = url.toLowerCase();
  if (u.endsWith('.webp')) return 'image/webp';
  if (u.endsWith('.png'))  return 'image/png';
  if (u.endsWith('.gif'))  return 'image/gif';
  return 'image/jpeg'; // .jpg / .jpeg / default
}

// ── Build the full OG + Twitter + TikTok meta block ───────────
//
//  WEBP FALLBACK STRATEGY
//  When the product image is WebP:
//    - First og:image block  → WebP (used by FB, Telegram, Slack,
//                              LinkedIn, Discord — all support WebP)
//    - Second og:image block → og-default.jpg (JPG fallback)
//      WhatsApp picks the first image format it can actually render,
//      so it falls through to the JPG. Facebook uses the WebP.
//
//  When the product image is already JPG/PNG: single og:image block.
//
function buildOGTags(title, desc, imageUrl, pageUrl, price) {
  const e = s => String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');

  const priceTag = price ? `
  <meta property="product:price:amount"   content="${e(price)}">
  <meta property="product:price:currency" content="KES">` : '';

  // Resolve effective image: if imageUrl is null/empty use default
  const effectiveImage = imageUrl || DEFAULT_IMAGE;
  const mimeType       = imageMimeType(effectiveImage);
  const isWebP         = mimeType === 'image/webp';

  // Primary og:image block — the exact product image
  const primaryImageBlock = `
  <meta property="og:image"            content="${e(effectiveImage)}">
  <meta property="og:image:secure_url" content="${e(effectiveImage)}">
  <meta property="og:image:type"       content="${mimeType}">
  <meta property="og:image:width"      content="${OG_IMG_W}">
  <meta property="og:image:height"     content="${OG_IMG_H}">
  <meta property="og:image:alt"        content="${e(title)}">`;

  // JPG fallback block — only emitted when primary image is WebP.
  // WhatsApp ignores og:image blocks it cannot render and falls
  // through to the next one, so this guarantees an image appears.
  const webpFallbackBlock = isWebP ? `
  <meta property="og:image"            content="${e(DEFAULT_IMAGE)}">
  <meta property="og:image:secure_url" content="${e(DEFAULT_IMAGE)}">
  <meta property="og:image:type"       content="image/jpeg">
  <meta property="og:image:width"      content="${OG_IMG_W}">
  <meta property="og:image:height"     content="${OG_IMG_H}">
  <meta property="og:image:alt"        content="${e(title)}">` : '';

  return `
  <!-- ═══ Open Graph ═══ -->
  <meta property="og:type"             content="website">
  <meta property="og:site_name"        content="${e(SITE_NAME)}">
  <meta property="og:url"              content="${e(pageUrl)}">
  <meta property="og:title"            content="${e(title)}">
  <meta property="og:description"      content="${e(desc)}">
  <meta property="og:locale"           content="en_KE">${primaryImageBlock}${webpFallbackBlock}${priceTag}

  <!-- ═══ Twitter / X ═══ -->
  <meta name="twitter:card"            content="summary_large_image">
  <meta name="twitter:site"            content="@CozycabinKenya">
  <meta name="twitter:title"           content="${e(title)}">
  <meta name="twitter:description"     content="${e(desc)}">
  <meta name="twitter:image"           content="${e(effectiveImage)}">
  <meta name="twitter:image:alt"       content="${e(title)}">

  <!-- ═══ TikTok ═══ -->
  <meta name="tiktok:card"             content="summary_large_image">
  <meta name="tiktok:title"            content="${e(title)}">
  <meta name="tiktok:description"      content="${e(desc)}">
  <meta name="tiktok:image"            content="${e(effectiveImage)}">

  <!-- ═══ SEO ═══ -->
  <meta name="description"             content="${e(desc)}">
  <link rel="canonical"                href="${e(pageUrl)}">`;
}

// ── Middleware entry point ──────────────────────────────────────
export async function onRequest(context) {
  const { request, next } = context;
  const ua = request.headers.get('user-agent') || '';

  // Humans pass through instantly — zero overhead
  if (!isCrawler(ua)) return next();

  const url  = new URL(request.url);
  const path = url.pathname;

  // Skip non-HTML assets and internal/admin pages
  const SKIP_PAGES = [
    '/affiliate.html', '/admin.html',
    '/cozyreceipt.html', '/cozyreceipt-1.html', '/fashion.html',
  ];
  if (SKIP_PAGES.some(s => path === s || path.endsWith(s))) return next();
  if (path.includes('.') && !path.endsWith('/') && !path.endsWith('.html')) return next();

  // ── Read URL parameters ──────────────────────────────────────
  // Note: v= (variant selector) is intentionally ignored here.
  // It is client-side only — the OG image for a product does not
  // change per variant (variants share the parent product's entry
  // in og-data.json). The canonical og:url always uses ?id= only.
  const id   = url.searchParams.get('id')   || '';
  const shop = url.searchParams.get('shop') || '';
  const idx  = parseInt(url.searchParams.get('idx') || '0', 10);

  // Defaults — used when no product/category matches
  let ogTitle = `${SITE_NAME} — Quality Products`;
  let ogDesc  = 'Shop shoes, kitchenware, suitcases & more at Cozycabin Kenya. Delivered nationwide.';
  let ogImage = null; // null → buildOGTags uses DEFAULT_IMAGE
  let ogPrice = null;
  let ogUrl   = `${SITE}/`;

  // ── 1. Permanent ?id= link ────────────────────────────────────
  // This is the EXACT product lookup path.
  // CRITICAL: ogData[id] must exist AND be the correct entry.
  // og-data.json guarantees one-to-one id→product mapping because
  // build-og-data.js reads CC_PRODUCTS_BY_ID directly from products.js —
  // the same map cc-deeplink.js uses — so there is no drift.
  let resolvedId = null;
  if (id) {
    if (ogData[id]) {
      resolvedId = id;
    } else {
      // id= present but not found — could be a new product not yet rebuilt
      // Log it but don't fall back to first product; use safe defaults
      console.warn(`[middleware] ?id=${id} not found in og-data.json — serving default. Run build-og-data.js and redeploy.`);
    }
  }

  // ── 2. Legacy ?shop=&idx= link ────────────────────────────────
  else if (shop && LEGACY_LOOKUP[shop] && LEGACY_LOOKUP[shop][idx] !== undefined) {
    resolvedId = LEGACY_LOOKUP[shop][idx];
  }

  // ── Populate OG fields from the resolved product ──────────────
  if (resolvedId) {
    const p = ogData[resolvedId];
    ogTitle = p.title;
    ogDesc  = p.description || ogDesc;
    ogImage = p.image || null;   // null → DEFAULT_IMAGE in buildOGTags
    ogPrice = p.price  || null;
    // Always use the canonical ?id= URL — strips &v= and any other
    // client-side params that don't affect the product identity
    ogUrl   = p.url;
  } else if (shop && !resolvedId) {
    // Category-level share (no valid idx or idx out of range)
    const label = CAT_LABELS[shop] || shop;
    ogTitle = `Shop ${label} | ${SITE_NAME}`;
    ogDesc  = `Browse our ${label} collection at Cozycabin Kenya. Quality products, fast delivery.`;
    ogUrl   = `${SITE}/?shop=${encodeURIComponent(shop)}`;
  }
  // else: homepage — defaults already set above

  // ── Fetch the actual page and inject OG tags into <head> ──────
  const response = await next();
  const ct = response.headers.get('content-type') || '';
  if (!ct.includes('text/html')) return response;

  const ogBlock = buildOGTags(ogTitle, ogDesc, ogImage, ogUrl, ogPrice);

  // HTMLRewriter:
  // 1. Prepend our complete, correct OG block at the top of <head>
  // 2. Remove any static OG/Twitter/TikTok tags baked into index.html
  //    (they're fine for human browsers but for crawlers we replace them
  //    with product-specific tags generated above)
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
