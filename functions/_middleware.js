// functions/_middleware.js
// ============================================================
//  Cozycabin Kenya — Cloudflare Pages Middleware
//
//  Platforms covered:
//  ✅ WhatsApp
//  ✅ Facebook & Instagram (Meta)
//  ✅ TikTok
//  ✅ Twitter / X
//  ✅ Telegram
//  ✅ LinkedIn
//  ✅ Slack
//  ✅ Discord
//  ✅ iMessage / Apple
//  ✅ Google / Bing
//
//  HOW IT WORKS:
//  ─────────────
//  This file runs at Cloudflare's edge for every request.
//  When a social crawler fetches a URL like:
//
//    https://cozycabin.co.ke/?shop=travel&idx=2
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
//  1. In your GitHub repo, save as:  functions/_middleware.js
//  2. Connect repo to Cloudflare Pages (free).
//  3. Done. No other config needed.
// ============================================================

// ── Product data — mirrors your products.js ──────────────
// [title, price, imagePath, description]
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
    ["3 in 1 Luxurious Fibre Suitcase Set", 8500,  "Images/Siutbl.webp",            "Premium 3-piece fibre suitcase set with 360° spinner wheels and telescopic handle."],
    ["4 in 1 Premium Fibre Suitcase Set",  11000,  "Images/1-9.webp",               "Luxury 4-piece fibre suitcase set with beauty case and smooth 360° spinner wheels."],
    ["3 in 1 Luxurious Suitcase",          23999,  "Images/LuxurySs562632.webp",    "Premium 3-in-1 luxury Unicrose suitcase set featuring elegant design, durable hard shell, smooth spinner wheels, and spacious storage for business and leisure travel."],
  ],
  cutlery: [
    ["Silicone Spoons",                    1499, "Images/blcksilicn.webp",         "Elegant silicone spoons for everyday kitchen use."],
    ["19PCS Premium Silicone Kitchenware", 2850, "Images/19pcsiliconb-1.webp",    "Complete 19-piece silicone kitchen utensil set with holder and chopping board."],
    ["24 Pcs Gold Cutlery Set",            2500, "Images/24goldcutlery-set.webp", "Elegant 24-piece stainless steel cutlery set with stand, gold and silver finish."],
    ["6PCS Dining Cutlery Collection",      400, "Images/Spoonset-2.webp",        "Elegant stainless steel dining cutlery in gold and silver finishes."],
  ],
  hotpots: [
    ["Set of 4 Linex Hotpots",  4999, "Images/4pscLinexhpwhite.webp",  "Set of 4 Linex hotpots with pinhole filter and temperature indication."],
    ["Goldstar Hotpots 4pcs",   5500, "Images/4pschotpgoldstarw.webp", "Goldstar 4-piece hotpots with pinhole filter and temperature indication."],
    ["Turkish Hot Pots",        5499, "Images/4pschotpturkish1.webp",  "Premium Turkish insulated hotpots — excellent quality and finish."],
  ],
  flasks: [
    ["Always Vacuum Bottle 500ml",   750,  "Images/548798.webp",       "Durable stainless steel vacuum flask with carrying strap. Keeps drinks hot or cold for hours."],
    ["6021 Temperature Flask 500ml", 550,  "Images/553404Flsktc.webp", "Stylish temperature display vacuum flask — see your drink's temperature at a glance."],
    ["Temperature Flask 500ml",      700,  "Images/temp-500ml.webp",   "Digital temperature display vacuum flask. Premium stainless steel, keeps hot/cold for hours."],
    ["Temperature Flask 800ml",      900,  "Images/548800.webp",       "Large capacity temperature display vacuum flask — perfect for long days or the office."],
    ["Temperature Flask 1000ml",    1000,  "Images/553404Flsktc.webp", "Extra large temperature display vacuum flask. Ideal for travel, hiking and outdoor use."],
    ["TC Vacuum Flask 500ml",        600,  "Images/553763Flsktc.webp", "Premium TC stainless steel vacuum flask with sleek finish and excellent insulation."],
    ["TC Vacuum Flask 600ml",        750,  "Images/tc-600ml.webp",     "TC insulated flask with larger capacity — great for all-day hydration on the go."],
    ["Muchen Vacuum Flask 800ml",    900,  "Images/551394Flsk.webp",   "Elegant Muchen insulated flask with premium build quality and stylish design."],
    ["Muchen Vacuum Flask 1000ml",  1000,  "Images/551394Flsk.webp",   "Large capacity Muchen vacuum flask — keeps drinks at perfect temperature all day long."],
  ],
    streetlights: [
    ["Solar Street Light 100W", 2500, "Images/cozycabin-100w.webp", "Waterproof solar street light with automatic dusk-to-dawn sensor, bright LED illumination, remote control included and no wiring required."],
    ["Solar Street Light 200W", 3500, "Images/cozycabin-200w.webp", "Waterproof solar street light with automatic dusk-to-dawn sensor, bright LED illumination, remote control included and no wiring required."],
    ["Solar Street Light 300W", 4000, "Images/cozycabin-300w.webp", "Waterproof solar street light with automatic dusk-to-dawn sensor, bright LED illumination, remote control included and no wiring required."],
    ["Solar Street Light 400W", 4500, "Images/cozycabin-400w.webp", "Waterproof solar street light with automatic dusk-to-dawn sensor, bright LED illumination, remote control included and no wiring required."]
    ["1000W Solar Street Light", 7500, "Images/streetl1000w.webp", "Waterproof solar street light with automatic dusk-to-dawn sensor, ultra-bright LED illumination, remote control included and no wiring required."],
    ["2000W Solar Street Light", 8500, "Images/streetl2000w.webp", "Waterproof solar street light with automatic dusk-to-dawn sensor, ultra-bright LED illumination, remote control included and no wiring required."],
    ["3000W Solar Street Light", 10500, "Images/streetl3000w.webp", "Waterproof solar street light with automatic dusk-to-dawn sensor, ultra-bright LED illumination, remote control included and no wiring required."],
    ],
  floodlights: [
  ["30W Solar Security Floodlight",  4500,  "Images/solar-30w.jpg",  "Waterproof solar floodlight with automatic day/night sensor, IP66 waterproof and remote control included."],
  ["60W Solar Security Floodlight",  5500,  "Images/solar-60w.jpg",  "Waterproof solar floodlight with automatic day/night sensor, IP66 waterproof and remote control included."],
  ["100W Solar Security Floodlight", 6999,  "Images/solar-300w.jpg", "Waterproof solar floodlight with automatic day/night sensor, IP66 waterproof and remote control included."],
  ["200W Solar Security Floodlight", 9000,  "Images/solar-100w.jpg", "Waterproof solar floodlight with automatic day/night sensor, IP66 waterproof and remote control included."],
  ["300W Solar Security Floodlight", 12500, "Images/solar-200w.jpg", "Waterproof solar floodlight with automatic day/night sensor, IP66 waterproof and remote control included."],
],

solarCeiling: [
  ["50W Solar Indoor Ceiling Light",  2500, "Images/Solcl50w.webp",    "Solar indoor ceiling light with remote control, 3 lighting colors and up to 18 hours of lighting."],
  ["100W Solar Indoor Ceiling Light", 2500, "Images/Sol-cl100w.webp",  "Solar indoor ceiling light with remote control, 3 lighting colors and up to 18 hours of lighting."],
  ["200W Solar Indoor Ceiling Light", 3500, "Images/Sol-cl200w.webp",  "Solar indoor ceiling light with remote control, 3 lighting colors and up to 18 hours of lighting."],
  ["300W Solar Indoor Ceiling Light", 4500, "Images/Sol-cl300w.webp",  "Solar indoor ceiling light with remote control, 3 lighting colors and up to 18 hours of lighting."],
  ["400W Solar Indoor Ceiling Light", 5500, "Images/Sol-cl400w.webp",  "Solar indoor ceiling light with remote control, 3 lighting colors and up to 18 hours of lighting."],
],
yomy: [
  ["50W YOMY Solar Floodlight",  2500, "Images/Yommy50w.webp",   "Premium YOMY solar floodlight, IP65 waterproof with battery level indicator and automatic day/night operation."],
  ["100W YOMY Solar Floodlight", 3600, "Images/Yommy100w.webp",  "Premium YOMY solar floodlight, IP65 waterproof with battery level indicator and automatic day/night operation."],
  ["200W YOMY Solar Floodlight", 4900, "Images/Yommy200w.webp",  "Premium YOMY solar floodlight, IP65 waterproof with battery level indicator and automatic day/night operation."],
  ["300W YOMY Solar Floodlight", 6000, "Images/Yommy300w.webp",  "Premium YOMY solar floodlight, IP65 waterproof with battery level indicator and automatic day/night operation."],
  ["400W YOMY Solar Floodlight", 7500, "Images/Sol-cl400w.webp", "Premium YOMY solar floodlight, IP65 waterproof with battery level indicator and automatic day/night operation."],
 ],
};
const CAT_LABELS = {
  hotpots:       "Hotpots",
  flasks:        "Vacuum Flasks",
  bottles:       "Water Bottles",
  cutlery:       "Cutlery Sets",
  dispenser:     "Water Dispensers",
  racks:         "Storage Racks",
  cookers:       "Cookers",
  blenders:      "Blenders",
  kettles:       "Electric Kettles",
  microwaves:    "Microwave Ovens",
  fridges:       "Refrigerators",
  washing:       "Washing Machines",
  irons:         "Electric Irons",
  heaters:       "Water Heaters",
  fansapp:       "Appliances",
  fans:          "Electric Fans",
  shoes:         "Shoes",
  travel:        "Travel Bags & Suitcases",
  solarlights:   "Solar Lights",
  floodlights:   "Solar Floodlights",
  streetlights:  "Solar Street Lights",
  panels:        "Solar Panels",
  inverters:     "Solar Inverters",
  batteries:     "Solar Batteries",
  chargers:      "Solar Chargers",
  speakers:      "Speakers",
  earbuds:       "Earbuds",
  radios:        "Radios",
  tvbox:         "TV Boxes",
  smartwatch:    "Smart Watches",
  gaming:        "Gaming Accessories",
  phones:        "Mobile Phones",
  tablets:       "Tablets",
  laptops:       "Laptops",
  keyboards:     "Keyboards",
  mouse:         "Computer Mouse",
  printers:      "Printers",
  storage:       "Storage Devices",
  flashdisks:    "Flash Disks",
  powerbanks:    "Power Banks",
  cameras:       "Security Cameras",
  alarms:        "Alarm Systems",
  locks:         "Smart Locks",
  doorbells:     "Smart Doorbells",
  trackers:      "Trackers",
  sensors:       "Sensors",
  safes:         "Safes",
  recorders:     "Video Recorders",
  wallart:       "Wall Art",
  mirrors:       "Mirrors",
  flowers:       "Artificial Flowers",
  lamps:         "Decorative Lamps",
  carpets:       "Carpets",
  curtains:      "Curtains",
  frames:        "Photo Frames",
  vases:         "Flower Vases",
  duvets:        "Duvets",
  bedsheets:     "Bedsheets",
  blankets:      "Blankets",
  pillows:       "Pillows",
  mattress:      "Mattresses",
  covers:        "Mattress Covers",
  nets:          "Mosquito Nets",
  towels:        "Towels"

};

const SITE          = "https://cozycabin.co.ke";
const DEFAULT_IMAGE = SITE + "/Images/og-default.webp";
const SITE_NAME     = "Cozycabin Kenya";

// ── Detect social media crawlers by User-Agent ────────────
function isCrawler(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return (
    // WhatsApp
    ua.includes("whatsapp")              ||
    // Facebook & Instagram (Meta)
    ua.includes("facebookexternalhit")   ||
    ua.includes("facebookcatalog")       ||
    ua.includes("meta-externalagent")    ||
    ua.includes("instagram")             ||
    // TikTok
    ua.includes("tiktok")                ||
    ua.includes("bytespider")            ||  // TikTok's main crawler
    ua.includes("musical_ly")            ||
    // Twitter / X
    ua.includes("twitterbot")            ||
    ua.includes("xbot")                  ||
    // Telegram
    ua.includes("telegrambot")           ||
    // LinkedIn
    ua.includes("linkedinbot")           ||
    // Slack
    ua.includes("slackbot")              ||
    // Discord
    ua.includes("discordbot")            ||
    // iMessage / Apple
    ua.includes("imessage")              ||
    ua.includes("applebot")              ||
    // Google / Bing / SEO
    ua.includes("googlebot")             ||
    ua.includes("bingbot")               ||
    ua.includes("crawler")               ||
    ua.includes("spider")                ||
    ua.includes("preview")
  );
}

// ── Build the full OG/meta tag block for all platforms ────
function buildOGTags(title, desc, imageUrl, pageUrl, price) {
  const e = (s) => String(s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");

  const priceTag = price
    ? `
  <meta property="product:price:amount"   content="${e(price)}">
  <meta property="product:price:currency" content="KES">`
    : "";

  return `
  <!-- ═══ Open Graph (WhatsApp, Facebook, LinkedIn, Discord, Slack, Telegram) ═══ -->
  <meta property="og:type"                content="product">
  <meta property="og:site_name"           content="${e(SITE_NAME)}">
  <meta property="og:url"                 content="${e(pageUrl)}">
  <meta property="og:title"              content="${e(title)}">
  <meta property="og:description"        content="${e(desc)}">
  <meta property="og:image"              content="${e(imageUrl)}">
  <meta property="og:image:secure_url"   content="${e(imageUrl)}">
  <meta property="og:image:type"         content="image/webp">
  <meta property="og:image:width"        content="1200">
  <meta property="og:image:height"       content="1200">
  <meta property="og:image:alt"          content="${e(title)}">
  <meta property="og:locale"             content="en_KE">${priceTag}

  <!-- ═══ Twitter / X ═══ -->
  <meta name="twitter:card"              content="summary_large_image">
  <meta name="twitter:site"              content="@CozycabinKenya">
  <meta name="twitter:title"             content="${e(title)}">
  <meta name="twitter:description"       content="${e(desc)}">
  <meta name="twitter:image"             content="${e(imageUrl)}">
  <meta name="twitter:image:alt"         content="${e(title)}">

  <!-- ═══ TikTok ═══ -->
  <meta name="tiktok:card"               content="summary_large_image">
  <meta name="tiktok:title"              content="${e(title)}">
  <meta name="tiktok:description"        content="${e(desc)}">
  <meta name="tiktok:image"              content="${e(imageUrl)}">

  <!-- ═══ General / SEO ═══ -->
  <meta name="description"               content="${e(desc)}">
  <link rel="canonical"                  href="${e(pageUrl)}">`;
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
  let ogTitle = `${SITE_NAME} — Quality Products`;
  let ogDesc  = `Shop ${catLabel || "shoes, kitchenware, suitcases & more"} at Cozycabin Kenya. Delivered nationwide.`;
  let ogImage = DEFAULT_IMAGE;
  let ogPrice = null;

  // Look up specific product if data exists
  const catData = PRODUCTS[shop];
  if (catData && catData[idx]) {
    const [pTitle, pPrice, pImg, pDesc] = catData[idx];
    const priceStr = `KES ${Number(pPrice).toLocaleString("en-KE")}`;
    ogTitle = `${pTitle} — ${priceStr} | ${SITE_NAME}`;
    ogDesc  = pDesc;
    ogImage = SITE + "/" + pImg.replace(/^\//, "");
    ogPrice = pPrice;
  } else if (shop) {
    ogTitle = `Shop ${catLabel} | ${SITE_NAME}`;
  }

  // Fetch the original page from origin
  const response = await next();

  // Only rewrite HTML responses
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  // Remove any existing static OG tags then inject dynamic ones
  const ogBlock = buildOGTags(ogTitle, ogDesc, ogImage, request.url, ogPrice);

  const rewritten = new HTMLRewriter()
    .on("head", {
      element(element) {
        element.prepend(ogBlock, { html: true });
      }
    })
    // Remove hardcoded static og/twitter/description tags from your HTML
    // so they don't conflict with the dynamic ones above
    .on('meta[property^="og:"]',        { element: el => el.remove() })
    .on('meta[property^="product:"]',   { element: el => el.remove() })
    .on('meta[name^="twitter:"]',       { element: el => el.remove() })
    .on('meta[name^="tiktok:"]',        { element: el => el.remove() })
    .on('meta[name="description"]',     { element: el => el.remove() })
    .on('link[rel="canonical"]',        { element: el => el.remove() })
    .transform(response);

  return rewritten;
    }
    
