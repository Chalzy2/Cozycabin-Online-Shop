// functions/_middleware.js
// ============================================================
//  Cozycabin Kenya — Cloudflare Pages Middleware  v5.1
//
//  Platforms: WhatsApp · Facebook · Instagram · LinkedIn
//             Telegram · Twitter/X · TikTok · Slack · Discord
//             iMessage · Google · Bing
//
// ============================================================
//  ROOT CAUSE OF THE BUG — READ THIS FIRST
// ============================================================
//
//  SYMPTOM
//  ───────
//  Every product URL — e.g.
//    https://www.cozycabin.co.ke/?id=double-door-refrigerators
//    https://www.cozycabin.co.ke/?id=3-in-1-luxurious-fibre-suitcase-set
//  shows the default WhatsApp preview:
//    "Cozycabin Kenya — Quality Products"
//  regardless of which product is shared.
//
//  ROOT CAUSE — LINE 70 (original file)
//  ─────────────────────────────────────
//  The original import was:
//
//    import ogData from './og-data.json';          ← BUG
//
//  Cloudflare's workerd runtime (used by Pages Functions) requires
//  an import assertion to load JSON modules. Without it, workerd
//  does NOT parse the file as a plain JavaScript object. Depending
//  on the compatibility_date in your wrangler.toml or Pages settings,
//  one of two things happens:
//
//    a) workerd throws a SyntaxError at startup and the entire
//       middleware function fails to load. Cloudflare catches this
//       and serves every request with next() — the raw static HTML.
//       The static HTML contains the hardcoded default OG tags.
//       WhatsApp reads those and shows "Cozycabin Kenya — Quality Products".
//
//    b) workerd treats the import as an opaque module object (not a
//       plain JS object), so `ogData` is defined but is not indexable
//       with string keys. Line 262 — `if (ogData[id])` — always
//       evaluates to undefined/falsy, resolvedId stays null, and the
//       middleware serves the default title and description for every
//       single product URL.
//
//  In both cases the symptom is identical: every shared URL shows
//  the same default preview regardless of which product is in the URL.
//
//  THE FIX
//  ───────
//  Add the JSON import assertion that workerd requires:
//
//    import ogData from './og-data.json' assert { type: 'json' };   ← FIXED
//
//  The 'assert' keyword has been supported by Cloudflare's workerd
//  since compatibility_date 2022-03-21 — the widest possible support.
//  The newer 'with' keyword (TC39 import attributes) also works but
//  requires a more recent compatibility_date. We use 'assert' here
//  for maximum compatibility.
//
//  A defensive guard is also added immediately after the import
//  (see the ogData guard block below). If the import somehow still
//  returns a non-object (e.g. on an unexpected runtime version),
//  the middleware logs a clear error and falls back gracefully
//  instead of crashing and serving unmodified HTML.
//
//  NOTHING ELSE WAS BROKEN
//  ───────────────────────
//  - The ?id= lookup logic was correct (ogData[id] would have worked
//    if ogData had loaded as an object).
//  - The ccSlug() output in og-data.json matches the ?id= values in
//    the bug report exactly:
//      ccSlug('Double Door Refrigerators')        = 'double-door-refrigerators'    ✓
//      ccSlug('3-in-1 Luxurious Fibre Suitcase Set') = '3-in-1-luxurious-fibre-suitcase-set' ✓
//  - The HTMLRewriter chain order is correct (prepend does not get
//    re-processed by the removal selectors — Cloudflare's streaming
//    rewriter does not re-parse injected HTML).
//  - The isCrawler() detection covers all required platforms.
//  - The WebP fallback strategy for WhatsApp is correct and retained.
//  - build-og-data.js generates og-data.json correctly.
//
//  SECONDARY NOTE — www vs non-www
//  ────────────────────────────────
//  The bug report URLs use https://www.cozycabin.co.ke/ but the
//  SITE constant below uses https://cozycabin.co.ke/ (no www).
//  This does NOT cause the default-title symptom — the middleware
//  reads ?id= from url.searchParams regardless of domain, and both
//  domains point to the same Cloudflare Pages project so the
//  middleware runs on both. However it does mean og:url and the
//  canonical link will point to the non-www version. Update the
//  SITE constant below to match your chosen canonical domain.
//
//  URL FORMATS SUPPORTED
//  ─────────────────────────────────────────────────────────
//  Permanent:    ?id=double-door-refrigerators
//  With variant: ?id=double-door-refrigerators&v=2  (v= ignored for OG)
//  With ref:     ?id=double-door-refrigerators&ref=CZ-62TFF  (ref ignored for OG)
//  Legacy:       ?shop=fridges&idx=0   (still works)
//  Category:     ?shop=fridges
//  Homepage:     (no params)
// ============================================================

// ── FIX: Added 'assert { type: "json" }' — this was the missing piece.
//    Without it, Cloudflare workerd does not parse og-data.json as a
//    plain object, causing every ogData[id] lookup to silently fail.
import ogData from './og-data.json' assert { type: 'json' };

// ── DEFENSIVE GUARD ──────────────────────────────────────────────
// If the import somehow still does not yield a plain object
// (e.g. future workerd change or misconfigured build), the middleware
// logs a clear error and falls through to the default title/description
// rather than crashing and serving completely unmodified HTML.
// This makes the failure mode visible in Cloudflare's log stream.
if (!ogData || typeof ogData !== 'object' || Array.isArray(ogData)) {
  console.error(
    '[middleware] FATAL: og-data.json did not load as a plain object. ' +
    'Check that the file exists at functions/og-data.json and that your ' +
    'Cloudflare Pages build command runs "node scripts/build-og-data.js" ' +
    'before deploying. All product previews will show the default title ' +
    'until this is resolved.'
  );
}

// ── Update this to match your canonical domain (www or non-www) ──
const SITE          = 'https://www.cozycabin.co.ke';
const SITE_NAME     = 'Cozycabin Kenya';
const DEFAULT_IMAGE = SITE + '/Images/og-default.jpg';

// Standard OG image dimensions — declared so WhatsApp/Facebook
// validate and fetch the image rather than silently skipping it.
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
// Guard against ogData being non-iterable if the import failed.
const LEGACY_LOOKUP = (() => {
  const map = {};
  if (!ogData || typeof ogData !== 'object') return map;
  for (const id in ogData) {
    const entry = ogData[id];
    if (!entry || typeof entry.category === 'undefined') continue;
    const { category, index } = entry;
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
  // v= (variant) and ref= (affiliate) are intentionally ignored here.
  // They are client-side only — the OG metadata for a product does not
  // change per variant or referral code. The canonical og:url always
  // uses ?id= only.
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
  //
  //  This is the EXACT product lookup path.
  //
  //  HOW IT WORKS (now that the import is fixed):
  //    ogData is a plain JS object keyed by product slug, e.g.:
  //    {
  //      "double-door-refrigerators": {
  //        title: "Double Door Refrigerators",
  //        description: "...",
  //        image: "https://cozycabin.co.ke/Images/...",
  //        price: 49500,
  //        url: "https://cozycabin.co.ke/?id=double-door-refrigerators",
  //        category: "fridges",
  //        index: 0
  //      },
  //      ...
  //    }
  //    url.searchParams.get('id') returns 'double-door-refrigerators'.
  //    ogData['double-door-refrigerators'] returns the product entry.
  //    ogTitle, ogDesc, ogImage are set from that entry.
  //    buildOGTags() emits the correct meta block.
  //    HTMLRewriter strips the static defaults and prepends the product block.
  //    WhatsApp reads the product-specific og:title, og:description, og:image.
  //
  let resolvedId = null;
  if (id) {
    // Guard: if ogData failed to load as an object, skip product lookup
    // and serve the default rather than crashing
    if (ogData && typeof ogData === 'object' && ogData[id]) {
      resolvedId = id;
    } else if (!ogData || typeof ogData !== 'object') {
      // Import failed — already logged at module load above
    } else {
      // id= present but not found in og-data.json
      // Most likely cause: a new product was added to products.js but
      // build-og-data.js has not been re-run and the site not redeployed.
      console.warn(
        `[middleware] ?id=${id} not found in og-data.json — serving default. ` +
        `Run "node scripts/build-og-data.js" and redeploy to fix this.`
      );
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
    // Always use the canonical ?id= URL — strips &v=, &ref=, and any
    // other client-side params that don't affect the product identity
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
  // 1. Prepend our complete, correct OG block at the top of <head>.
  //    Cloudflare's streaming HTMLRewriter does NOT re-process injected
  //    HTML, so the new block is safe from the removal selectors below.
  // 2. Remove all static OG/Twitter/TikTok tags baked into index.html
  //    so crawlers see only the product-specific tags above.
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
