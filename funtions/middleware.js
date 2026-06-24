// functions/_middleware.js
// ============================================================
//  Cozycabin Kenya — Cloudflare Pages Middleware  v3
//
//  Platforms covered:
//  ✅ WhatsApp  ✅ Facebook/Instagram  ✅ TikTok  ✅ Twitter/X
//  ✅ Telegram  ✅ LinkedIn  ✅ Slack  ✅ Discord
//  ✅ iMessage  ✅ Google / Bing
//
//  HOW IT WORKS:
//  ─────────────
//  Social crawlers fetch URLs like:
//    https://cozycabin.co.ke/?id=mens-premium-formal-shoes
//  This middleware detects the bot, looks up the product by its
//  permanent id slug, and injects the correct og:image, og:title,
//  og:description into <head> before the response is sent.
//
//  URL FORMATS SUPPORTED:
//  ─────────────────────────────────────────────────────────
//  NEW (permanent, never breaks):  ?id=mens-premium-formal-shoes
//  LEGACY (still works):           ?shop=shoes&idx=7
//  Category only:                  ?shop=shoes
//  Homepage:                       (no params)
//  ─────────────────────────────────────────────────────────
//
//  ADDING NEW PRODUCTS:
//  ─────────────────────────────────────────────────────────
//  Edit ONLY products.js on the client.
//  Then add ONE matching entry to PRODUCTS_MW here using
//  the same id slug (title lowercased, spaces → hyphens).
//  Format: "slug": [title, price, imagePath, description]
//
//  EXAMPLE:
//    "womens-silk-blouse": [
//      "Women's Silk Blouse", 1800,
//      "Images/silk-blouse.webp",
//      "Elegant silk blouse for office and evening wear."
//    ],
//
//  DEPLOY:
//  ───────
//  Save as  functions/_middleware.js  in your GitHub repo.
//  Cloudflare Pages picks it up automatically on next deploy.
// ============================================================

// ── Slug helper (same logic as ccSlug in products.js) ─────
function slugify(str) {
  return (str || '')
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── PRODUCT DATA ─────────────────────────────────────────────
// Keyed by permanent slug id.
// Add new products HERE (and in products.js) — never touch anything else.
// Format: "slug": [title, price, imagePath, description]
const PRODUCTS_MW = {

  // ── SHOES ─────────────────────────────────────────────────
  "ladies-comfort-slip-on-sandals":       ["Ladies Comfort Slip-On Sandals",      2299, "Images/Lopnshblu.webp",            "Stylish ladies slip-on sandals with cushioned footbed and elegant gold buckle design."],
  "ladies-fashion-sneakers":              ["Ladies Fashion Sneakers",             2299, "Images/FLS-white.webp",            "Lightweight breathable ladies sneakers with cushioned sole and non-slip outsole."],
  "calvin-klein-casual":                  ["Calvin Klein Casual",                 3200, "Images/kelvintan.webp",            "Premium Calvin Klein casual sneakers with durable sole."],
  "premium-timberland-casual":            ["Premium Timberland Casual",           3850, "Images/timber-black.webp",         "Premium Timberland casual sneakers for everyday wear and office casual outfits."],
  "timberland-casual-sneakers":           ["Timberland Casual Sneakers",          3500, "Images/timber-navy.webp",          "Premium Timberland sneakers — comfort and style for any occasion."],
  "womens-comfort-slip-on-sneakers":      ["Women's Comfort Slip-On Sneakers",    1799, "Images/womenredwalker.webp",       "Lightweight breathable slip-on sneakers for everyday comfort and casual wear."],
  "ladies-comfort-sandals":              ["Ladies Comfort Sandals",              2499, "Images/Lsandlsb.webp",            "Elegant open-toe ladies sandals with comfortable low heel and stylish texture."],
  "mens-premium-formal-shoes":            ["Men's Premium Formal Shoes",          3500, "Images/officialleatherbrwn.webp",  "Premium men's formal shoes for office, weddings, church and special occasions."],
  "warm-plush-house-slippers":            ["Warm Plush House Slippers",            850, "Images/warmhseslippinky.webp",     "Soft plush indoor slippers with cozy fleece lining and non-slip sole."],
  "ladies-lightweight-slip-on-sneakers":  ["Ladies Lightweight Slip-On Sneakers", 1499, "Images/cc.Lsandals-3.webp",       "Breathable lightweight slip-on sneakers with flexible sole and all-day comfort."],

  // ── TRAVEL ────────────────────────────────────────────────
  "3-in-1-luxurious-fibre-suitcase-set":  ["3 in 1 Luxurious Fibre Suitcase Set",  8500, "Images/Siutbl.webp",          "Premium 3-piece fibre suitcase set with 360° spinner wheels and telescopic handle."],
  "4-in-1-premium-fibre-suitcase-set":    ["4 in 1 Premium Fibre Suitcase Set",   11000, "Images/1-9.webp",             "Luxury 4-piece fibre suitcase set with beauty case and smooth 360° spinner wheels."],
  "3-in-1-luxurious-suitcase":            ["3 in 1 Luxurious Suitcase",           23999, "Images/LuxurySs562632.webp",  "Premium 3-in-1 luxury Unicrose suitcase set with elegant design and durable hard shell."],

  // ── CUTLERY ───────────────────────────────────────────────
  "silicone-spoons":                      ["Silicone Spoons",                    1499, "Images/blcksilicn.webp",          "Elegant silicone spoons for everyday kitchen use."],
  "19pcs-premium-silicone-kitchenware":   ["19PCS Premium Silicone Kitchenware", 2850, "Images/19pcsiliconb-1.webp",      "Complete 19-piece silicone kitchen utensil set with holder and chopping board."],
  "24-pcs-gold-cutlery-set":              ["24 Pcs Gold Cutlery Set",            2500, "Images/24goldcutlery-set.webp",   "Elegant 24-piece stainless steel cutlery set with stand, gold and silver finish."],
  "6pcs-dining-cutlery-collection":       ["6PCS Dining Cutlery Collection",      400, "Images/Spoonset-2.webp",         "Elegant stainless steel dining cutlery in gold and silver finishes."],

  // ── HOTPOTS ───────────────────────────────────────────────
  "set-of-4-linex-hotpots":               ["Set of 4 Linex Hotpots",  4999, "Images/4pscLinexhpwhite.webp",  "Set of 4 Linex hotpots with pinhole filter and temperature indication."],
  "goldstar-hotpots-4pcs":                ["Goldstar Hotpots 4pcs",   5500, "Images/4pschotpgoldstarw.webp", "Goldstar 4-piece hotpots with pinhole filter and temperature indication."],
  "turkish-hot-pots":                     ["Turkish Hot Pots",        5499, "Images/4pschotpturkish1.webp",  "Premium Turkish insulated hotpots — excellent quality and finish."],

  // ── FLASKS ────────────────────────────────────────────────
  "always-vacuum-bottle-500ml":           ["Always Vacuum Bottle 500ml",    750, "Images/548798.webp",       "Durable stainless steel vacuum flask. Keeps drinks hot or cold for hours."],
  "6021-temperature-flask-500ml":         ["6021 Temperature Flask 500ml",  550, "Images/553404Flsktc.webp", "Stylish temperature display vacuum flask."],
  "temperature-flask-500ml":              ["Temperature Flask 500ml",       700, "Images/temp-500ml.webp",   "Digital temperature display vacuum flask."],
  "temperature-flask-800ml":              ["Temperature Flask 800ml",       900, "Images/548800.webp",       "Large capacity temperature display vacuum flask."],
  "temperature-flask-1000ml":             ["Temperature Flask 1000ml",     1000, "Images/553404Flsktc.webp", "Extra large temperature display vacuum flask."],
  "tc-vacuum-flask-500ml":                ["TC Vacuum Flask 500ml",         600, "Images/553763Flsktc.webp", "Premium TC stainless steel vacuum flask."],
  "tc-vacuum-flask-600ml":                ["TC Vacuum Flask 600ml",         750, "Images/tc-600ml.webp",     "TC insulated flask with larger capacity."],
  "muchen-vacuum-flask-800ml":            ["Muchen Vacuum Flask 800ml",     900, "Images/551394Flsk.webp",   "Elegant Muchen insulated flask."],
  "muchen-vacuum-flask-1000ml":           ["Muchen Vacuum Flask 1000ml",   1000, "Images/551394Flsk.webp",   "Large capacity Muchen vacuum flask."],

  // ── SOLAR PANELS ──────────────────────────────────────────
  "solarmax-10w-panel":  ["Solarmax 10W Panel",   1200, "Images/solarmax-10w.webp",  "10W compact solar panel suitable for small lighting and charging systems."],
  "solarmax-15w-panel":  ["Solarmax 15W Panel",   1500, "Images/solarmax-15w.webp",  "15W solar panel for home lighting and small solar applications."],
  "solarmax-20w-panel":  ["Solarmax 20W Panel",   1800, "Images/solarmax-20w.webp",  "20W efficient solar panel ideal for lighting and charging batteries."],
  "solarmax-30w-panel":  ["Solarmax 30W Panel",   2300, "Images/solarmax-30w.webp",  "30W durable solar panel with reliable power generation."],
  "solarmax-40w-panel":  ["Solarmax 40W Panel",   2600, "Images/solarmax-40w.webp",  "40W high-efficiency solar panel for home solar systems."],
  "solarmax-50w-panel":  ["Solarmax 50W Panel",   2900, "Images/solarmax-50w.webp",  "50W solar panel with stable power output and durable design."],
  "solarmax-60w-panel":  ["Solarmax 60W Panel",   3000, "Images/solarmax-60w.webp",  "60W solar panel suitable for lighting, TVs and battery charging."],
  "solarmax-80w-panel":  ["Solarmax 80W Panel",   4500, "Images/solarmax-80w.webp",  "80W high-performance solar panel for medium-sized solar setups."],
  "solarmax-100w-panel": ["Solarmax 100W Panel",  5900, "Images/solarmax-100w.webp", "100W solar panel with efficient energy conversion and durable build."],
  "solarmax-120w-panel": ["Solarmax 120W Panel",  7000, "Images/solarmax-120w.webp", "120W solar panel ideal for homes, businesses and backup systems."],
  "solarmax-150w-panel": ["Solarmax 150W Panel",  7500, "Images/solarmax-150w.webp", "150W powerful solar panel with excellent charging efficiency."],
  "solarmax-200w-panel": ["Solarmax 200W Panel",  9500, "Images/solarmax-200w.webp", "200W premium solar panel for larger solar installations."],
  "solarmax-250w-panel": ["Solarmax 250W Panel", 10500, "Images/solarmax-250w.webp", "250W high-output solar panel with long-lasting performance."],
  "solarmax-300w-panel": ["Solarmax 300W Panel", 11500, "Images/solarmax-300w.webp", "300W premium solar panel offering maximum efficiency."],

  // ── SOLAR BATTERIES ───────────────────────────────────────
  "solar-gel-battery-bluetooth-ac-200w-100ah": ["Solar GEL Battery Bluetooth AC 200W 100Ah", 19000, "Images/yachu-ac100ah.webp",    "12V 100Ah multifunctional Solar GEL battery with built-in AC 220V output."],
  "solar-gel-battery-ac-100w-58ah":            ["Solar GEL Battery AC 100W 58Ah",              9800, "Images/gelac100w58ah.webp",    "58Ah GEL battery for AC 100W solar backup systems."],
  "solar-gel-battery-ac-200w-80ah":            ["Solar GEL Battery AC 200W 80Ah",             13000, "Images/yachuac200w80ah.webp",  "80Ah GEL battery for AC 200W solar systems."],
  "solar-gel-battery-usb-20ah":                ["Solar GEL Battery USB 20Ah",                  4500, "Images/gelusb20ah.webp",       "20Ah compact GEL battery with USB charging support."],
  "yachu-55ah-solar-gel-battery":              ["YACHU 55Ah Solar GEL Battery",                8000, "Images/yachu55ah.webp",        "55Ah maintenance-free GEL battery with deep cycle technology."],
  "yachu-80ah-solar-gel-battery":              ["YACHU 80Ah Solar GEL Battery",               10800, "Images/yachu80ah.webp",        "80Ah maintenance-free GEL battery."],
  "3491-100ah-gel-battery":                    ["3491 100Ah GEL Battery",                     14000, "Images/Gelb100ah.webp",        "100Ah maintenance-free GEL battery with 1-year warranty."],
  "yachu-100ah-solar-gel-battery":             ["YACHU 100Ah Solar GEL Battery",              17000, "Images/yachu100ah.webp",       "100Ah maintenance-free GEL battery with deep cycle technology."],
  "3491-150ah-gel-battery":                    ["3491 150Ah GEL Battery",                     20000, "Images/gelb150ah.webp",        "150Ah GEL battery with deep cycle performance."],
  "yachu-150ah-solar-gel-battery":             ["YACHU 150Ah Solar GEL Battery",              24500, "Images/yachu150ah.webp",       "150Ah heavy-duty GEL battery with 3-year warranty."],
  "3491-200ah-gel-battery":                    ["3491 200Ah GEL Battery",                     23500, "Images/gelb200ah.webp",        "200Ah high-capacity GEL battery."],
  "yachu-200ah-solar-gel-battery":             ["YACHU 200Ah Solar GEL Battery",              30500, "Images/yachu200ah.webp",       "200Ah premium GEL battery with deep cycle performance."],
  "yachu-200ah-heavy-duty-solar-gel-battery":  ["YACHU 200Ah Heavy Duty Solar GEL Battery",  32000, "Images/yachu200ahheavy.webp",  "200Ah heavy-duty GEL battery with extra backup capacity."],

  // ── SOLAR CEILING LIGHTS (key: solarlights in products.js) ──
  "solar-indoor-ceiling-light-50w":   ["Solar Indoor Ceiling Light 50W",   2500, "Images/Solcl50w.webp",    "Solar indoor ceiling light with remote control, 3 lighting colors, up to 18 hours."],
  "solar-indoor-ceiling-light-100w":  ["Solar Indoor Ceiling Light 100W",  2500, "Images/solarcl100w.webp", "Solar indoor ceiling light with remote control, 3 lighting colors, up to 18 hours."],
  "solar-indoor-ceiling-light-200w":  ["Solar Indoor Ceiling Light 200W",  3500, "Images/solarcl200w.webp", "Solar indoor ceiling light with remote control, 3 lighting colors, up to 18 hours."],
  "solar-indoor-ceiling-light-300w":  ["Solar Indoor Ceiling Light 300W",  4500, "Images/solarcel300w.webp","Solar indoor ceiling light with remote control, 3 lighting colors, up to 18 hours."],
  "solar-indoor-ceiling-light-400w":  ["Solar Indoor Ceiling Light 400W",  5500, "Images/solarcl400w.webp", "Solar indoor ceiling light with remote control, 3 lighting colors, up to 18 hours."],

  // ── STREET LIGHTS ─────────────────────────────────────────
  "solar-street-light-100w":  ["Solar Street Light 100W",   2500, "Images/cozycabin-100w.webp", "Waterproof solar street light with dusk-to-dawn sensor and remote control."],
  "solar-street-light-200w":  ["Solar Street Light 200W",   3500, "Images/cozycabin-200w.webp", "Waterproof solar street light with dusk-to-dawn sensor and remote control."],
  "solar-street-light-300w":  ["Solar Street Light 300W",   4000, "Images/cozycabin-300w.webp", "Waterproof solar street light with dusk-to-dawn sensor and remote control."],
  "solar-street-light-400w":  ["Solar Street Light 400W",   4500, "Images/cozycabin-400w.webp", "Waterproof solar street light with dusk-to-dawn sensor and remote control."],
  "1000w-solar-street-light": ["1000W Solar Street Light",  7500, "Images/Streetl1000w.webp",   "Ultra-bright solar street light with dusk-to-dawn sensor and remote control."],
  "2000w-solar-street-light": ["2000W Solar Street Light",  8500, "Images/Streetl2000w.webp",   "Ultra-bright solar street light with dusk-to-dawn sensor and remote control."],
  "3000w-solar-street-light": ["3000W Solar Street Light", 10500, "Images/streetl3000w.webp",   "Ultra-bright solar street light with dusk-to-dawn sensor and remote control."],

  // ── FLOODLIGHTS ───────────────────────────────────────────
  "30w-solar-security-floodlight":  ["30W Solar Security Floodlight",   4500, "Images/solar-30w.jpg",   "Waterproof solar floodlight with day/night sensor, IP66 and remote control."],
  "60w-solar-security-floodlight":  ["60W Solar Security Floodlight",   5500, "Images/solar-60w.jpg",   "Waterproof solar floodlight with day/night sensor, IP66 and remote control."],
  "100w-solar-security-floodlight": ["100W Solar Security Floodlight",  6999, "Images/solar-100w.jpg",  "Waterproof solar floodlight with day/night sensor, IP66 and remote control."],
  "200w-solar-security-floodlight": ["200W Solar Security Floodlight",  9000, "Images/solar-200w.jpg",  "Waterproof solar floodlight with day/night sensor, IP66 and remote control."],
  "300w-solar-security-floodlight": ["300W Solar Security Floodlight", 12500, "Images/solar-300w.jpg",  "Waterproof solar floodlight with day/night sensor, IP66 and remote control."],

  // ── JSOTUS SOLAR ──────────────────────────────────────────
  "40w-jsot-us-solar-floodlight":  ["40W JSOT US Solar Floodlight",  2900, "Images/solarl40w.webp",  "40W solar floodlight, IP67 waterproof with remote control."],
  "60w-jsot-us-solar-floodlight":  ["60W JSOT US Solar Floodlight",  3500, "Images/Solarl60w.webp",  "60W solar floodlight, IP67 waterproof with remote control."],
  "100w-jsot-us-solar-floodlight": ["100W JSOT US Solar Floodlight", 4500, "Images/solarl100w.webp", "100W solar floodlight, IP67 waterproof with remote control."],
  "200w-jsot-us-solar-floodlight": ["200W JSOT US Solar Floodlight", 5500, "Images/solarl200w.webp", "200W solar floodlight, IP67 waterproof with remote control."],
  "300w-jsot-us-solar-floodlight": ["300W JSOT US Solar Floodlight", 6500, "Images/solarl300w.webp", "300W solar floodlight, IP67 waterproof with remote control."],

  // ── YOMY SOLAR ────────────────────────────────────────────
  "50w-yomy-solar-floodlight":  ["50W YOMY Solar Floodlight",  2500, "Images/Yommy50w.webp",   "YOMY solar floodlight, IP65 waterproof with battery level indicator."],
  "100w-yomy-solar-floodlight": ["100W YOMY Solar Floodlight", 3600, "Images/Yommy100w.webp",  "YOMY solar floodlight, IP65 waterproof with battery level indicator."],
  "200w-yomy-solar-floodlight": ["200W YOMY Solar Floodlight", 4900, "Images/Yommy200w.webp",  "YOMY solar floodlight, IP65 waterproof with battery level indicator."],
  "300w-yomy-solar-floodlight": ["300W YOMY Solar Floodlight", 6000, "Images/Yommy300w.webp",  "YOMY solar floodlight, IP65 waterproof with battery level indicator."],
  "400w-yomy-solar-floodlight": ["400W YOMY Solar Floodlight", 7500, "Images/Sol-cl400w.webp", "YOMY solar floodlight, IP65 waterproof with battery level indicator."],

  // ── SOLAR FANS ────────────────────────────────────────────
  "dat-home-lighting-system-at-x10":                  ["DAT Home Lighting System AT-X10",                    5500, "Images/dat-atx10.webp",             "Solar home lighting system with Bluetooth, FM radio, fan and phone charging."],
  "golden-sun-solar-fan":                             ["Golden Sun Solar Fan",                               6900, "Images/goldensun-solarfan.webp",    "16-inch rechargeable solar fan with remote control and mosquito repellent."],
  "oraimo-powersolar-76-solar-home-power-system-with-fan": ["Oraimo PowerSolar 76 Solar Home Power System With Fan", 18000, "Images/oraimo-powersolar76.webp", "15W Oraimo solar home power system with fan, LED bulbs and USB charging."],
  "sunafrica-solar-mini-fan":                         ["SunAfrica Solar Mini Fan",                           2500, "Images/sunafrica-mini-fan.webp",    "Rechargeable solar mini fan with USB charging and long battery life."],
  "gdtimes-6-inch-solar-rechargeable-fan":            ["GDTIMES 6 Inch Solar Rechargeable Fan",              3500, "Images/gdtimes-6inch.webp",         "6-inch rechargeable fan with solar panel and LED light."],
  "aifike-solar-table-fan":                           ["Aifike Solar Table Fan",                             5500, "Images/aifike-solarfan.webp",       "Rechargeable table fan with solar panel and adjustable speed."],
  "golden-sun-solar-standing-fan":                    ["Golden Sun Solar Standing Fan",                      8500, "Images/goldensun-standingfan.webp", "16-inch solar standing fan with LED light and solar charging."],
  "solar-standing-fan-with-panel":                    ["Solar Standing Fan With Panel",                      9500, "Images/solar-standingfan.webp",     "16-inch rechargeable standing fan with solar panel."],
  "itel-rechargeable-solar-fan":                      ["Itel Rechargeable Solar Fan",                        8500, "Images/itel-solarfan.webp",         "Rechargeable Itel fan with solar panel and LED bulbs."],
  "easy-power-ep009-solar-fan":                       ["Easy Power EP009 Solar Fan",                         4500, "Images/easypower-ep009.webp",       "8-inch solar fan with Bluetooth speaker and FM radio."],
  "solar-rechargeable-box-fan":                       ["Solar Rechargeable Box Fan",                         3200, "Images/solar-boxfan.webp",          "Portable rechargeable box fan with solar charging."],

};

// ── Legacy positional array (keeps ?shop=&idx= links working) ─
// Maps category → ordered array of slugs (matches original products.js order)
// You only need to update this if someone still has an old ?shop=&idx= link.
const LEGACY_IDX = {
  shoes:       ["ladies-comfort-slip-on-sandals","ladies-fashion-sneakers","calvin-klein-casual","premium-timberland-casual","timberland-casual-sneakers","womens-comfort-slip-on-sneakers","ladies-comfort-sandals","mens-premium-formal-shoes","warm-plush-house-slippers","ladies-lightweight-slip-on-sneakers"],
  travel:      ["3-in-1-luxurious-fibre-suitcase-set","4-in-1-premium-fibre-suitcase-set","3-in-1-luxurious-suitcase"],
  cutlery:     ["silicone-spoons","19pcs-premium-silicone-kitchenware","24-pcs-gold-cutlery-set","6pcs-dining-cutlery-collection"],
  hotpots:     ["set-of-4-linex-hotpots","goldstar-hotpots-4pcs","turkish-hot-pots"],
  flasks:      ["always-vacuum-bottle-500ml","6021-temperature-flask-500ml","temperature-flask-500ml","temperature-flask-800ml","temperature-flask-1000ml","tc-vacuum-flask-500ml","tc-vacuum-flask-600ml","muchen-vacuum-flask-800ml","muchen-vacuum-flask-1000ml"],
  panels:      ["solarmax-10w-panel","solarmax-15w-panel","solarmax-20w-panel","solarmax-30w-panel","solarmax-40w-panel","solarmax-50w-panel","solarmax-60w-panel","solarmax-80w-panel","solarmax-100w-panel","solarmax-120w-panel","solarmax-150w-panel","solarmax-200w-panel","solarmax-250w-panel","solarmax-300w-panel"],
  batteries:   ["solar-gel-battery-bluetooth-ac-200w-100ah","solar-gel-battery-ac-100w-58ah","solar-gel-battery-ac-200w-80ah","solar-gel-battery-usb-20ah","yachu-55ah-solar-gel-battery","yachu-80ah-solar-gel-battery","3491-100ah-gel-battery","yachu-100ah-solar-gel-battery","3491-150ah-gel-battery","yachu-150ah-solar-gel-battery","3491-200ah-gel-battery","yachu-200ah-solar-gel-battery","yachu-200ah-heavy-duty-solar-gel-battery"],
  solarlights: ["solar-indoor-ceiling-light-50w","solar-indoor-ceiling-light-100w","solar-indoor-ceiling-light-200w","solar-indoor-ceiling-light-300w","solar-indoor-ceiling-light-400w"],
  solarCeiling:["solar-indoor-ceiling-light-50w","solar-indoor-ceiling-light-100w","solar-indoor-ceiling-light-200w","solar-indoor-ceiling-light-300w","solar-indoor-ceiling-light-400w"],
  streetlights:["solar-street-light-100w","solar-street-light-200w","solar-street-light-300w","solar-street-light-400w","1000w-solar-street-light","2000w-solar-street-light","3000w-solar-street-light"],
  floodlights: ["30w-solar-security-floodlight","60w-solar-security-floodlight","100w-solar-security-floodlight","200w-solar-security-floodlight","300w-solar-security-floodlight"],
  jsotussolar: ["40w-jsot-us-solar-floodlight","60w-jsot-us-solar-floodlight","100w-jsot-us-solar-floodlight","200w-jsot-us-solar-floodlight","300w-jsot-us-solar-floodlight"],
  yomy:        ["50w-yomy-solar-floodlight","100w-yomy-solar-floodlight","200w-yomy-solar-floodlight","300w-yomy-solar-floodlight","400w-yomy-solar-floodlight"],
  solarfans:   ["dat-home-lighting-system-at-x10","golden-sun-solar-fan","oraimo-powersolar-76-solar-home-power-system-with-fan","sunafrica-solar-mini-fan","gdtimes-6-inch-solar-rechargeable-fan","aifike-solar-table-fan","golden-sun-solar-standing-fan","solar-standing-fan-with-panel","itel-rechargeable-solar-fan","easy-power-ep009-solar-fan","solar-rechargeable-box-fan"],
};

// ── Category display labels ────────────────────────────────
const CAT_LABELS = {
  shoes:"Shoes", travel:"Travel Bags & Suitcases", hotpots:"Hotpots",
  flasks:"Vacuum Flasks", bottles:"Water Bottles", cutlery:"Cutlery Sets",
  dispenser:"Water Dispensers", racks:"Storage Racks", cookers:"Cookers",
  blenders:"Blenders", kettles:"Electric Kettles", microwaves:"Microwave Ovens",
  fridges:"Refrigerators", washing:"Washing Machines", irons:"Electric Irons",
  heaters:"Water Heaters", fansapp:"Appliances", fans:"Electric Fans",
  solarlights:"Solar Lights", solarfans:"Solar Fans", floodlights:"Solar Floodlights",
  streetlights:"Solar Street Lights", panels:"Solar Panels", inverters:"Solar Inverters",
  batteries:"Solar Batteries", chargers:"Solar Chargers", speakers:"Speakers",
  earbuds:"Earbuds", radios:"Radios", tvbox:"TV Boxes", smartwatch:"Smart Watches",
  gaming:"Gaming Accessories", phones:"Mobile Phones", tablets:"Tablets",
  laptops:"Laptops", keyboards:"Keyboards", mouse:"Computer Mouse",
  printers:"Printers", storage:"Storage Devices", flashdisks:"Flash Disks",
  powerbanks:"Power Banks", cameras:"Security Cameras", alarms:"Alarm Systems",
  locks:"Smart Locks", doorbells:"Smart Doorbells", trackers:"Trackers",
  sensors:"Sensors", safes:"Safes", recorders:"Video Recorders",
  wallart:"Wall Art", mirrors:"Mirrors", flowers:"Artificial Flowers",
  lamps:"Decorative Lamps", carpets:"Carpets", curtains:"Curtains",
  frames:"Photo Frames", vases:"Flower Vases", duvets:"Duvets",
  bedsheets:"Bedsheets", blankets:"Blankets", pillows:"Pillows",
  mattress:"Mattresses", covers:"Mattress Covers", nets:"Mosquito Nets",
  towels:"Towels"
};

const SITE          = "https://cozycabin.co.ke";
const DEFAULT_IMAGE = SITE + "/Images/og-default.webp";
const SITE_NAME     = "Cozycabin Kenya";

// ── Detect social crawlers by User-Agent ──────────────────
function isCrawler(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return (
    ua.includes("whatsapp")             ||
    ua.includes("facebookexternalhit")  ||
    ua.includes("facebookcatalog")      ||
    ua.includes("meta-externalagent")   ||
    ua.includes("instagram")            ||
    ua.includes("tiktok")               ||
    ua.includes("bytespider")           ||
    ua.includes("musical_ly")           ||
    ua.includes("twitterbot")           ||
    ua.includes("xbot")                 ||
    ua.includes("telegrambot")          ||
    ua.includes("linkedinbot")          ||
    ua.includes("slackbot")             ||
    ua.includes("discordbot")           ||
    ua.includes("imessage")             ||
    ua.includes("applebot")             ||
    ua.includes("googlebot")            ||
    ua.includes("bingbot")              ||
    ua.includes("crawler")              ||
    ua.includes("spider")               ||
    ua.includes("preview")
  );
}

// ── Build the full OG/meta tag block ─────────────────────
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
  <meta property="og:type"               content="product">
  <meta property="og:site_name"          content="${e(SITE_NAME)}">
  <meta property="og:url"                content="${e(pageUrl)}">
  <meta property="og:title"             content="${e(title)}">
  <meta property="og:description"       content="${e(desc)}">
  <meta property="og:image"             content="${e(imageUrl)}">
  <meta property="og:image:secure_url"  content="${e(imageUrl)}">
  <meta property="og:image:type"        content="image/webp">
  <meta property="og:image:width"       content="1200">
  <meta property="og:image:height"      content="1200">
  <meta property="og:image:alt"         content="${e(title)}">
  <meta property="og:locale"            content="en_KE">${priceTag}

  <!-- ═══ Twitter / X ═══ -->
  <meta name="twitter:card"             content="summary_large_image">
  <meta name="twitter:site"             content="@CozycabinKenya">
  <meta name="twitter:title"            content="${e(title)}">
  <meta name="twitter:description"      content="${e(desc)}">
  <meta name="twitter:image"            content="${e(imageUrl)}">
  <meta name="twitter:image:alt"        content="${e(title)}">

  <!-- ═══ TikTok ═══ -->
  <meta name="tiktok:card"              content="summary_large_image">
  <meta name="tiktok:title"             content="${e(title)}">
  <meta name="tiktok:description"       content="${e(desc)}">
  <meta name="tiktok:image"             content="${e(imageUrl)}">

  <!-- ═══ General / SEO ═══ -->
  <meta name="description"              content="${e(desc)}">
  <link rel="canonical"                 href="${e(pageUrl)}">`;
}

// ── Middleware entry point ────────────────────────────────
export async function onRequest(context) {
  const { request, next } = context;
  const userAgent = request.headers.get("user-agent") || "";

  // Human visitors pass straight through — zero overhead
  if (!isCrawler(userAgent)) return next();

  // Skip OG injection for non-root pages (receipt, affiliate, admin, etc.)
  // They should always be served as-is
  const url  = new URL(request.url);
  const _p   = url.pathname;
  const _skip = ['/affiliate.html','/admin.html','/cozyreceipt.html','/cozyreceipt-1.html','/fashion.html'];
  if (_skip.some(s => _p === s || _p.endsWith(s))) return next();
  // Skip any non-HTML asset
  if (_p.includes('.') && !_p.endsWith('/') && !_p.endsWith('.html')) return next();
  const id   = url.searchParams.get("id")   || "";
  const shop = url.searchParams.get("shop") || "";
  const idx  = parseInt(url.searchParams.get("idx") || "0", 10);

  let ogTitle = `${SITE_NAME} — Quality Products`;
  let ogDesc  = `Shop shoes, kitchenware, suitcases & more at Cozycabin Kenya. Delivered nationwide.`;
  let ogImage = DEFAULT_IMAGE;
  let ogPrice = null;

  // ── Priority 1: permanent ?id= param (new format) ──────
  if (id && PRODUCTS_MW[id]) {
    const [pTitle, pPrice, pImg, pDesc] = PRODUCTS_MW[id];
    const priceStr = `KES ${Number(pPrice).toLocaleString("en-KE")}`;
    ogTitle = `${pTitle} — ${priceStr} | ${SITE_NAME}`;
    ogDesc  = pDesc;
    ogImage = SITE + "/" + pImg.replace(/^\//, "");
    ogPrice = pPrice;
  }
  // ── Priority 2: legacy ?shop=&idx= param ───────────────
  else if (shop) {
    const catLabel = CAT_LABELS[shop] || shop;
    // Look up slug from legacy index map, then look up data
    const slugArr = LEGACY_IDX[shop];
    const slug    = slugArr && slugArr[idx] ? slugArr[idx] : null;
    if (slug && PRODUCTS_MW[slug]) {
      const [pTitle, pPrice, pImg, pDesc] = PRODUCTS_MW[slug];
      const priceStr = `KES ${Number(pPrice).toLocaleString("en-KE")}`;
      ogTitle = `${pTitle} — ${priceStr} | ${SITE_NAME}`;
      ogDesc  = pDesc;
      ogImage = SITE + "/" + pImg.replace(/^\//, "");
      ogPrice = pPrice;
    } else {
      // Category-level fallback (no specific product)
      ogTitle = `Shop ${catLabel} | ${SITE_NAME}`;
      ogDesc  = `Browse our ${catLabel} collection at Cozycabin Kenya. Quality products delivered nationwide.`;
    }
  }

  // Fetch original page from origin
  const response = await next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const ogBlock = buildOGTags(ogTitle, ogDesc, ogImage, request.url, ogPrice);

  const rewritten = new HTMLRewriter()
    .on("head", {
      element(element) { element.prepend(ogBlock, { html: true }); }
    })
    .on('meta[property^="og:"]',      { element: el => el.remove() })
    .on('meta[property^="product:"]', { element: el => el.remove() })
    .on('meta[name^="twitter:"]',     { element: el => el.remove() })
    .on('meta[name^="tiktok:"]',      { element: el => el.remove() })
    .on('meta[name="description"]',   { element: el => el.remove() })
    .on('link[rel="canonical"]',      { element: el => el.remove() })
    .transform(response);

  return rewritten;
}
