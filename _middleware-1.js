// functions/_middleware.js
// ============================================================
//  Cozycabin Kenya — Cloudflare Pages Middleware
//
//  HOW IT WORKS:
//  ─────────────
//  This file runs at Cloudflare's edge for every request.
//  When a social crawler (WhatsApp, Facebook, iMessage, etc.)
//  fetches a URL like:
//
//    https://cozycabin.co.ke/?shop=shoes&idx=0
//
//  ...this middleware detects the bot User-Agent, looks up
//  the product data, and rewrites the <head> to inject the
//  correct og:image, og:title, og:description BEFORE the
//  response is sent — so the crawler sees the real thumbnail.
//
//  Human visitors pass through untouched — normal page loads.
//
//  DEPLOY:
//  ───────
//  1. In your GitHub repo, create:  functions/_middleware.js
//  2. Connect repo to Cloudflare Pages (free, see README).
//  3. Done. No other config needed.
// ============================================================

// ── Product data — mirrors your products.js ──────────────
// [title, price, imagePath, description]
// imagePath is relative to site root (matches products.js)
const PRODUCTS = {
  shoes: [
    ["Ladies Comfort Slip-On Sandals",      2299, "Images/Lopnshblu.webp",           "Stylish ladies slip-on sandals with cushioned footbed and elegant gold buckle design."],
    ["Ladies Fashion Sneakers",             2299, "Images/FLS-white.webp",           "Lightweight breathable ladies sneakers with cushioned sole and non-slip outsole."],
    ["Calvin Klein Casual",                 3200, "Images/kelvintan.webp",           "Premium Calvin Klein casual sneakers with durable sole."],
    ["Premium Timberland Casual",           3850, "Images/timber-black.webp",        "Premium Timberland casual sneakers for everyday wear and office casual outfits."],
    ["Timberland Casual Sneakers",          3500, "Images/timber-navy.webp",         "Premium Timberland sneakers — comfort and style for any occasion."],
    ["Women's Comfort Slip-On Sneakers",    1799, "Images/womenredwalker.webp",      "Lightweight breathable slip-on sneakers for everyday comfort and casual wear."],
    ["Ladies Comfort Sandals",              2499, "Images/Lsandlsb.webp",           "Elegant open-toe ladies sandals with comfortable low heel and stylish texture."],
    ["Men's Premium Formal Shoes",          3500, "Images/officialleatherbrwn.webp", "Premium men's formal shoes for office, weddings, church and special occasions."],
    ["Warm Plush House Slippers",            850, "Images/warmhseslippinky.webp",    "Soft plush indoor slippers with cozy fleece lining and non-slip sole."],
    ["Ladies Lightweight Slip-On Sneakers", 1499, "Images/cc.Lsandals-3.webp",      "Breathable lightweight slip-on sneakers with flexible sole and all-day comfort."],
  ],
  travel: [
    ["3 in 1 Luxurious Fibre Suitcase Set", 8500,  "Images/Siutbl.webp", "Premium 3-piece fibre suitcase set with 360° spinner wheels and telescopic handle."],
    ["4 in 1 Premium Fibre Suitcase Set",  11000,  "Images/1-9.webp",   "Luxury 4-piece fibre suitcase set with beauty case and smooth 360° spinner wheels."],
    ["3 in 1 Luxurious Suitcase", 23999,   "Images/LAXURIOUS3_1-S562616.webp",  "Luxurious 3in1 Managerial Bossy  quality unicrose multi-purpose Briefcase for travel."],
  ],
  cutlery: [
    ["Silicone Spoons",                    1499, "Images/blcksilicn.webp",        "Elegant silicone spoons for everyday kitchen use."],
    ["19PCS Premium Silicone Kitchenware", 2850, "Images/19pcsiliconb-1.webp",   "Complete 19-piece silicone kitchen utensil set with holder and chopping board."],
    ["24 Pcs Gold Cutlery Set",            2500, "Images/24goldcutlery-set.webp","Elegant 24-piece stainless steel cutlery set with stand, gold and silver finish."],
    ["6PCS Dining Cutlery Collection",      400, "Images/Spoonset-2.webp",       "Elegant stainless steel dining cutlery in gold and silver finishes."],
  ],
  hotpots: [
    ["Set of 4 Linex Hotpots",  4999, "Images/4pscLinexhpwhite.webp",   "Set of 4 Linex hotpots with pinhole filter and temperature indication."],
    ["Goldstar Hotpots 4pcs",   5500, "Images/4pschotpgoldstarw.webp",  "Goldstar 4-piece hotpots with pinhole filter and temperature indication."],
    ["Turkish Hot Pots",        5499, "Images/4pschotpturkish1.webp",   "Premium Turkish insulated hotpots — excellent quality and finish."],
  ],
// ── Variant products: idx maps to the variant, not the parent ──
  // Format: [variantName, price, firstImage, description]
  flasks: [
    ["Always Vacuum Bottle 500ml",      750,  "Images/548798.webp",       "Durable stainless steel vacuum flask with carrying strap. Keeps drinks hot or cold for hours."],
    ["6021 Temperature Flask 500ml",    550,  "Images/553404Flsktc.webp", "Stylish temperature display vacuum flask — see your drink's temperature at a glance."],
    ["Temperature Flask 500ml",         700,  "Images/temp-500ml.webp",   "Digital temperature display vacuum flask. Premium stainless steel, keeps hot/cold for hours."],
    ["Temperature Flask 800ml",         900,  "Images/548800.webp",       "Large capacity temperature display vacuum flask — perfect for long days or the office."],
    ["Temperature Flask 1000ml",       1000,  "Images/553404Flsktc.webp", "Extra large temperature display vacuum flask. Ideal for travel, hiking and outdoor use."],
    ["TC Vacuum Flask 500ml",           600,  "Images/553763Flsktc.webp", "Premium TC stainless steel vacuum flask with sleek finish and excellent insulation."],
    ["TC Vacuum Flask 600ml",           750,  "Images/tc-600ml.webp",     "TC insulated flask with larger capacity — great for all-day hydration on the go."],
    ["Muchen Vacuum Flask 800ml",       900,  "Images/551394Flsk.webp",   "Elegant Muchen insulated flask with premium build quality and stylish design."],
    ["Muchen Vacuum Flask 1000ml",     1000,  "Images/551394Flsk.webp",   "Large capacity Muchen vacuum flask — keeps drinks at perfect temperature all day long."],
  ],
};


const CAT_LABELS = {
  shoes:"Shoes & Footwear", travel:"Travel Bags & Suitcases",
  cutlery:"Cutlery & Kitchenware", hotpots:"Hot Pots",
  duvets:"Duvets", bedsheets:"Bed Sheets", blankets:"Blankets",
  pillows:"Pillows", towels:"Towels", wallart:"Wall Art",
  mirrors:"Mirrors", cameras:"CCTV Cameras", speakers:"Speakers",
  phones:"Phones", laptops:"Laptops",
};

const SITE     = "https://cozycabin.co.ke";
const DEFAULT_IMAGE = SITE + "/Images/og-default.webp";
const SITE_NAME     = "Cozycabin Kenya";

// ── Detect social media crawlers by User-Agent ────────────
function isCrawler(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return (
    ua.includes("whatsapp")     ||
    ua.includes("facebookexternalhit") ||
    ua.includes("twitterbot")   ||
    ua.includes("telegrambot")  ||
    ua.includes("linkedinbot")  ||
    ua.includes("slackbot")     ||
    ua.includes("discordbot")   ||
    ua.includes("imessage")     ||
    ua.includes("applebot")     ||
    ua.includes("googlebot")    ||
    ua.includes("bingbot")      ||
    ua.includes("crawler")      ||
    ua.includes("spider")       ||
    ua.includes("preview")
  );
}

// ── Build the OG meta tag block ───────────────────────────
function buildOGTags(title, desc, imageUrl, pageUrl) {
  const e = (s) => String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
  return `
  <meta property="og:type"         content="product">
  <meta property="og:site_name"    content="${e(SITE_NAME)}">
  <meta property="og:url"          content="${e(pageUrl)}">
  <meta property="og:title"        content="${e(title)}">
  <meta property="og:description"  content="${e(desc)}">
  <meta property="og:image"        content="${e(imageUrl)}">
  <meta property="og:image:width"  content="800">
  <meta property="og:image:height" content="800">
  <meta property="og:image:alt"    content="${e(title)}">
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:title"       content="${e(title)}">
  <meta name="twitter:description" content="${e(desc)}">
  <meta name="twitter:image"       content="${e(imageUrl)}">`;
}

// ── Middleware entry point ────────────────────────────────
export async function onRequest(context) {
  const { request, next } = context;
  const userAgent = request.headers.get("user-agent") || "";

  // Let non-crawler requests pass straight through — zero overhead
  if (!isCrawler(userAgent)) {
    return next();
  }

  // Parse ?shop= and ?idx= from the URL
  const url      = new URL(request.url);
  const shop     = url.searchParams.get("shop") || "";
  const idx      = parseInt(url.searchParams.get("idx") || "0", 10);
  const catLabel = CAT_LABELS[shop] || shop;

  // Defaults
  let ogTitle    = `${SITE_NAME} — Quality Products`;
  let ogDesc     = `Shop ${catLabel || "shoes, kitchenware, suitcases & more"} at Cozycabin Kenya. Delivered nationwide.`;
  let ogImage    = DEFAULT_IMAGE;

  // Look up specific product if data exists
  const catData = PRODUCTS[shop];
  if (catData && catData[idx]) {
    const [pTitle, pPrice, pImg, pDesc] = catData[idx];
    const priceStr = `KES ${Number(pPrice).toLocaleString("en-KE")}`;
    ogTitle = `${pTitle} — ${priceStr} | ${SITE_NAME}`;
    ogDesc  = pDesc;
    ogImage = SITE + "/" + pImg.replace(/^\//, "");
  } else if (shop) {
    ogTitle = `Shop ${catLabel} | ${SITE_NAME}`;
  }

  // Fetch the original page from origin
  const response = await next();

  // Only rewrite HTML responses
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  // Inject OG tags right after <head> using HTMLRewriter
  const ogBlock = buildOGTags(ogTitle, ogDesc, ogImage, request.url);

  const rewritten = new HTMLRewriter()
    .on("head", {
      element(element) {
        element.prepend(ogBlock, { html: true });
      }
    })
    .transform(response);

  return rewritten;
}
