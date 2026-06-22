// ============================================================
//  COZYCABIN SECURITY — client-side protections
//  Does NOT affect image uploads, product display, or modals
// ============================================================
(function cozySecurity() {

  // 1. Block right-click (prevents casual image stealing)
  document.addEventListener('contextmenu', function(e) {
    var tag = e.target.tagName;
    if (tag === 'IMG' || tag === 'VIDEO') {
      e.preventDefault();
      return false;
    }
  });

  // 2. Block drag-save of images & videos
  document.addEventListener('dragstart', function(e) {
    var tag = e.target.tagName;
    if (tag === 'IMG' || tag === 'VIDEO') { e.preventDefault(); }
  });

  // 3. Disable long-press save on iOS/Android (pointer hold)
  document.addEventListener('touchstart', function(e) {
    var tag = e.target.tagName;
    if (tag === 'IMG' || tag === 'VIDEO') {
      e.target.setAttribute('draggable', 'false');
    }
  }, { passive: true });

  // 4. Block keyboard shortcuts for save/print/view-source (F12, Ctrl+S, Ctrl+P, Ctrl+U)
  document.addEventListener('keydown', function(e) {
    // F12 — DevTools
    if (e.key === 'F12') { e.preventDefault(); return false; }
    // Ctrl/Cmd + S (save), P (print), U (view-source)
    if ((e.ctrlKey || e.metaKey) && ['s','S','p','P','u','U'].indexOf(e.key) !== -1) {
      e.preventDefault(); return false;
    }
  });

  // DevTools detection — log only, never block page
  var devToolsOpen = false;
setInterval(function() {
  var w = window.outerWidth - window.innerWidth;
  var h = window.outerHeight - window.innerHeight;
  if (!devToolsOpen && (w > 300 || h > 300)) {
    devToolsOpen = true;
    console.clear();
    console.log('%c⚠ COZYCABIN — Authorised access only', 'color:#ffd700;font-size:14px;font-weight:bold;');
  } else if (devToolsOpen && w < 300 && h < 300) {
    devToolsOpen = false;
  }
}, 1500);

  // 6. CSS: prevent text selection on product cards (images, titles)
  var noSelectStyle = document.createElement('style');
  noSelectStyle.textContent =
    '.product-card img,.product-card video,.cc-gallery{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;}' +
    '.cc-gallery img,.cc-gallery video{pointer-events:none;}' + // disable tap-hold image save
    '.cc-play-overlay{pointer-events:auto;}'; // but keep play button tappable
  document.head.appendChild(noSelectStyle);

})();

// ============================================================
//  COZYCABIN PRODUCTS.JS — v5 VARIANT CARDS
//  CHANGES FROM v4:
//  - NEW: renderVariantCard() for products with productType:"variant"
//  - NEW: variants[] field — multiple designs, images, prices per product
//  - NEW: Variant tab switcher inside card (no modal needed)
//  - NEW: Variant WhatsApp order includes selected variant name + price
//  - Existing standard cards, gallery, video, modal — ALL UNCHANGED
// ============================================================

var WHATSAPP_NUMBER = "254702468460";
var selectedOptions = {};

// ── REFERRAL ──
var urlParams = new URLSearchParams(window.location.search);
var urlRef = urlParams.get('ref');
if (urlRef) localStorage.setItem('referralCode', urlRef);
var referralCode = localStorage.getItem('referralCode');

// ============================================================
//  PRODUCTS DATABASE
//  Standard card:  { title, price, images, ... }
//  Variant card:   { title, productType:"variant", variants:[{name,price,oldPrice,image},...] }
// ============================================================
var products = {
  shoes: [
    {
      ratio: "1/1", title: "Ladies Comfort Slip-On Sandals", company: "Fashion",
      price: 2299, oldPrice: 3500, sizes: [36,37,38,39,49,41,42,43],
      colors: ["Black","Green", "Blue","White"],
      description: "Stylish and comfortable ladies slip-on sandals featuring a soft cushioned footbed, elegant gold buckle design, and lightweight sole. Perfect for everyday wear, shopping, travel, and casual outings..",
      video: "Images/video-black-shoes.mp4",
      images: ["Images/Lopnshblu.webp","Images/Lopnshb.webp","Images/Lopnshg.webp","Images/Lopnshw.webp"]
    },
    {
      ratio: "3/4", title: "Ladies Fashion Sneakers", company: "Fashion",
      price: 2299, oldPrice: 3299, sizes: [41,42,43,44],
      colors: ["White","Olive Green","Peach Pink","Grey","Black"],
      description: "Lightweight breathable ladies sneakers with cushioned sole and non-slip outsole. Perfect for walking, shopping, travel, and everyday wear.",
      video: "Images/video-ladies-sneakers.mp4",
      images: ["Images/FLS-white.webp","Images/flsgreen.webp","Images/FLS-B.webp","Images/FLSGry.webp","Images/FLS-pich.webp"]
    },
    {
      ratio: "1/1", title: "Calvin Klein Casual", company: "Calvin Klein",
      price: 3200, oldPrice: 4000, sizes: [40,41,42,43,44,45],
      colors: ["Brown","Blue","Tan","Brown","White"],
      description: "Premium Calvin Klein casual sneakers with durable sole.",
      video: "Images/video-calvin-klein.mp4",
      images: ["Images/kelvintan.webp","Images/calvin-blue.webp","Images/kelvinb.webp","Images/Kelvinbr.webp","Images/kalvinw.webp","Images/Kelvin.webp"]
    },
    {
      ratio: "3/4", title: "Premium Timberland Casual", company: "Timberland",
      price: 3850, oldPrice: 5000, sizes: [40,41,42,43,44,45],
      colors: ["Black","White","Brown","Dark Brown"],
      description: "Premium Timberland casual sneakers crafted for comfort and style. Durable construction, cushioned sole and versatile design make them ideal for everyday wear, office casual outfits and weekend outings.",
      video: "Images/video-timber-casual.mp4",
      images: ["Images/timber-black.webp","Images/timber-white.webp","Images/Timberlandlebrwn.webp","Images/Timberlandghbrwn.webp"]
    },
    {
      ratio: "3/4", title: "Timberland Casual Sneakers", company: "cartoon",
      price: 3500, oldPrice: 4500,
      sizes: [40,41,42,43,44,45],
      colors: [""],
      description: "Premium Timberland casual sneakers crafted for comfort and style. Durable construction, cushioned sole and versatile design make them ideal for everyday wear, office casual outfits and weekend outings.",
      video: "https://www.dropbox.com/scl/fi/yqlmt56nzjgkzxur1l86u/MP4_20260530_211747VLOG.mp4?rlkey=vywsa20vw3qo528nssg0b3hse&raw=1",
      images: [
        "Images/timber-navy.webp","Images/timber-black (1).webp","Images/Blackwhite-timberland (1).webp","Images/timber-greywhite.webp","Images/timber-tan.webp","Images/Warmhseslipink.webp"]
      },
      {
      ratio: "3/4", title: "Women's Comfort Slip-On Sneakers", company: "Fashion",
      price: 1799, oldPrice: 2500,
      sizes: [37,38,39,40,41,42],
      colors: ["Khaki","Red","Grey","Navy Blue","Black"],
      description: "Lightweight breathable slip-on sneakers designed for everyday comfort, walking and casual wear.",
      video: "Images/video-women-slipon.mp4",
      images: [
        "Images/womenredwalker.webp","Images/womendarkblue.webp","Images/womenlightbrown.webp",
        "Images/womenblackwalker.webp","Images/womegreywalker.webp"
        ]
     },
     {
      title: "Ladies Comfort Sandals",
      company: "Fashion",
      price: 2499,
      oldPrice: 3500,
      sizes: [36,37,38,39,40,41],
      colors: ["Green","Cream","Brown","Red"],
      description: "Elegant open-toe ladies sandals with a comfortable low heel and stylish crocodile texture.",
      images: ["Images/Lsandlsb.webp","Images/LsandlsG.webp","Images/LsandalsR.webp","Images/LsandlsBr.webp","Images/LsandlsC.webp"],
      video: "Images/video-ladies-comfort-sandals.mp4",
      badge: "🔥🔥New Arrival",
      category: "Footwear"
    },
    {
      title: "Men's Premium Formal Shoes",
      company: "Empire Shoes",
      price: 3500,
      oldPrice: 4500,
      sizes: ["40", "41", "42", "43", "44", "45"],
      colors: ["Black", "Brown", "Tan", "Wine"],
      description: "Premium men's formal shoes crafted for office wear, weddings, church, business meetings, and special occasions. Features elegant polished finishes, cushioned comfort, durable outsole, and stylish modern designs including loafers and lace-up options.",
      video: "Images/video-ladies-comfort-sandals.mp4",
      images: ["Images/officialleatherbrwn.webp","Images/officialblcks.webp","Images/classicbrwn.webp","Images/classicblack.webp","Images/classicblck.webp"],
      badge: "Executive Collection"
    },
    {
      title: "Warm Plush House Slippers",
      company: "Home Comfort",
      price: 850,
      oldPrice: 1500,
      sizes: ["36-37", "38-39", "40-41", "42-43"],
      colors: ["Lime Green", "Brown", "Yellow", "Navy Blue", "Pink", "Grey", "Mauve", "Rose Pink"],
      description: "Soft plush indoor slippers designed for warmth and comfort. Features a cushioned footbed, cozy fleece lining, and lightweight non-slip sole for everyday home use.",
      video: "Images/video-ladies-comfort-sandals.mp4",
      images: ["Images/warmhseslippinky.webp","Images/warmhsenavy.webp","Images/warmhsegrey.webp","Images/Watmhseslipy.webp","Images/Warmhseslipink.webp"],
      badge: "Best Seller"
    },
    {
     title: "Ladies Lightweight Slip-On Sneakers",
     company: "Fashion",
     price: 1499,
     oldPrice: 2000,
     sizes: ["36","37","38","39","40","41"],
     colors: ["Black","Grey","Beige","Pink","Wine Red"],
     description: "Breathable lightweight slip-on sneakers with flexible sole, soft knit upper and all-day comfort.",
     video: "Images/video-ladies-comfort-sandals.mp4",
     images: ["Images/cc.Lsandals-3.webp","Images/cc.Lsandals-2.webp","Images/cc.Lsandals-1.webp","Images/cc.Lsandals-4.webp","Images/cc.Lsandals-5.webp"],
     badge: "In Stock",
     category: "shoes"
    },
  ],
  travel: [
      {
       title: "3 in 1 Luxurious Fibre Suitcase Set",
       company: "Travel",
       price: 8500,
       oldPrice: 10000,
       sizes: ["63cm", "57cm", "48cm"],
       colors: ["Blue", "Pink", "Grey", "Brown", "Green"],
       description: "Premium 3-piece fibre suitcase set featuring 360° spinner wheels, telescopic handle, zipper closure frame and spacious storage compartments.",
       video: "Images/video-ladies-comfort-sandals.mp4",
       images: ["Images/Siutbl.webp","Images/suitcaseblack1webp.webp","Images/suitcasegrey.webp","Images/1pich.webp","Images/Suite3in1pink.webp"],
       badge: "Price Drop",
       category: "travel"
     },
     {
      title: "4 in 1 Premium Fibre Suitcase Set",
      company: "Travel",
      price: 11000,
      oldPrice: 13000,
      sizes: ["14\"","20\"","24\"","28\""],
      colors: ["Pink", "Sage Green", "Beige", "Black", "Navy Blue", "Blush Pink", "Sky Blue"],
      description: "Luxury 4-piece fibre suitcase set with beauty case, telescopic handle, double-zip closure, spacious interior and smooth 360° spinner wheels.",
      video: "Images/video-ladies-comfort-sandals.mp4",
      images: ["Images/1-9.webp","Images/1-7.webp","Images/1-4.webp","Images/1-5.webp","Images/1-6.webp","Images/1-7webp.webp","Images/1-2.webp"],
      badge: "New Arrival",
      category: "travel"
      },
      {
      title: "3 in 1 Luxurious Suitcase",
      company: "Cozycabin",
      price: 23999,
      oldPrice: 30000,
      sizes: ["14\"","20\"","24\"","28\""],
      colors: ["Grey","Pink", "Sage Green", "Beige", "Black", "Navy Blue", "Blush Pink", "Sky Blue"],
      description: "Premium 3-in-1 luxury Unicrose suitcase set featuring elegant design, durable hard shell, smooth spinner wheels, and spacious storage for business and leisure travel.",
      images: ["Images/LuxurySs562632.webp","Images/LuxurySs-4.webp","Images/LuxurySs-11.webp","Images/LuxurySs564486.webp","Images/LuxurySs-10.webp","Images/LuxurySs564496.webp"],
      badge: "New arrivals 🛬 you don't miss the Boss"
    },
  
  ],
  cutlery: [
  {
    title: "Silicone Spoons", company: "Kitchen",
    price: 1499, oldPrice: 2000, sizes: [],
    colors: ["Black","Grey"],
    description: "Elegant Silicone spoons for everyday use.",
    video: "Images/video-silicone-spoons.mp4",
    images: ["Images/blcksilicn.webp","Images/Silcn12psc1499.webp"]
  },
  {
    title: "19PCS Premium Silicone Kitchenware Set",
    company: "Kitchen",
    price: 2850,
    oldPrice: 3500,
    sizes: [],
    colors: ["Black","Grey","Pink"],
    description: "Complete 19-piece silicone kitchen utensil set with holder, chopping board, knife and wooden-handle cooking tools. Safe for non-stick cookware.",
    images: ["Images/19pcsiliconb-1.webp","Images/pscsiliconset.webp","Images/19set.webp"],
    badge: "Best Seller",
    category: "kitchen"
  },
  {
    title: "24 Psc Gold Cutlery Set", company: "Kitchen",
    price: 2500, oldPrice: 3500, sizes: [],
    colors: ["Gold","Silver"],
    description: "Elegant 24-pieces stainless steel cutlery set with stand.",
    video: "Images/video-gold-cutlery.mp4",
    images: ["Images/24goldcutlery-set.webp","Images/24goldcutlery-set.webp","Images/goldencutlery.webp","Images/silvercutlery.webp"]
  },
  {
    title: "6PCS Dining Cutlery Collection",
    company: "Kitchen",
    productType: "variant",
    description: "Elegant stainless steel dining cutlery available in gold and silver finishes.",
    variants: [
      {
        name: "6PCS Gold Spoon Set",
        price: 400,
        oldPrice: 600,
        description: "Heavy gauge 6psc table spoon golden",
        image: "Images/Spoonset-2.webp"
      },
      {
        name: "6PCS Silver Spoon Set",
        price: 350,
        oldPrice: 500,
        description: "Heavy gauge 6psc table spoon silver",
        image: "Images/Spoonsilv.webp"
      },
      {
        name: "6PCS Gold Knife Set",
        price: 450,
        oldPrice: 700,
        description: "Yuchang butter knife heavy gauge set of 6psc",
        image: "Images/Spoonsetg-1.webp"
      },
      {
        name: "6PCS Silver Knife Set",
        price: 400,
        oldPrice: 600,
        description: "Butter knife heavy gauge",
        image: "Images/Spoonsetsil-1.webp"
       }
     ]
    }
  ],
  hotpots: [
     {
       title: "Set of 4 Linex Hotpots",
       company: "Kitchen",
       productType: "standard",
       price: 4999,
       oldPrice: 6249,
       discountRange: {
       twentyPercentOff: 3999,
       thirtyNinePercentOff: 3049
     },
       capacities: ["1000ml", "1500ml", "2500ml", "3500ml"],
       colors: ["White", "Cream", "Beige"],
       description: "Set of 4 elegant Linex Hotpots for everyday use. Features include discrete pinhole filter and temperature indication.",
       contact: "0702468460",
       video: "",
       images: [
      "Images/4pscLinexhpwhite.webp",
      "Images/4pscLinexhpi.webp",
      "Images/4pscLinexhpw.webp"
      ]
     },
     {
       title: "Goldstar Hotpots 4pcs",
       company: "Kitchen",
       productType: "standard",
       price: 5500,
       oldPrice: 6875,
       discountRange: {
       twentyPercentOff: 4400,
       thirtyNinePercentOff: 3355
       },
       capacities: ["1000ml", "1500ml", "2500ml", "3500ml"],
       colors: ["White", "Mint Green", "Grey"],
       description: "Goldstar Hotpots 4pcs. Features include discrete pinhole filter and temperature indication.",
       contact: "0702468460",
       video: "",
       images: [
      "Images/4pschotpgoldstarw.webp",
      "Images/4pschotpgoldstarg.webp",
      "Images/4pschotpgoldstar.webp"
      ]
    },
    {
      title: "Turkish Hot Pots",
      company: "Cozycabin",
      productType: "standard",
      price: 5499,
      oldPrice: 6874,
      discountRange: {
      twentyPercentOff: 4399,
      thirtyNinePercentOff: 3354
      },
      capacities: ["1000ml", "1500ml", "2500ml", "3500ml"],
      colors: ["Marble Brown", "Marble White"],
      description: "Perfect excellent quality Turkish insulated hot pots. Features include discrete pinhole filter and temperature indication.",
      contact: "0702468460",
      video: "",
      images: [
      "Images/4pschotpturkish1.webp",
      "Images/4pschotpturkish.webp"
      ]
     },
    {
      title: "Redberry Stainless Steel Hotpots",
      company: "Kitchen",
      productType: "standard",
      price: 4500,
      oldPrice: 5625,
      discountRange: {
      twentyPercentOff: 3600,
      thirtyNinePercentOff: 2745
      },
      capacities: ["2 Litres", "3 Litres", "4 Litres", "5 Litres"],
      colors: ["Silver"],
      description: "Set of 4 Redberry stainless steel insulated hotpots. Ideal for keeping food hot for longer periods.",
      contact: "0702468460",
      video: "",
      images: [
     "Images/redberryhotp.webp"
      ]
    },
    {
      title: "Casserole Hotpot Set 4pcs",
      company: "Kitchen",
      productType: "standard",
      price: 3500,
      oldPrice: 4375,
      discountRange: {
      twentyPercentOff: 2800,
      thirtyNinePercentOff: 2135
     },
      capacities: ["1 Litre", "2 Litres", "4 Litres", "6 Litres"],
      colors: ["White Gold"],
      description: "Elegant casserole hotpot set with stainless steel inner lining. Keeps food warm and fresh for longer.",
      contact: "0702468460",
      video: "",
      images: [
      "Images/cerasolehotp.webp"
      ]
    },
    {
      title: "Milano Insulated Hotpot 4pcs",
      company: "Kitchen",
      productType: "standard",
      price: 3500,
      oldPrice: 4375,
      discountRange: {
      twentyPercentOff: 2800,
      thirtyNinePercentOff: 2135
     },
       capacities: ["1000ml", "2000ml", "3000ml", "4000ml"],
       colors: ["Black", "White"],
       description: "Premium Milano insulated casserole hotpot set. Elegant marble finish with excellent heat retention.",
       contact: "0702468460",
       video: "",
       images: [
      "Images/4pschotpmilano.webp",
      "Images/4pschotpmilanob.webp"
      ]
     }
    ],
  flasks: [
    {
       title: "Vacuum Flask Collection",
       company: "Kitchen",
       productType: "variant",
       description: "Premium stainless steel vacuum flasks designed to keep drinks hot or cold for longer.",
       variants: [
    {
      name: "Always Vacuum Bottle 500ml",
      price: 750,
      oldPrice: 1500, 
      description: "Durable stainless steel vacuum flask with carrying strap.",
      images: ["Images/548798.webp"]
    },
    {
      name: "6021 Temperature Flask 500ml",
      price: 550,
      oldPrice: 1000,
      description: "Stylish temperature display vacuum flask.",
      images: ["Images/553404Flsktc.webp","Images/553383Flsktc.webp","Images/553386Flsktc.webp","Images/550062.webp","Images/548799.webp"]
    },
    {
      name: "Temperature Flask 500ml",
      price: 700,
      oldPrice: 1500,
      description: "Digital temperature display vacuum flask.",
      images: ["Images/temp-500ml.webp"]
    },
    {
      name: "Temperature Flask 800ml",
      price: 900,
      oldPrice: 1800,
      description: "Large capacity temperature display vacuum flask.",
      images: ["Images/548800.webp","Images/548799.webp","Images/553386Flsktc.webp","Images/553764Flsktc.webp"]
    },
    {
      name: "Temperature Flask 1000ml",
      price: 1000,
      oldPrice: 1800,
      description: "Extra large temperature display vacuum flask.",
      images: ["Images/553404Flsktc.webp","Images/553383Flsktc.webp","Images/553386Flsktc.webp","Images/548800.webp","Images/548799.webp"]
    },
    {
      name: "TC Vacuum Flask 500ml",
      price: 600,
      oldPrice: 1200,
      description: "Premium TC stainless steel flask.",
      images: ["Images/553763Flsktc.webp","Images/553764Flsktc.webp","Images/553769Flsktc.webp"]
    },
    {
      name: "TC Vacuum Flask 600ml",
      price: 750,
      oldPrice: 1500,
      description: "TC insulated flask with larger capacity.",
      images: ["Images/tc-600ml.webp"]
    },
    {
      name: "Muchen Vacuum Flask 800ml",
      price: 900,
      oldPrice: 1600,
      description: "Elegant Muchen insulated flask.",
      images: ["Images/551394Flsk.webp","Images/551378Flsk.webp"]
    },
    {
      name: "Muchen Vacuum Flask 1000ml",
      price: 1000,
      oldPrice: 2300,
      description: "Large capacity Muchen vacuum flask.",
      images: ["Images/551394Flsk.webp","Images/551378Flsk.webp","Images/551258.webp"]
     }
    ]
   }
  ],
  solarlights: [
  {
    title: "Solar Indoor Ceiling Light",
    company: "Solar",
    productType: "variant",
    description: "Solar-powered indoor ceiling light with all-weather solar panel, large lithium battery capacity up to 20,000mAh, three lighting colors and up to 18 hours of continuous lighting. Ideal for homes, shops, rural homes, emergency lighting and areas without electricity.",
    features: [
      "All Weather Solar Panel",
      "Large Lithium Battery",
      "Up To 20,000mAh Capacity",
      "Up To 18 Hours Lighting",
      "3 Lighting Colors",
      "Remote Control Included",
      "Easy Installation",
      "Energy Saving",
      "Indoor Solar Lighting"
    ],
    variants: [
      {
        name: "50W Solar Indoor Ceiling Light",
        price: 2500,
        oldPrice: 3500,
        image: "Images/Solcl50w.webp",
        description: "Solar indoor ceiling light with remote control and 3 lighting colors."
      },
      {
        name: "100W Solar Indoor Ceiling Light",
        price: 2500,
        oldPrice: 3500,
        image: "Images/solarcl100w.webp",
        description: "Solar indoor ceiling light with remote control and 3 lighting colors."
      },
      {
        name: "200W Solar Indoor Ceiling Light",
        price: 3500,
        oldPrice: 5000,
        image: "Images/solarcl200w.webp",
        description: "Solar indoor ceiling light with remote control and 3 lighting colors."
      },
      {
        name: "300W Solar Indoor Ceiling Light",
        price: 4500,
        oldPrice: 6500,
        image: "Images/solarcel300w.webp",
        description: "Solar indoor ceiling light with remote control and 3 lighting colors."
      },
      {
        name: "400W Solar Indoor Ceiling Light",
        price: 5500,
        oldPrice: 7500,
        image: "Images/solarcl400w.webp",
        description: "Solar indoor ceiling light with remote control and 3 lighting colors."
        }
       ]
     }
   ],
panels: [
  {
     title: "Solarmax Solar Panels",
     company: "Solarmax",
     productType: "variant",

     description: "High-quality Solarmax solar panels designed for reliable and efficient solar energy generation. Built with durable tempered glass, weather-resistant aluminium frames and high conversion efficiency for maximum power output. Ideal for home lighting systems, solar backup, water pumps, CCTV systems, businesses and off-grid installations.",

  features: [
    "High Conversion Efficiency",
    "Monocrystalline Solar Technology",
    "Weather Resistant Design",
    "Durable Aluminium Frame",
    "Tempered Glass Protection",
    "Low Maintenance",
    "Long Service Life",
    "Suitable for Homes & Businesses",
    "Ideal for Solar Backup Systems",
    "Reliable Off-Grid Power Solution"
    ],

  variants: [
   {
      name: "Solarmax 10W Panel",
      price: 1200,
      oldPrice: 1500,
      description: "10W compact solar panel suitable for small lighting and charging systems.",
      images: ["Images/solarmax-10w.webp"]
    },
    {
      name: "Solarmax 15W Panel",
      price: 1500,
      oldPrice: 1800,
      description: "15W solar panel for home lighting and small solar applications.",
      images: ["Images/solamax-15w.webp"]
    },
    {
      name: "Solarmax 20W Panel",
      price: 1800,
      oldPrice: 2200,
      description: "20W efficient solar panel ideal for lighting and charging batteries.",
      images: ["Images/solarmax-20w.webp"]
    },
    {
      name: "Solarmax 30W Panel",
      price: 2300,
      oldPrice: 2800,
      description: "30W durable solar panel with reliable power generation.",
      images: ["Images/solarmax-30w.webp"]
    },
    {
      name: "Solarmax 40W Panel",
      price: 2600,
      oldPrice: 3200,
      description: "40W high-efficiency solar panel for home solar systems.",
      images: ["Images/solarmax-40w.webp"]
    },
    {
      name: "Solarmax 50W Panel",
      price: 2900,
      oldPrice: 3500,
      description: "50W solar panel with stable power output and durable design.",
      images: ["Images/solarmax-50w.webp"]
    },
    {
      name: "Solarmax 60W Panel",
      price: 3000,
      oldPrice: 3800,
      description: "60W solar panel suitable for lighting, TVs and battery charging.",
      images: ["Images/solarmax-60w.webp"]
    },
    {
      name: "Solarmax 80W Panel",
      price: 4500,
      oldPrice: 5500,
      description: "80W high-performance solar panel for medium-sized solar setups.",
      images: ["Images/solarmax-80w.webp"]
    },
    {
      name: "Solarmax 100W Panel",
      price: 5900,
      oldPrice: 7000,
      description: "100W solar panel with efficient energy conversion and durable build.",
      images: ["Images/solarmax-100w.webp"]
    },
    {
      name: "Solarmax 120W Panel",
      price: 7000,
      oldPrice: 8500,
      description: "120W solar panel ideal for homes, businesses and backup systems.",
      images: ["Images/solarmax-120w.webp"]
    },
    {
      name: "Solarmax 150W Panel",
      price: 7500,
      oldPrice: 9000,
      description: "150W powerful solar panel with excellent charging efficiency.",
      images: ["Images/solarmax-150w.webp"]
    },
    {
      name: "Solarmax 200W Panel",
      price: 9500,
      oldPrice: 11500,
      description: "200W premium solar panel for larger solar installations.",
      images: ["Images/solarmax-200w.webp"]
    },
    {
      name: "Solarmax 250W Panel",
      price: 10500,
      oldPrice: 12500,
      description: "250W high-output solar panel with long-lasting performance.",
      images: ["Images/solarmax-250w.webp"]
    },
    {
      name: "Solarmax 300W Panel",
      price: 11500,
      oldPrice: 14000,
      description: "300W premium solar panel offering maximum efficiency and reliable power generation.",
      images: ["Images/solarmax-300w.webp"]
    }
   ]
  }
],
  inverters: [
   {
title: "Yachu Inverters",
company: "Cozycabin",
productType: "variant",

description:
"High-performance Yachu hybrid inverters designed for homes, businesses and solar backup systems. Features pure sine wave output, intelligent charging and reliable power conversion for off-grid and hybrid solar installations.",

features: [
"Pure Sine Wave Output",
"Hybrid Solar Technology",
"High Conversion Efficiency",
"Solar Charging Support",
"Intelligent LCD Display",
"Overload Protection",
"Low Battery Protection",
"Reliable Backup Power",
"Suitable for Homes & Businesses",
"Easy Installation"
],

variants: [

{
name: "Yachu Hybrid Inverter 12V 1.5KW",
price: 24500,
oldPrice: 30000,
description:
"12V hybrid solar inverter rated at 1.5KW. Suitable for home solar backup systems and small appliances.",
images:["Images/yachu-inverter-1.5kw.webp"]
},

{
name: "Yachu Hybrid Inverter 24V 3.5KW",
price: 33000,
oldPrice: 40000,
description:
"24V hybrid inverter with 3.5KW output for homes, offices and solar backup applications.",
images:["Images/yachu-inverter-3.5kw.webp"]
},

{
name: "Yachu Hybrid Inverter 48V 6.2KW",
price: 47100,
oldPrice: 55000,
description:
"48V pure sine wave hybrid inverter with 6.2KW output, high efficiency and solar charging support.",
images:["Images/yachu-inverter-6.2kw.webp"]
},

{
name: "Yachu Hybrid Inverter 48V 11KW",
price: 91500,
oldPrice: 105000,
description:
"48V high-power hybrid inverter rated at 11KW for homes, businesses and large solar installations.",
images:["Images/yachu-inverter-11kw.webp"]
  }
  ]
 }
],

  
batteries: [
  {
    title: "Solar GEL Batteries (AC Output)",
    company: "Cozycabin",
    productType: "variant",
    description: "12V 100Ah, 58Ah and 80Ah multifunctional Solar GEL battery with built-in AC 220V output, solar charging support and intelligent power management. Features a digital voltage display, multiple USB charging ports, deep cycle GEL technology and maintenance-free design for long-lasting performance. Portable carry handle for easy movement and stable power output for lighting, TVs, phone charging, laptops and other small appliances. Ideal for homes, shops, offices and reliable backup power during blackouts.",
    features: [
      "Bluetooth Support",
      "12V 100Ah Capacity",
      "Built-in AC 220V Output",
      "Built-in Solar Charge Controller",
      "Supports Solar Panel Charging",
      "Digital Voltage Display",
      "Multiple USB Charging Ports",
      "Deep Cycle GEL Technology",
      "Maintenance-Free Design",
      "Portable Carry Handle",
      "Stable Power Output",
      "Low Noise Operation",
      "Ideal for Lighting & TVs",
      "Phone & Laptop Charging",
      "Reliable Home Backup Power",
      "Suitable for Homes & Small Businesses"
    ],
    variants: [
      {
        name: "Solar GEL Battery Bluetooth AC 200W 100Ah",
        price: 19000,
        oldPrice: 25000,
        description: "12V 100Ah multifunctional Solar GEL battery with built-in AC 220V output, solar charging support and intelligent power management. Features a digital voltage display, multiple USB charging ports, deep cycle GEL technology and maintenance-free design for long-lasting performance. Portable carry handle for easy movement and stable power output for lighting, TVs, phone charging, laptops and other small appliances. Ideal for homes, shops, offices and reliable backup power during blackouts.",
        images: ["Images/yachu-ac100ah.webp"]
      },
      {
        name: "Solar GEL Battery USB 20Ah",
        price: 4500,
        oldPrice: 6000,
        description: "20Ah compact GEL battery with USB charging support, maintenance-free design and stable power output.",
        images: ["Images/gelusb20ah.webp"]
      },
      {
        name: "Solar GEL Battery AC 100W 58Ah",
        price: 9800,
        oldPrice: 12000,
        description: "58Ah GEL battery designed for AC 100W solar backup systems with reliable power storage.",
        images: ["Images/gelac100w58ah.webp"]
      },
      {
        name: "Solar GEL Battery AC 200W 80Ah",
        price: 13000,
        oldPrice: 16000,
        description: "80Ah GEL battery suitable for AC 200W solar systems with stable power output and long service life.",
        images: ["Images/yachuac200w80ah.webp"]
      }
    ]
  },
  {
    title: "Solar GEL Batteries",
    company: "Cozycabin",
    productType: "variant",
    description: "High-quality maintenance-free GEL batteries designed for solar systems, inverters and backup power solutions. Built with deep cycle technology for reliable energy storage, long service life and stable performance. Ideal for homes, businesses and off-grid solar installations.",
    features: [
      "Maintenance-Free Design",
      "Deep Cycle Technology",
      "High Energy Storage",
      "Fast Charging",
      "Leak Proof Construction",
      "Long Service Life",
      "Reliable Solar Backup",
      "Stable Power Output",
      "Suitable for Homes & Businesses",
      "Ideal for Off-Grid Solar Systems"
    ],
    variants: [
    
      {
        name: "YACHU 55Ah Solar GEL Battery",
        price: 8000,
        oldPrice: 10000,
        description: "55Ah maintenance-free GEL battery with deep cycle technology, stable power output and reliable solar backup.",
        images: ["Images/yachu55ah.webp"]
      },
      {
        name: "YACHU 80Ah Solar GEL Battery",
        price: 10800,
        oldPrice: 13000,
        description: "80Ah maintenance-free GEL battery with deep cycle technology and reliable backup power for solar systems.",
        images: ["Images/yachu80ah.webp"]
      },
      {
        name: "YACHU 200Ah Heavy Duty Solar GEL Battery",
        price: 32000,
        oldPrice: 45000,
        description: "200Ah heavy-duty GEL battery with extra backup capacity, deep cycle technology and long service life.",
        images: ["Images/yachu200ahheavy.webp"]
      },
      {
        name: "3491 200Ah GEL Battery",
        price: 23500,
        oldPrice: 29000,
        description: "200Ah high-capacity GEL battery with deep cycle performance and reliable backup power.",
        images: ["Images/gelb200ah.webp"]
      },
      {
        name: "3491 100Ah GEL Battery",
        price: 14000,
        oldPrice: 18000,
        description: "100Ah maintenance-free GEL battery with deep cycle technology, full capacity and 1-year warranty.",
        images: ["Images/Gelb100ah.webp"]
      },
      {
        name: "YACHU 100Ah Solar GEL Battery",
        price: 17000,
        oldPrice: 22000,
        description: "100Ah maintenance-free GEL battery with full capacity, deep cycle technology and reliable solar power storage.",
        images: ["Images/yachu100ah.webp"]
      },
      {
        name: "3491 150Ah GEL Battery",
        price: 20000,
        oldPrice: 26000,
        description: "150Ah GEL battery with deep cycle performance, maintenance-free design and 1-year warranty.",
        images: ["Images/gelb150ah.webp"]
      },
      {
        name: "YACHU 150Ah Solar GEL Battery",
        price: 24500,
        oldPrice: 32000,
        description: "150Ah heavy-duty GEL battery with deep cycle technology, full capacity and 3-year warranty.",
        images: ["Images/yachu150ah.webp"]
      },
      {
        name: "YACHU 200Ah Solar GEL Battery",
        price: 30500,
        oldPrice: 39000,
        description: "200Ah premium GEL battery with high storage capacity, deep cycle performance and long service life.",
        images: ["Images/yachu200ah.webp"]
      }
    ]
  },
  {   
     title: "Yachu Lithium Batteries",
      company: "Cozycabin",
      productType: "variant",

      description:
      "High-performance Yachu lithium batteries designed for solar systems, homes and businesses. Features intelligent battery management, long cycle life and reliable backup power.",

      features: [
      "Long Cycle Life",
      "Intelligent BMS",
      "Fast Charging",
      "High Energy Density",
      "Solar Compatible",
      "Maintenance Free",
      "Reliable Backup Power",
      "Safe & Durable"
      ],

variants: [

   {
        name: "Yachu Lithium Battery 5.12KWh 51.2V",
        price: 105000,
        oldPrice: 120000,
        description:
        "5.12KWh 51.2V wall-mounted lithium battery with intelligent BMS and long cycle life.",
        images:["Images/yachu-lithium-5.12kwh.webp"]
   },
   {
        name: "Yachu Lithium Battery 8.03KWh 25.6V",
        price: 115000,
        oldPrice: 145000,
        description:
        "8.03KWh 25.6V lithium battery for solar backup systems with high efficiency and long lifespan.",
        images:["Images/yachu-lithium-8.03kwh.webp"]
   },
   {
        name: "Yachu Lithium Battery 10.85KWh 51.2V",
        price: 165000,
        oldPrice: 190000,
        description:
        "10.85KWh 51.2V lithium battery with intelligent battery management and dependable backup power.",
        images:["Images/yachu-lithium-10.85kwh.webp"]
   },
   {
        name: "Yachu Lithium Battery 16.07KWh 51.2V",
        price: 195000,
        oldPrice: 220000,
        description:
        "16.07KWh 51.2V high-capacity lithium battery ideal for homes and commercial solar systems.",
        images:["Images/yachu-lithium-16.07kwh.webp"]
    },
    {
        name: "Yachu Lithium Battery 12.8V 100Ah",
        price: 30000,
        oldPrice: 40000,
        description:
       "12.8V 100Ah lithium battery with lightweight design and fast charging capability.",
       images:["Images/yachu-lithium-100ah.webp"]
    },
    {
       name: "Yachu Lithium Battery 12.8V 200Ah",
       price: 50000,
       oldPrice: 60000,
       description:
       "12.8V 200Ah lithium battery offering high energy density and long-lasting backup power.",
       images:["Images/yachu-lithium-200ah.webp"]
      }
    ]
   }
 ],
        
streetlights: [
  {
    title: "Solar Street Lights (100W - 400W)",
    company: "Cozycabin",
    productType: "variant",
    description: "High-quality solar street lights available in 100W, 200W, 300W and 400W options. Designed with bright LED illumination, waterproof construction and an intelligent dusk-to-dawn sensor that automatically switches ON at night and OFF during the day. Powered entirely by solar energy with no electricity bills or wiring required. Easy to install and comes with a remote control for convenient operation. Ideal for homes, compounds, businesses, farms, streets and outdoor security lighting.",
    features: [
      "Available in 100W, 200W, 300W & 400W",
      "Automatic Dusk-to-Dawn Sensor",
      "100% Solar Powered",
      "Bright LED Illumination",
      "Waterproof & Weather Resistant",
      "Remote Control Included",
      "No Wiring Required",
      "Easy Installation",
      "Energy Saving",
      "Ideal for Homes & Businesses",
      "Suitable for Compounds, Farms & Streets",
      "Outdoor Security Lighting"
    ],
    variants: [
      {
        name: "Solar Street Light 100W",
        price: 2500,
        image: "Images/cozycabin-100w.webp",
        description: "100W all-in-one solar street light with solar panel and remote control."
      },
      {
        name: "Solar Street Light 200W",
        price: 3500,
        image: "Images/cozycabin-200w.webp",
        description: "200W all-in-one solar street light with brighter illumination and remote control."
      },
      {
        name: "Solar Street Light 300W",
        price: 4000,
        image: "Images/cozycabin-300w.webp",
        description: "300W high-power solar street light with wide lighting coverage."
      },
      {
        name: "Solar Street Light 400W",
        price: 4500,
        image: "Images/cozycabin-400w.webp",
        description: "400W premium solar street light with extra brightness and long battery life."
      }
    ]
  },
  {
    title: "Solar Street Lights (1000W - 3000W)",
    company: "Cozycabin",
    productType: "variant",
    description: "High-quality solar street lights with bright LED illumination and intelligent dusk-to-dawn operation. Automatically switches ON at night and OFF during the day. Waterproof, energy-saving and powered entirely by solar energy with no electricity bills or wiring required. Comes with remote control and is ideal for homes, compounds, businesses, farms, streets and outdoor security lighting.",
    features: [
      "Available in 1000W, 2000W & 3000W",
      "Automatic Dusk-to-Dawn Sensor",
      "100% Solar Powered",
      "Ultra Bright LED Illumination",
      "Waterproof & Weather Resistant",
      "Remote Control Included",
      "No Wiring Required",
      "Easy Installation",
      "Energy Saving",
      "Long Battery Life",
      "Wide Lighting Coverage",
      "Outdoor Security Lighting"
    ],
    variants: [
      {
        name: "1000W Solar Street Light",
        price: 7500,
        oldPrice: 11000,
        image: "Images/Streetl1000w.webp",
        description: "1000W solar street light with automatic dusk-to-dawn sensor, waterproof design and remote control included."
      },
      {
        name: "2000W Solar Street Light",
        price: 8500,
        oldPrice: 13000,
        image: "Images/Streetl2000w.webp",
        description: "2000W ultra-bright solar street light with automatic dusk-to-dawn sensor, waterproof design and remote control included."
      },
      {
        name: "3000W Solar Street Light",
        price: 10500,
        oldPrice: 18500,
        image: "Images/streetl3000w.webp",
        description: "3000W premium solar street light with extra brightness, wide lighting coverage, waterproof design and remote control included."
      }
    ]
  }
],
floodlights: [
  {
    title: "Solar Security Floodlight",
    company: "Solar",
    productType: "variant",
    description: "Waterproof solar-powered security floodlights with automatic photocell sensor. Automatically switches ON at night and OFF during the day. No wiring required, easy installation, remote control included. Ideal for homes, businesses, compounds, farms and security lighting.",
    features: [
      "Automatic ON/OFF Photocell Sensor",
      "Waterproof Design",
      "Solar Powered",
      "Remote Control Included",
      "No Wiring Required",
      "Easy Installation",
      "Security Flood Lighting"
    ],
    variants: [
      {
        name: "30W Solar Security Floodlight",
        price: 4500,
        oldPrice: 6000,
        image: "Images/solar-30w.jpg",
        description: "Automatic day/night sensor, IP66 waterproof, remote control included."
      },
      {
        name: "60W Solar Security Floodlight",
        price: 5500,
        oldPrice: 7500,
        image: "Images/solar-60w.jpg",
        description: "Automatic day/night sensor, IP66 waterproof, remote control included."
      },
      {
        name: "100W Solar Security Floodlight",
        price: 6999,
        oldPrice: 9500,
        image: "Images/solar-100w.jpg",
        description: "Automatic day/night sensor, IP66 waterproof, remote control included."
      },
      {
        name: "200W Solar Security Floodlight",
        price: 9000,
        oldPrice: 12000,
        image: "Images/solar-200w.jpg",
        description: "Automatic day/night sensor, IP66 waterproof, remote control included."
      },
      {
        name: "300W Solar Security Floodlight",
        price: 12500,
        oldPrice: 16000,
        image: "Images/solar-300w.jpg",
        description: "Automatic day/night sensor, IP66 waterproof, remote control included."
      }
    ]
  },
  {
  title: "JSOT US Solar Floodlights",
  company: "JSOT US",
  productType: "variant",

  description: "High-performance solar floodlights with bright LED illumination, waterproof IP67 protection and intelligent dusk-to-dawn sensor. Powered entirely by solar energy with no wiring required. Suitable for homes, businesses, compounds, farms and outdoor security lighting.",

  features: [
    "Available in 40W, 60W, 100W, 200W & 300W",
    "Automatic Dusk-to-Dawn Sensor",
    "100% Solar Powered",
    "Bright LED Illumination",
    "IP67 Waterproof Design",
    "Remote Control Included",
    "No Wiring Required",
    "Easy Installation",
    "Energy Saving",
    "Suitable for Homes & Businesses",
    "Outdoor Security Lighting"
  ],

  variants: [

    {
      name: "40W JSOT US Solar Floodlight",
      price: 2900,
      oldPrice: 4000,
      description: "40W solar floodlight with automatic dusk-to-dawn sensor, IP67 waterproof design and remote control included.",
      images: ["Images/solarl40w.webp"]
    },

    {
      name: "60W JSOT US Solar Floodlight",
      price: 3500,
      oldPrice: 5000,
      description: "60W bright solar floodlight with automatic dusk-to-dawn sensor, IP67 waterproof design and remote control included.",
      images: ["Images/Solarl60w.webp"]
    },

    {
      name: "100W JSOT US Solar Floodlight",
      price: 4500,
      oldPrice: 6500,
      description: "100W high-brightness solar floodlight with automatic dusk-to-dawn sensor, IP67 waterproof design and remote control included.",
      images: ["Images/solarl100w.webp"]
    },

    {
      name: "200W JSOT US Solar Floodlight",
      price: 5500,
      oldPrice: 8000,
      description: "200W powerful solar floodlight with wide lighting coverage, IP67 waterproof design and remote control included.",
      images: ["Images/solarl200w.webp"]
    },

    {
      name: "300W JSOT US Solar Floodlight",
      price: 6500,
      oldPrice: 9500,
      description: "300W premium solar floodlight with extra brightness, IP67 waterproof design and remote control included.",
      images: ["Images/solarl300w.webp"]
    }
   ]
  },
  {
    title: "YOMY Solar Floodlight",
    company: "YOMY",
    productType: "variant",
    description: "Premium YOMY solar floodlight with high-efficiency solar panel, waterproof IP65 design, battery level indicator and powerful outdoor security lighting. Suitable for homes, compounds, parking areas, businesses and farms.",
    features: [
      "High Efficiency Solar Panel",
      "IP65 Waterproof",
      "Battery Level Indicator",
      "Energy Saving",
      "Automatic Day/Night Operation",
      "Outdoor Security Lighting",
      "Easy Installation",
      "Maintenance Free"
    ],
    variants: [
      {
        name: "50W YOMY Solar Floodlight",
        price: 2500,
        oldPrice: 3500,
        image: "Images/Yommy50w.webp",
        description: "MOQ: 20 Pieces"
      },
      {
        name: "100W YOMY Solar Floodlight",
        price: 3600,
        oldPrice: 5000,
        image: "Images/Yommy100w.webp",
        description: "MOQ: 20 Pieces"
      },
      {
        name: "200W YOMY Solar Floodlight",
        price: 4900,
        oldPrice: 6500,
        image: "Images/Yommy200w.webp",
        description: "MOQ: 10 Pieces"
      },
      {
        name: "300W YOMY Solar Floodlight",
        price: 6000,
        oldPrice: 8000,
        image: "Images/Yommy300w.webp",
        description: "MOQ: 10 Pieces"
      },
      {
        name: "400W YOMY Solar Floodlight",
        price: 7500,
        oldPrice: 10000,
        image: "Images/Yommy400w.webp",
        description: "MOQ: 5 Pieces"
      }
    ]
  }
],
solarfans: [
  {
    title: "Solar Home Systems & Fans",
    company: "Cozycabin",
    productType: "variant",
    description: "Portable solar home systems and rechargeable solar fans designed for homes, shops and outdoor use. Features solar charging, LED lighting, USB phone charging and long-lasting rechargeable batteries for reliable backup power.",
    features: [
      "Solar Charging",
      "Rechargeable Battery",
      "USB Phone Charging",
      "Energy Saving",
      "Portable Design",
      "Long Battery Life",
      "LED Lighting",
      "Ideal for Homes & Shops"
    ],
    variants: [
      {
        name: "DAT Home Lighting System AT-X10",
        price: 5500,
        oldPrice: 8500,
        description: "Portable solar home lighting system with Bluetooth, FM radio, 8W monocrystalline solar panel, 3 LED bulbs, torch, phone charging and rechargeable battery. Comes with fan and AC adapter for reliable home backup power.",
        images: ["Images/dat-atx10.webp"]
      },
      {
        name: "Golden Sun Solar Fan",
        price: 6900,
        oldPrice: 9500,
        description: "16-inch rechargeable solar fan with 3 speed oscillation, 15W solar panel, remote control, AC/DC charging and mosquito repellent function. Quiet operation with long battery backup.",
        images: ["Images/goldensun-solarfan.webp"]
      },
      {
        name: "Oraimo PowerSolar 76 Solar Home Power System With Fan",
        price: 18000,
        oldPrice: 25000,
        description: "15W Oraimo PowerSolar 76 solar home power system with rechargeable battery, solar panel, fan and LED bulbs. Features USB phone charging, energy-saving technology and reliable backup power for homes and businesses.",
        images: ["Images/oraimo-powersolar76.webp"]
      }
    ]
  },
  {
    title: "Solar Fans",
    company: "Cozycabin",
    productType: "variant",
    description: "Energy-efficient solar fans designed for homes, offices and outdoor use. Rechargeable with solar panels and USB charging support for reliable cooling anytime, anywhere.",
    features: [
      "Solar Charging",
      "Rechargeable Battery",
      "USB Charging",
      "Energy Saving",
      "Portable Design",
      "Long Battery Life",
      "Multiple Speed Levels",
      "Quiet Operation",
      "Ideal for Homes & Offices",
      "Reliable Cooling Solution"
    ],
    variants: [
      {
        name: "SunAfrica Solar Mini Fan",
        price: 2500,
        oldPrice: 3500,
        description: "Rechargeable solar mini fan with solar panel, USB charging support, portable design and long battery life.",
        images: ["Images/sunafrica-mini-fan.webp"]
      },
      {
        name: "GDTIMES 6 Inch Solar Rechargeable Fan",
        price: 3500,
        oldPrice: 4500,
        description: "6-inch rechargeable fan with solar panel, LED light, phone charging support and multiple speed levels.",
        images: ["Images/gdtimes-6inch.webp"]
      },
      {
        name: "Aifike Solar Table Fan",
        price: 5500,
        oldPrice: 7000,
        description: "Rechargeable table fan with solar panel, powerful airflow, adjustable speed and long-lasting battery.",
        images: ["Images/aifike-solarfan.webp"]
      },
      {
        name: "Golden Sun Solar Standing Fan",
        price: 8500,
        oldPrice: 11000,
        description: "16-inch solar standing fan with LED light, rechargeable battery, multiple speed control and solar charging support.",
        images: ["Images/goldensun-standingfan.webp"]
      },
      {
        name: "Solar Standing Fan With Panel",
        price: 9500,
        oldPrice: 12500,
        description: "16-inch rechargeable standing fan with high-capacity battery, solar panel included and powerful cooling performance.",
        images: ["Images/solar-standingfan.webp"]
      },
      {
        name: "Itel Rechargeable Solar Fan",
        price: 8500,
        oldPrice: 11000,
        description: "Rechargeable Itel fan with solar panel and 2 LED bulbs. Features multiple speed settings and long battery backup.",
        images: ["Images/itel-solarfan.webp"]
      },
      {
        name: "Easy Power EP009 Solar Fan",
        price: 4500,
        oldPrice: 6000,
        description: "8-inch rechargeable solar fan with Bluetooth speaker, FM radio, LED light, USB charging and solar panel included.",
        images: ["Images/easypower-ep009.webp"]
      },
      {
        name: "Solar Rechargeable Box Fan",
        price: 3200,
        oldPrice: 4500,
        description: "Portable rechargeable box fan with solar charging support, LED light and compact design for home and travel.",
        images: ["Images/solar-boxfan.webp"]
      }
    ]
  }
],

fridges: [
  {
    title: "Double Door Refrigerators",
    company: "Cozycabin",
    productType: "variant",
    description: "Energy-saving double door refrigerators from trusted brands including Ramtons, Volsmart, Von, Smartpro, Syinix, Ailyons, Roch and Ecomax. Designed for homes and offices with spacious storage, fast cooling and low power consumption.",
    features: [
      "Double Door Design",
      "Energy Saving",
      "Fast Cooling",
      "Low Noise Operation",
      "Direct Cool Technology",
      "Spacious Storage",
      "Adjustable Thermostat",
      "Durable Compressor",
      "Modern Design",
      "Suitable for Homes & Offices"
    ],
    variants: [
      {
        name: "Ramtons 128L Double Door Refrigerator Silver",
        price: 30500,
        oldPrice: 34000,
        description: "Ramtons 128 litres direct cool double door refrigerator in silver finish. Energy-saving with spacious compartments and elegant design.",
        images: ["Images/ramtons-128l-double-door.webp"]
      },
      {
        name: "Volsmart 138L Double Door Refrigerator",
        price: 28000,
        oldPrice: 32000,
        description: "Volsmart 138 litres double door refrigerator with energy-saving technology, spacious storage and reliable cooling.",
        images: ["Images/volsmart-138l-double-door.webp"]
      },
      {
        name: "Von 181L Double Door Refrigerator Direct Cool",
        price: 35000,
        oldPrice: 40000,
        description: "Von 181 litres direct cool double door refrigerator featuring stylish silver finish, powerful cooling and low energy consumption.",
        images: ["Images/von-181l-double-door.webp"]
      },
      {
        name: "Smartpro 138L Double Door Refrigerator",
        price: 24500,
        oldPrice: 29000,
        description: "Smartpro 138 litres double door refrigerator model 175DTI with energy-saving technology, low noise operation and spacious storage.",
        images: ["Images/smartpro-138l-double-door.webp"]
      },
      {
        name: "Syinix 137L Double Door Refrigerator",
        price: 30500,
        oldPrice: 35000,
        description: "Syinix 137 litres double door refrigerator with 3-star energy rating, inbuilt fridge guard, low noise and low power consumption.",
        images: ["Images/syinix-137l-double-door.webp"]
      },
      {
        name: "Ailyons 172L Double Door Refrigerator",
        price: 33500,
        oldPrice: 38000,
        description: "Ailyons 172 litres double door refrigerator with stylish silver finish, spacious compartments and efficient cooling.",
        images: ["Images/ailyons-172l-double-door.webp"]
      },
      {
        name: "Ailyons 266L Double Door Refrigerator",
        price: 45000,
        oldPrice: 50000,
        description: "Ailyons 266 litres large capacity double door refrigerator suitable for families, shops and offices.",
        images: ["Images/ailyons-266l-double-door.webp"]
      },
      {
        name: "Roch 197L Double Door Refrigerator No Frost",
        price: 45000,
        oldPrice: 52000,
        description: "Roch 197 litres no frost double door refrigerator with modern black finish and 5 years warranty.",
        images: ["Images/roch-197l-double-door.webp"]
      },
      {
        name: "Ecomax 138L Double Door Refrigerator",
        price: 31500,
        oldPrice: 36000,
        description: "Ecomax 138 litres 3-star double door refrigerator with fast cooling, energy-saving technology and spacious interior.",
        images: ["Images/ecomax-138l-double-door.webp"]
      }
    ]
  }
  ],
 microwaves: [
  {
    title: "Microwave Ovens",
    company: "Cozycabin",
    productType: "variant",
    description: "Modern microwave ovens for quick cooking, reheating and defrosting. Available in analogue and digital models from trusted brands including Ramtons, Hisense, Globalstar, Electromate, Mika, Von, Hanmac and more.",
    features: [
      "20 Litres Capacity",
      "Fast Heating",
      "Defrost Function",
      "Multiple Power Levels",
      "Digital & Analogue Models",
      "Easy To Clean",
      "Energy Efficient",
      "Compact Design"
    ],
    variants: [
      {
        name: "Hisense 20L Microwave Black",
        price: 9000,
        oldPrice: 10000,
        description: "20 litres digital microwave oven in black finish with fast heating and defrost function.",
        images: ["Images/hisense-20l-black.webp"]
      },
      {
        name: "Hisense 20L Microwave Silver",
        price: 9000,
        oldPrice: 10000,
        description: "20 litres microwave oven in silver finish featuring easy controls and energy efficient operation.",
        images: ["Images/hisense-20l-silver.webp"]
      },
      {
        name: "Hisense 20L Microwave White",
        price: 8500,
        oldPrice: 9500,
        description: "20 litres microwave oven in white finish ideal for home kitchens and everyday cooking.",
        images: ["Images/hisense-20l-white.webp"]
      },
      {
        name: "Hisense 20L White/Silver Analogue Microwave",
        price: 7500,
        oldPrice: 8500,
        description: "20 litres analogue microwave with simple knob controls and stylish white/silver finish.",
        images: ["Images/hisense-20l-analogue.webp"]
      },
      {
        name: "Electromate Microwave 20L Black",
        price: 7500,
        oldPrice: 8500,
        description: "20 litres black microwave oven with handle, compact design and fast heating capability.",
        images: ["Images/electromate-black-20l.webp"]
      },
      {
        name: "Electromate Digital Microwave 20L",
        price: 8500,
        oldPrice: 9500,
        description: "20 litres digital microwave with handle, modern glass finish and multiple cooking options.",
        images: ["Images/electromate-digital-20l.webp"]
      },
      {
        name: "Globalstar C20MXP01 Analogue Microwave 20L",
        price: 8000,
        oldPrice: 9500,
        description: "20 litres analogue microwave with handle, compact design and easy timer controls.",
        images: ["Images/globalstar-c20mxp01.webp"]
      },
      {
        name: "Mika Analog Microwave 20L",
        price: 9499,
        oldPrice: 10999,
        description: "20 litres analog microwave oven with 5 power levels, defrost function and durable glass door. Comes with 2 years warranty.",
        images: ["Images/mika-20l-analog.webp"]
      },
      {
        name: "Von Microwave 20L Digital With Grill",
        price: 10500,
        oldPrice: 12000,
        description: "20 litres digital microwave with grill, elegant glass finish and multiple auto cooking programs.",
        images: ["Images/von-20dgb.webp"]
      },
      {
        name: "Hanmac Manual Microwave 20L Black",
        price: 7800,
        oldPrice: 9000,
        description: "20 litres manual microwave in black with 5 power levels, defrost feature and 3 years warranty.",
        images: ["Images/hanmac-manual-black.webp"]
      },
      {
        name: "Hanmac Manual Microwave 20L White",
        price: 7800,
        oldPrice: 9000,
        description: "20 litres manual microwave in white with 5 power levels, defrost feature and 3 years warranty.",
        images: ["Images/hanmac-manual-white.webp"]
      },
      {
        name: "Hanmac Digital Microwave 20L",
        price: 8000,
        oldPrice: 9000,
        description: "20 litres digital microwave with touch controls, auto menus and 3 years warranty.",
        images: ["Images/hanmac-digital-20l.webp"]
      },
      {
        name: "Ramtons RM/458 Digital Glass Microwave 20L",
        price: 9500,
        oldPrice: 10500,
        description: "20 litres digital microwave with elegant silver glass finish, 700W power and multiple cooking programs.",
        images: ["Images/ramtons-rm458-microwave.webp"]
      },
      {
        name: "Ramtons Microwave 20L Manual RM672",
        price: 10500,
        oldPrice: 11500,
        description: "20 litres manual microwave with 700W power, defrost function and multiple cooking power levels.",
        images: ["Images/ramtons-rm672.webp"]
      },
      {
        name: "Ramtons Microwave + Convection Oven 28L",
        price: 28500,
        oldPrice: 32000,
        description: "28 litres microwave with convection oven for baking, grilling and reheating. Premium black finish.",
        images: ["Images/ramtons-rm327-convection.webp"]
      },
      {
        name: "Ramtons Microwave With Grill RM589 23L Silver",
        price: 15000,
        oldPrice: 17000,
        description: "23 litres microwave with grill, digital controls and elegant silver finish.",
        images: ["Images/ramtons-rm589.webp"]
      },
      {
        name: "Ramtons Microwave With Grill RM326 25L Silver",
        price: 20000,
        oldPrice: 22000,
        description: "25 litres microwave with grill, digital display and premium silver finish.",
        images: ["Images/ramtons-rm326.webp"]
      }
    ]
  }
],  
  washingmachines: [
    {
title: "Front Load & Twin Tub Washing Machines",
company: "Cozycabin",
productType: "variant",

description:
"Discover our range of high-quality washing machines from trusted brands including TLAC, Globalstar, Smart Pro, Ramtons, Syinix, TCL, Hisense and Mika. Available in Twin Tub Semi Automatic, Front Load and Wash & Dry models with capacities ranging from 8KG to 14KG. Features include Inverter Motors, Air Dry Technology, Steam Wash, Direct Drive Motors, Low Noise Operation, Energy Saving Technology and multiple smart wash programs. Designed for efficient cleaning, durability and convenience for both small and large households.",

features: [
"Front Load & Twin Tub Models",
"8KG - 14KG Capacity Options",
"Inverter Motor Technology",
"Air Dry Technology",
"Steam Wash",
"Wash & Dry Models",
"Low Noise Operation",
"Energy Saving",
"Multiple Wash Programs",
"Durable & Reliable Design"
],

variants: [
  {
  name: "TLAC Twin Tub Semi Automatic Washing Machine 10KG",
  price: 29500,
  oldPrice: 32000,
  description: "10kg twin tub semi automatic washing machine with separate wash and spin tubs, durable body and easy-to-use controls.",
  images: ["Images/tlac-twin-tub-10kg.webp"]
},
{
  name: "TLAC Twin Tub Semi Automatic Washing Machine 12KG",
  price: 35000,
  oldPrice: 38000,
  description: "12kg twin tub semi automatic washing machine designed for larger families with powerful washing and spinning performance.",
  images: ["Images/tlac-twin-tub-12kg.webp"]
},
{
  name: "TLAC Twin Tub Semi Automatic Washing Machine 14KG",
  price: 37000,
  oldPrice: 40000,
  description: "14kg heavy-duty twin tub washing machine with large capacity, efficient spin dryer and durable construction.",
  images: ["Images/tlac-twin-tub-14kg.webp"]
},
{
  name: "Globalstar Front Load Washing Machine 8KG GS-800GT",
  price: 40000,
  oldPrice: 45000,
  description: "8kg front load washing machine with inverter motor, multiple wash programs and energy-saving technology.",
  images: ["Images/globalstar-gs800gt-8kg.webp"]
},
{
  name: "Smart Pro Twin Tub Washing Machine 8KG",
  price: 21500,
  oldPrice: 25000,
  description: "8kg twin tub washing machine with Air Dry technology, compact design and efficient washing performance.",
  images: ["Images/smartpro-twin-tub-8kg.webp"]
},
{
  name: "Smart Pro Twin Tub Washing Machine 10KG",
  price: 27000,
  oldPrice: 30000,
  description: "10kg twin tub washing machine featuring Air Dry system, strong motor and large washing capacity.",
  images: ["Images/smartpro-twin-tub-10kg.webp"]
},
{
  name: "Smart Pro Twin Tub Washing Machine 13KG",
  price: 40500,
  oldPrice: 45000,
  description: "13kg top load twin tub washing machine with Air Dry technology, ideal for large households.",
  images: ["Images/smartpro-twin-tub-13kg.webp"]
},
{
  name: "Ramtons Twin Tub Washing Machine 10KG RW215",
  price: 35000,
  oldPrice: 38000,
  description: "10kg twin tub washing machine with Air Dryer, powerful washing performance and easy operation.",
  images: ["Images/ramtons-rw215-10kg.webp"]
},
{
  name: "Syinix Front Load Washing Machine 8KG V8WMFT",
  price: 42000,
  oldPrice: 47000,
  description: "8kg front load washing machine with inverter technology, low noise operation and low energy consumption.",
  images: ["Images/syinix-v8wmft-8kg.webp"]
},

{
  name: "TCL Front Load Wash & Dry Washing Machine 10/6KG C2110WDG",
  price: 55500,
  oldPrice: 60000,
  description: "10kg washing and 6kg drying capacity front load washing machine with Direct Drive motor and multiple smart wash programs.",
  images: ["Images/tcl-c2110wdg-10-6kg.webp"]
},
{
  name: "TCL Front Load Wash & Dry Washing Machine 10/7KG C7110WDG",
  price: 60000,
  oldPrice: 65000,
  description: "10kg wash and 7kg dry front load washing machine with advanced drying system and energy-saving technology.",
  images: ["Images/tcl-c7110wdg-10-7kg.webp"]
},

{
  name: "Hisense Front Load Wash & Dry Washing Machine 12/8KG",
  price: 87999,
  oldPrice: 95000,
  description: "12kg washing and 8kg drying capacity front load washing machine with modern design, multiple wash modes and energy efficiency.",
  images: ["Images/hisense-wash-dry-12-8kg.webp"]
 },
  {
  name: "Mika Front Load Washing Machine 10KG MWAFS13410DSV",
  price: 62000,
  oldPrice: 68000,
  description: "10kg front load washing machine featuring SpaCare Steam Wash, Inverter Motor (BLDC), 1400 RPM spin speed and multiple wash programs. Energy efficient design with powerful cleaning and gentle fabric care.",
  images: ["Images/mika-front-load-10kg-mwafs13410dsv.webp","Images/mika-front-load-10kg-mwafs13410dsv1.webp"]
}
]
  }
],
  // ══════════════════════════════════════════════════════════
  //  CATEGORY KEYS — ORGANISED BY SUBMENU
  //  ─────────────────────────────────────────────────────────
  //  HOW TO ADD A NEW CATEGORY:
  //  1. Add the button in index.html inside the right submenu:
  //       <button class="minor-btn" data-category="yourkey">🏷️ Label</button>
  //  2. Add the key here (empty = Coming Soon, or add products):
  //       yourkey: [],
  //  3. When you have stock, replace [] with [...your products]
  //  ══════════════════════════════════════════════════════════

  // ── FASHION ──────────────────────────────────────────────
  watches:     [],
  belts:       [],
  jackets:     [],   // NEW
  bags:        [],
  trousers:    [],   // NEW
  ties:        [],   // NEW
  sportswear:  [],   // NEW
  // ADD MORE FASHION ITEMS HERE

  // ── KITCHEN ──────────────────────────────────────────────
  dispenser:   [],
  racks:       [],
  bottles:     [],
  cookers:     [],
  blenders:    [],
  cups:        [],   // NEW
  // ADD MORE KITCHEN ITEMS HERE

  // ── SOLAR ────────────────────────────────────────────────
  chargers:    [],
  // ADD MORE SOLAR ITEMS HERE

  // ── APPLIANCES ───────────────────────────────────────────
  fryers:      [],
  kettles:     [],
  irons:       [],
  heaters:     [],
  fans:        [],
  fansapp:     [],
  // ADD MORE APPLIANCE ITEMS HERE

  // ── DECOR ────────────────────────────────────────────────
  wallart:     [],
  mirrors:     [],
  flowers:     [],
  lamps:       [],
  carpets:     [],
  curtains:    [],
  frames:      [],
  vases:       [],
  // ADD MORE DECOR ITEMS HERE

  // ── BEDDING ──────────────────────────────────────────────
  duvets:      [],
  bedsheets:   [],
  blankets:    [],
  pillows:     [],
  mattress:    [],
  covers:      [],
  nets:        [],
  towels:      [],
  // ADD MORE BEDDING ITEMS HERE

  // ── SECURITY ─────────────────────────────────────────────
  cameras:     [],
  alarms:      [],
  locks:       [],
  doorbells:   [],
  trackers:    [],
  sensors:     [],
  safes:       [],
  recorders:   [],
  // ADD MORE SECURITY ITEMS HERE

  // ── ELECTRONICS ──────────────────────────────────────────
  speakers:    [],
  radios:      [],
  earbuds:     [],
  tvbox:       [],
  powerbanks:  [],
  flashdisks:  [],
  smartwatch:  [],
  gaming:      [],
  // ADD MORE ELECTRONICS ITEMS HERE

  // ── COMPUTERS ────────────────────────────────────────────
  phones:      [],
  laptops:     [],
  tablets:     [],
  routers:     [],
  keyboards:   [],
  mouse:       [],
  printers:    [],
  storage:     [],
  // ADD MORE COMPUTER ITEMS HERE

};

// ============================================================
//  PRODUCT ID SYSTEM
//  Auto-generates a stable slug id from every product title.
//  Standard:  product.id = "mens-premium-formal-shoes"
//  Variant:   same on the parent card; variants get no id
//              (they share the parent card's id)
//
//  CC_PRODUCTS_BY_ID is a flat lookup: id → { category, index, product }
//  Built once here; used by cc-deeplink.js and openPaymentModal.
// ============================================================
function ccSlug(str) {
  return (str || '')
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Attach .id to every product that doesn't already have one
;(function ccAssignIds() {
  Object.keys(products).forEach(function(cat) {
    (products[cat] || []).forEach(function(p) {
      if (!p.id) p.id = ccSlug(p.title);
    });
  });
})();

// Build the global id → product lookup map
var CC_PRODUCTS_BY_ID = {};
;(function ccBuildIdMap() {
  Object.keys(products).forEach(function(cat) {
    (products[cat] || []).forEach(function(p, idx) {
      if (p.id) {
        CC_PRODUCTS_BY_ID[p.id] = { category: cat, index: idx, product: p };
      }
    });
  });
})();

// Public helpers
window.ccSlug         = ccSlug;
window.CC_PRODUCTS_BY_ID = CC_PRODUCTS_BY_ID;

/** Build a permanent shareable URL for any product */
window.ccProductURL = function(product) {
  var id = product && (product.id || ccSlug(product.title));
  if (!id) return window.location.href;
  return window.location.origin + window.location.pathname + '?id=' + id;
};


// ============================================================
//  HELPERS
// ============================================================
function hideProducts() {
  var c = document.getElementById('products-container');
  if (c) { c.innerHTML = ''; c.style.display = 'none'; }
}

function savingsPercent(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

// ============================================================
//  BUILD SWIPEABLE GALLERY HTML
//  Slide 0 = video (if product.video exists), rest = images
//  All content stays inside .product-gallery box — no overflow
// ============================================================
function buildGalleryHTML(product, index) {
  var hasVideo  = product.video && product.video.length > 0;
  var slides    = [];
  var galleryId = 'gal-' + index;

  if (hasVideo) {
    slides.push({ type: 'video', src: product.video });
  }
  product.images.forEach(function(img) {
    slides.push({ type: 'img', src: img });
  });

  var total = slides.length;

  // ── Main track slides ──
  var trackHTML = '';
  slides.forEach(function(slide, si) {
    if (slide.type === 'video') {
      trackHTML +=
        '<div class="cc-slide" style="flex:0 0 100%;min-width:100%;width:100%;position:relative;overflow:hidden;box-sizing:border-box;">' +
          '<video class="cc-video" id="ccvid-' + index + '" src="' + slide.src + '" ' +
                 'muted autoplay playsinline preload="auto" ' +
                 'oncanplay="ccOnCanPlay(' + index + ')" ' +
                 'onerror="ccOnVideoError(' + index + ')" ' +
                 'style="width:100%;height:auto;display:block;"></video>' +
          '<div class="cc-vid-progress" id="cc-prog-' + index + '"></div>' +
          '<div class="cc-play-overlay" id="cc-play-' + index + '" onclick="ccToggleVideo(' + index + ')" style="opacity:0;pointer-events:none;">' +
            '<div class="cc-play-btn"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:#000;margin-left:3px;"><polygon points="5,3 19,12 5,21"/></svg></div>' +
          '</div>' +
          '<span class="cc-vid-badge" id="cc-badge-' + index + '">⏳ Loading</span>' +
        '</div>';
    } else {
      trackHTML +=
        '<div class="cc-slide" style="flex:0 0 100%;min-width:100%;width:100%;box-sizing:border-box;">' +
          '<img src="' + slide.src + '" loading="lazy" onerror="this.onerror=null;this.src=\'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect width=%22400%22 height=%22400%22 fill=%22%230d1120%22/%3E%3Ctext x=%22200%22 y=%22205%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2216%22 fill=%22%2394a3b8%22%3EImage unavailable%3C/text%3E%3C\/svg%3E\';this.style.objectFit=\'contain\';" ' +
               'style="width:100%;height:auto;display:block;">' +
        '</div>';
    }
  });
    // ── Thumbnail row ──
  var thumbHTML = '';
  slides.forEach(function(slide, si) {
    var active = si === 0 ? ' cc-th-active' : '';
    if (slide.type === 'video') {
      thumbHTML +=
        '<div class="cc-thumb' + active + '" data-gal="' + galleryId + '" data-si="' + si + '" onclick="ccGoTo(\'' + galleryId + '\',' + si + ',' + index + ')">' +
          '<video src="' + slide.src + '" muted preload="none" style="width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;"></video>' +
          '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.38);">' +
            '<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:#ffd700;"><polygon points="5,3 19,12 5,21"/></svg>' +
          '</div>' +
        '</div>';
    } else {
      thumbHTML +=
        '<div class="cc-thumb' + active + '" data-gal="' + galleryId + '" data-si="' + si + '" onclick="ccGoTo(\'' + galleryId + '\',' + si + ',' + index + ')">' +
          '<img src="' + slide.src + '" loading="lazy" style="width:100%;height:auto;display:block;">' +
        '</div>';
    }
  });

  // ── Dots ──
  var dotsHTML = '';
  slides.forEach(function(_, si) {
    dotsHTML += '<span class="cc-dot' + (si === 0 ? ' cc-dot-active' : '') + '" data-gal="' + galleryId + '" data-si="' + si + '"></span>';
  });

  // ── Full gallery wrapper ──
  return (
    '<div class="cc-gallery" id="' + galleryId + '" data-current="0" data-total="' + total + '" data-pidx="' + index + '">' +

      '<div class="cc-viewport" style="position:relative;width:100%;overflow:hidden;border-radius:14px;">' +

        '<div class="cc-track" id="cc-track-' + galleryId + '" style="display:flex;flex-direction:row;flex-wrap:nowrap;width:100%;transition:transform 0.35s ease;will-change:transform;">' +
          trackHTML +
        '</div>' +

        '<div class="cc-counter" id="cc-counter-' + galleryId + '">1 / ' + total + '</div>' +
        '<div class="cc-dots" id="cc-dots-' + galleryId + '">' + dotsHTML + '</div>' +

      '</div>' +

      '<div class="cc-thumbrow" id="cc-thumbrow-' + galleryId + '">' + thumbHTML + '</div>' +

    '</div>'
  );
}

// ============================================================
//  GALLERY RUNTIME — go to slide, video toggle
// ============================================================
window.ccGoTo = function(galId, si, pidx) {
  var gal    = document.getElementById(galId);
  var track  = document.getElementById('cc-track-' + galId);
  var counter = document.getElementById('cc-counter-' + galId);
  if (!gal || !track) return;

  var total   = parseInt(gal.getAttribute('data-total'));
  var current = parseInt(gal.getAttribute('data-current'));

  // Pause video if leaving slide 0
  if (current === 0) {
    var vid = document.getElementById('ccvid-' + pidx);
    if (vid && !vid.paused) {
      vid.pause();
      var overlay = document.getElementById('cc-play-' + pidx);
      if (overlay) overlay.style.opacity = '1';
    }
  }
      gal.setAttribute('data-current', si);

  // Move track
  track.style.transform = 'translateX(-' + (si * 100) + '%)';

  // Counter
  if (counter) counter.textContent = (si + 1) + ' / ' + total;

  // Dots
  gal.querySelectorAll('.cc-dot').forEach(function(d, i) {
    d.classList.toggle('cc-dot-active', i === si);
  });

  // Thumbs
  gal.querySelectorAll('.cc-thumb').forEach(function(th) {
    th.classList.toggle('cc-th-active', parseInt(th.getAttribute('data-si')) === si);
  });
};

window.ccToggleVideo = function(pidx) {
  var vid     = document.getElementById('ccvid-' + pidx);
  var overlay = document.getElementById('cc-play-' + pidx);
  if (!vid) return;
  if (vid.paused) {
    vid.play().then(function() {
      if (overlay) { overlay.style.opacity = '0'; overlay.style.pointerEvents = 'none'; }
    }).catch(function() {
      if (overlay) { overlay.style.opacity = '1'; overlay.style.pointerEvents = 'auto'; }
    });
  } else {
    vid.pause();
    if (overlay) { overlay.style.opacity = '1'; overlay.style.pointerEvents = 'auto'; }
  }
};

// Called when video loads OK — autoplay, show progress bar, advance after 20s
window.ccOnCanPlay = function(pidx) {
  var badge   = document.getElementById('cc-badge-' + pidx);
  var overlay = document.getElementById('cc-play-' + pidx);
  var prog    = document.getElementById('cc-prog-' + pidx);
  var vid     = document.getElementById('ccvid-' + pidx);
  if (badge) { badge.textContent = '▶ VIDEO'; }
  // Handle autoplay block (common on mobile)
  if (vid) {
    var pp = vid.play();
    if (pp !== undefined) {
      pp.then(function() {
        if (overlay) { overlay.style.opacity = '0'; overlay.style.pointerEvents = 'none'; }
      }).catch(function() {
        if (badge)   { badge.textContent = '▶ TAP TO PLAY'; }
        if (overlay) { overlay.style.opacity = '1'; overlay.style.pointerEvents = 'auto'; }
      });
    } else {
      if (overlay) { overlay.style.opacity = '0'; overlay.style.pointerEvents = 'none'; }
    }
  }

  // Start gold progress bar over 20 seconds
  if (prog) {
    prog.style.transition = 'none';
    prog.style.width = '0%';
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        prog.style.transition = 'width 20s linear';
        prog.style.width = '100%';
      });
    });
  }

  // After 20s, advance to slide 1 (first image)
  var galId = 'gal-' + pidx;
  var gal   = document.getElementById(galId);
  if (gal && parseInt(gal.getAttribute('data-total')) > 1) {
    // Clear any previous timer
    if (window._vidTimer && window._vidTimer[pidx]) {
      clearTimeout(window._vidTimer[pidx]);
    }
    if (!window._vidTimer) window._vidTimer = {};
    window._vidTimer[pidx] = setTimeout(function() {
      // Only advance if still on slide 0
      if (parseInt(gal.getAttribute('data-current')) === 0) {
        window.ccGoTo(galId, 1, pidx);
        // Stop video to save bandwidth
        if (vid) vid.pause();
      }
    }, 20000);
  }
};

// Called if video fails — auto-skip to first image slide
window.ccOnVideoError = function(pidx) {
  var badge   = document.getElementById('cc-badge-' + pidx);
  var overlay = document.getElementById('cc-play-' + pidx);
  if (badge)   { badge.textContent = '📷 See Photos'; badge.style.background = 'rgba(0,0,0,0.7)'; }
  if (overlay) { overlay.style.opacity = '0'; overlay.style.pointerEvents = 'none'; }
  // Auto-advance to image slide 1 after 600ms
  setTimeout(function() {
    var gal = document.getElementById('gal-' + pidx);
    if (gal && parseInt(gal.getAttribute('data-total')) > 1) {
      window.ccGoTo('gal-' + pidx, 1, pidx);
    }
  }, 600);
};

// Re-autoplay + reset progress bar when user swipes BACK to slide 0
var _origCcGoTo = window.ccGoTo;
window.ccGoTo = function(galId, si, pidx) {
  _origCcGoTo(galId, si, pidx);
  if (si === 0) {
    var vid     = document.getElementById('ccvid-' + pidx);
    var overlay = document.getElementById('cc-play-' + pidx);
    var prog    = document.getElementById('cc-prog-' + pidx);
    // Reset progress bar
    if (prog) {
      prog.style.transition = 'none';
      prog.style.width = '0%';
    }
    if (vid) {
      vid.currentTime = 0;
      vid.play().then(function() {
        if (overlay) { overlay.style.opacity = '0'; overlay.style.pointerEvents = 'none'; }
        // Restart progress bar
        if (prog) {
          requestAnimationFrame(function() {
            requestAnimationFrame(function() {
              prog.style.transition = 'width 20s linear';
              prog.style.width = '100%';
            });
          });
        }
        // Restart 20s advance timer
        var gal = document.getElementById(galId);
        if (gal && parseInt(gal.getAttribute('data-total')) > 1) {
          if (window._vidTimer && window._vidTimer[pidx]) clearTimeout(window._vidTimer[pidx]);
          if (!window._vidTimer) window._vidTimer = {};
          window._vidTimer[pidx] = setTimeout(function() {
            if (parseInt(gal.getAttribute('data-current')) === 0) {
              window.ccGoTo(galId, 1, pidx);
              if (vid) vid.pause();
            }
          }, 20000);
        }
      }).catch(function() {
        if (overlay) { overlay.style.opacity = '1'; overlay.style.pointerEvents = 'auto'; }
      });
    }
  }
};

// Touch-swipe support — attached after card is added to DOM
function attachSwipe(galId, pidx) {
  var track = document.getElementById('cc-track-' + galId);
  var gal   = document.getElementById(galId);
  if (!track || !gal) return;
  var startX = 0;
  track.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', function(e) {
    var diff    = startX - e.changedTouches[0].clientX;
    var current = parseInt(gal.getAttribute('data-current'));
    var total   = parseInt(gal.getAttribute('data-total'));
    if (Math.abs(diff) > 40) {
      var next = diff > 0 ? Math.min(current + 1, total - 1) : Math.max(current - 1, 0);
      if (next !== current) window.ccGoTo(galId, next, pidx);
    }
  }, { passive: true });
}

// ============================================================
//  GALLERY CSS — injected once into <head>
// ============================================================
(function injectGalleryCSS() {
  if (document.getElementById('cc-gallery-style')) return;
  var s = document.createElement('style');
  s.id = 'cc-gallery-style';
  s.textContent = [
    '.cc-gallery{width:100%;border-radius:12px;overflow:hidden;margin-bottom:10px;}',
    '.cc-viewport{position:relative;width:100%;overflow:hidden;background:#0a0f1e;}',
    '.cc-track{display:flex;width:100%;transition:transform 0.32s cubic-bezier(.4,0,.2,1);}',
    '.cc-slide{flex:0 0 100%;width:100%;position:relative;overflow:hidden;}',
    '.cc-slide img{width:100%;height:auto;display:block;}',
    '.cc-slide video{width:100%;height:auto;display:block;object-fit:cover;}',
    '.cc-vid-progress{position:absolute;bottom:0;left:0;height:3px;background:#ffd700;width:0%;z-index:5;border-radius:0 2px 2px 0;}',
    '.cc-play-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.28);cursor:pointer;transition:opacity 0.2s;z-index:4;}',
    '.cc-play-btn{width:54px;height:54px;background:#ffd700;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(255,215,0,0.5);}',
    '.cc-vid-badge{position:absolute;top:8px;left:8px;background:#ffd700;color:#000;font-size:9px;font-weight:800;letter-spacing:0.1em;padding:3px 8px;border-radius:5px;text-transform:uppercase;pointer-events:none;z-index:5;}',
    '.cc-counter{position:absolute;top:8px;right:8px;background:rgba(0,0,0,0.6);color:#fff;font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px;letter-spacing:0.04em;pointer-events:none;z-index:5;}',
    /* ── Dots: gold active, faint white inactive ── */
    '.cc-dots{position:absolute;bottom:10px;left:0;right:0;display:flex;justify-content:center;gap:5px;pointer-events:none;z-index:5;}',
    '.cc-dot{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,0.3);transition:background .2s,width .2s,border-radius .2s;}',
    '.cc-dot-active{background:#ffd700;width:18px;border-radius:4px;}',
    /* ── Thumbnails: gold border + glow when active ── */
    '.cc-thumbrow{display:flex;gap:7px;padding:8px 10px;overflow-x:auto;background:rgba(0,0,0,0.25);scrollbar-width:none;}',
    '.cc-thumbrow::-webkit-scrollbar{display:none;}',
    '.cc-thumb{flex:0 0 60px;height:60px;border-radius:8px;overflow:hidden;border:2px solid rgba(255,255,255,0.1);cursor:pointer;transition:border-color .18s,box-shadow .18s,background .18s;position:relative;background:rgba(255,255,255,0.04);}',
    '.cc-th-active{border:3px solid #ffd700!important;box-shadow:0 0 15px rgba(255,215,0,0.4)!important;background:rgba(255,215,0,0.08)!important;}',
    '.cc-thumb img,.cc-thumb video{width:100%;height:100%;object-fit:cover;display:block;}'
  ].join('');
  document.head.appendChild(s);
})();

/* ── Size & Colour button active state — gold border + glow matching thumbnails ── */
(function injectVariantBtnCSS() {
  if (document.getElementById('cc-varbtn-style')) return;
  var s = document.createElement('style');
  s.id = 'cc-varbtn-style';
  s.textContent = [
    /* Base state */
    '.size-btn,.color-btn{',
    '  border:2px solid rgba(255,255,255,0.15);border-radius:8px;',
    '  background:rgba(255,255,255,0.05);color:#e2e8f0;',
    '  padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;',
    '  transition:border-color .18s,box-shadow .18s,background .18s;',
    '}',
    /* Active state — identical to .cc-th-active */
    '.size-btn.option-active,.color-btn.option-active{',
    '  border:3px solid #ffd700!important;',
    '  box-shadow:0 0 15px rgba(255,215,0,0.4)!important;',
    '  background:rgba(255,215,0,0.08)!important;',
    '  color:#fff!important;',
    '}',
  ].join('');
  document.head.appendChild(s);
})();

// ============================================================
//  VARIANT CARD V2 — CSS + renderer + selector logic
//  Premium: full swipeable gallery per variant,
//  compact image thumbnail selector, animated price swap
// ============================================================

/* ── V2 Variant CSS (injected once) ── */
(function injectVariantCSS() {
  if (document.getElementById('cc-variant-style')) return;
  var s = document.createElement('style');
  s.id = 'cc-variant-style';
  s.textContent = [
    /* ── Price-bar thumbnail row (replaces standard cc-thumbrow for variant cards) ── */
    '.vc-pricebar{display:flex;flex-direction:row;gap:0;overflow-x:auto;-webkit-overflow-scrolling:touch;',
    '  scrollbar-width:none;padding:0;margin:0;background:transparent;}',
    '.vc-pricebar::-webkit-scrollbar{display:none;}',
    '.vc-pb-btn{display:flex;flex-direction:column;align-items:center;gap:0;flex-shrink:0;',
    '  width:calc(20% - 0px);min-width:72px;max-width:110px;',
    '  border:none;border-bottom:3px solid transparent;',
    '  background:transparent;padding:0;cursor:pointer;',
    '  transition:border-color .18s,background .18s;}',
    '.vc-pb-btn:active{opacity:0.8;}',
    '.vc-pb-btn.vc-pb-active{border-bottom-color:#ffd700;background:rgba(255,215,0,0.06);}',
    '.vc-pb-img{width:100%;aspect-ratio:1/1;object-fit:cover;display:block;pointer-events:none;',
    '  border:2px solid rgba(255,255,255,0.1);transition:border-color .18s,box-shadow .18s;}',
    '.vc-pb-btn.vc-pb-active .vc-pb-img{border:3px solid #ffd700;box-shadow:0 0 15px rgba(255,215,0,0.4);background:rgba(255,215,0,0.08);}',
    '.vc-pb-price{font-size:11px;font-weight:700;color:#94a3b8;text-align:center;',
    '  padding:5px 2px 6px;line-height:1;white-space:nowrap;}',
    '.vc-pb-btn.vc-pb-active .vc-pb-price{color:#ffd700;}',
    /* ── Selected variant name pill ── */
    '.cc-vsel-selected{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:#ffd700;',
    '  background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.28);border-radius:20px;padding:4px 12px;margin-bottom:8px;}',
    '.cc-vsel-badge{font-size:9px;font-weight:800;background:#ffd700;color:#000;border-radius:10px;padding:1px 6px;margin-left:2px;}',
    /* ── Price row ── */
    '.cc-vpr-wrap{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:6px;transition:opacity .18s;}',
    '.cc-vpr-wrap.cc-vpr-fade{opacity:0;}',
    '.cc-vpr-new{font-size:20px;font-weight:800;color:#ffd700;}',
    '.cc-vpr-old{font-size:13px;color:#64748b;text-decoration:line-through;}',
    '.cc-vpr-save{font-size:10px;font-weight:700;color:#22c55e;background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.25);border-radius:4px;padding:2px 6px;white-space:nowrap;}',
  ].join('');
  document.head.appendChild(s);
})();
    
/* ── Track selected variant per card ── */
var selectedVariants = {};

/* ── Build slide list from a variant: supports v.images[] or v.image ── */
function vcBuildSlides(v) {
  var slides = [];
  if (v.video) slides.push({ type: 'video', src: v.video });
  if (v.images && v.images.length) {
    v.images.forEach(function(img) { slides.push({ type: 'img', src: img }); });
  } else if (v.image) {
    slides.push({ type: 'img', src: v.image });
  }
  return slides;
}

/* ── Build gallery HTML string from slides ──
   Pass variants[] to get a price-bar thumb row (one button per variant).
   Omit variants to get standard per-image thumb row.                     */
function vcBuildGalleryHTML(slides, galId, pidx, variants) {
  var total = slides.length;
  var trackHTML = '', dotsHTML = '';
  slides.forEach(function(slide, si) {
    if (slide.type === 'video') {
      trackHTML +=
        '<div class="cc-slide" style="flex:0 0 100%;min-width:100%;width:100%;position:relative;overflow:hidden;box-sizing:border-box;">' +
          '<video class="cc-video" id="ccvid-' + pidx + '" src="' + slide.src + '" muted autoplay playsinline preload="auto" ' +
            'oncanplay="ccOnCanPlay(' + pidx + ')" onerror="ccOnVideoError(' + pidx + ')" ' +
            'style="width:100%;height:auto;display:block;"></video>' +
          '<div class="cc-vid-progress" id="cc-prog-' + pidx + '"></div>' +
          '<div class="cc-play-overlay" id="cc-play-' + pidx + '" onclick="ccToggleVideo(' + pidx + ')" style="opacity:0;pointer-events:none;">' +
            '<div class="cc-play-btn"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:#000;margin-left:3px;"><polygon points="5,3 19,12 5,21"/></svg></div>' +
          '</div>' +
          '<span class="cc-vid-badge" id="cc-badge-' + pidx + '">⏳ Loading</span>' +
        '</div>';
    } else {
      trackHTML += '<div class="cc-slide" style="flex:0 0 100%;min-width:100%;width:100%;box-sizing:border-box;">' +
        '<img src="' + slide.src + '" loading="lazy" onerror="this.onerror=null;this.src=\'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect width=%22400%22 height=%22400%22 fill=%22%230d1120%22/%3E%3Ctext x=%22200%22 y=%22205%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2216%22 fill=%22%2394a3b8%22%3EImage unavailable%3C/text%3E%3C\/svg%3E\';this.style.objectFit=\'contain\';" style="width:100%;height:auto;display:block;"></div>';
    }
    dotsHTML += '<span class="cc-dot' + (si === 0 ? ' cc-dot-active' : '') + '"></span>';
  });

  /* ── Thumb row: price-bar (variant mode) or standard per-image ── */
  var thumbRowHTML = '';
  if (variants && variants.length) {
    var pbHTML = '';
    variants.forEach(function(v, vi) {
      var src = (v.images && v.images[0]) || v.image || '';
      var label = v.price ? 'KES\u00a0' + Number(v.price).toLocaleString() : '';
      pbHTML +=
        '<button class="vc-pb-btn' + (vi === 0 ? ' vc-pb-active' : '') + '" ' +
                'id="vc-pb-' + pidx + '-' + vi + '" ' +
                'data-pidx="' + pidx + '" data-vi="' + vi + '">' +
          (src ? '<img class="vc-pb-img" src="' + src + '" loading="lazy" alt="' + v.name + '">' : '') +
          '<span class="vc-pb-price">' + label + '</span>' +
        '</button>';
    });
    thumbRowHTML = '<div class="vc-pricebar" id="cc-thumbrow-' + galId + '">' + pbHTML + '</div>';
  } else {
    var thumbHTML = '';
    slides.forEach(function(slide, si) {
      var active = si === 0 ? ' cc-th-active' : '';
      if (slide.type === 'video') {
        thumbHTML += '<div class="cc-thumb' + active + '" onclick="ccGoTo(\'' + galId + '\',' + si + ',' + pidx + ')">' +
          '<video src="' + slide.src + '" muted preload="none" style="width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;"></video>' +
          '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.38);">' +
            '<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:#ffd700;"><polygon points="5,3 19,12 5,21"/></svg></div></div>';
      } else {
        thumbHTML += '<div class="cc-thumb' + active + '" onclick="ccGoTo(\'' + galId + '\',' + si + ',' + pidx + ')">' +
          '<img src="' + slide.src + '" loading="lazy" style="width:100%;height:auto;display:block;"></div>';
      }
    });
    thumbRowHTML = '<div class="cc-thumbrow" id="cc-thumbrow-' + galId + '">' + thumbHTML + '</div>';
  }

  return '<div class="cc-gallery" id="' + galId + '" data-current="0" data-total="' + total + '" data-pidx="' + pidx + '">' +
    '<div class="cc-viewport" style="position:relative;width:100%;overflow:hidden;border-radius:14px;">' +
      '<div class="cc-track" id="cc-track-' + galId + '" style="display:flex;flex-direction:row;flex-wrap:nowrap;width:100%;transition:transform 0.35s ease;will-change:transform;">' +
        trackHTML +
      '</div>' +
      '<div class="cc-counter" id="cc-counter-' + galId + '">1 / ' + total + '</div>' +
      '<div class="cc-dots" id="cc-dots-' + galId + '">' + dotsHTML + '</div>' +
    '</div>' +
    thumbRowHTML +
  '</div>';
        }

/* ── V2 renderVariantCard ── */
function renderVariantCard(product, index) {
  var variants = product.variants || [];
  if (!variants.length) return null;

  selectedVariants[index] = 0;
  selectedOptions[index]  = { size: null, color: null };

  var first  = variants[0];
  var galId  = 'vc-gal-' + index;
  var slides = vcBuildSlides(first);
  var galHTML = vcBuildGalleryHTML(slides, galId, index, variants);
  var pct0   = savingsPercent(first.price, first.oldPrice);

  /* Sizes */
  var sizesSection = '';
  if (product.sizes && product.sizes.length) {
    var szHTML = '';
    product.sizes.forEach(function(sz) {
      szHTML += '<button class="size-btn" data-index="' + index + '" data-size="' + sz + '">' + sz + '</button>';
    });
    sizesSection = '<div class="sizes-box"><h4>Select Size</h4><div class="sizes-row" id="sizes-' + index + '">' + szHTML + '</div></div>';
  }

  var card = document.createElement('div');
  card.className = 'product-card';
  card.setAttribute('data-variant-card', index);
  card.setAttribute('data-product-index', index);

  card.innerHTML =
    galHTML +
    '<h2 class="product-title">' + product.title + '</h2>' +
    (product.company ? '<p class="company-name">' + product.company + '</p>' : '') +
    '<div class="cc-vsel-selected" id="vc-selname-' + index + '">✦ <span id="vc-selname-text-' + index + '">' + first.name + '</span>' +
      (first.badge ? '<span class="cc-vsel-badge">' + first.badge + '</span>' : '') + '</div>' +
    '<div class="cc-vpr-wrap" id="vc-prwrap-' + index + '">' +
      '<span class="cc-vpr-new" id="vc-newp-' + index + '">KES ' + (first.price || 0).toLocaleString() + '</span>' +
      (first.oldPrice ? '<span class="cc-vpr-old" id="vc-oldp-' + index + '">KES ' + first.oldPrice.toLocaleString() + '</span>' : '<span id="vc-oldp-' + index + '"></span>') +
      (pct0 > 0 ? '<span class="cc-vpr-save" id="vc-save-' + index + '">SAVE ' + pct0 + '%</span>' : '<span class="cc-vpr-save" id="vc-save-' + index + '" style="display:none;"></span>') +
    '</div>' +
    (product.description ? '<p class="product-description">' + product.description + '</p>' : '') +
    sizesSection +
    '<p id="selection-hint-' + index + '" class="selection-hint"></p>' +
    '<button class="buy-btn" id="vc-buybtn-' + index + '" data-index="' + index + '" data-title="' + product.title.replace(/"/g, '&quot;') + '" data-price="' + first.price + '" data-variant-card="' + index + '" data-product-id="' + (product.id || ccSlug(product.title)) + '">🛒 Order via WhatsApp</button>' +
    '<button class="cart-btn">🛍️ Add to Cart</button>' +
    '<details class="details-box"><summary>📋 More Details</summary><p style="margin-top:10px;">Premium quality product. Nationwide delivery available via G4S, Simba Coach, Tahmeed and more.</p></details>';

  /* Wire price-bar clicks + swipe (swipe also switches variant) */
  setTimeout(function() {
    var pricebar = document.getElementById('cc-thumbrow-' + galId);
    if (pricebar) {
      pricebar.addEventListener('click', function(e) {
        var btn = e.target.closest('.vc-pb-btn');
        if (!btn) return;
        vcSelectVariant(parseInt(btn.getAttribute('data-pidx')), parseInt(btn.getAttribute('data-vi')), product.variants);
      });
    }
    attachSwipe(galId, index);
    /* Override swipe next/prev to switch variants */
    var galEl = document.getElementById(galId);
    if (galEl) {
      galEl.addEventListener('cc-swipe-next', function() {
        var cur = selectedVariants[index] || 0;
        var next = (cur + 1) % product.variants.length;
        vcSelectVariant(index, next, product.variants);
      });
      galEl.addEventListener('cc-swipe-prev', function() {
        var cur = selectedVariants[index] || 0;
        var prev = (cur - 1 + product.variants.length) % product.variants.length;
        vcSelectVariant(index, prev, product.variants);
      });
    }
  }, 0);

  return card;
}

/* ── vcSelectVariant: update gallery + name pill + price ── */
function vcSelectVariant(pidx, vi, variants) {
  if (!variants || vi >= variants.length) return;
  selectedVariants[pidx] = vi;
  var v     = variants[vi];
  var galId = 'vc-gal-' + pidx;
  var slides = vcBuildSlides(v);

  /* Rebuild track slides for new variant (price-bar stays static) */
  var gal      = document.getElementById(galId);
  var trackEl  = document.getElementById('cc-track-' + galId);
  var counterEl = document.getElementById('cc-counter-' + galId);
  var dotsEl   = document.getElementById('cc-dots-' + galId);
  if (gal && trackEl) {
    var oldVid = document.getElementById('ccvid-' + pidx);
    if (oldVid) { try { oldVid.pause(); } catch(e2){} }
    var total = slides.length;
    var trackHTML = '', dotsHTML = '';
    slides.forEach(function(slide, si) {
      if (slide.type === 'video') {
        trackHTML += '<div class="cc-slide" style="flex:0 0 100%;min-width:100%;width:100%;position:relative;overflow:hidden;box-sizing:border-box;">' +
          '<video class="cc-video" id="ccvid-' + pidx + '" src="' + slide.src + '" muted autoplay playsinline preload="auto" ' +
            'oncanplay="ccOnCanPlay(' + pidx + ')" onerror="ccOnVideoError(' + pidx + ')" ' +
            'style="width:100%;height:auto;display:block;"></video>' +
          '<div class="cc-vid-progress" id="cc-prog-' + pidx + '"></div>' +
          '<div class="cc-play-overlay" id="cc-play-' + pidx + '" onclick="ccToggleVideo(' + pidx + ')" style="opacity:0;pointer-events:none;">' +
            '<div class="cc-play-btn"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:#000;margin-left:3px;"><polygon points="5,3 19,12 5,21"/></svg></div>' +
          '</div>' +
          '<span class="cc-vid-badge" id="cc-badge-' + pidx + '">⏳ Loading</span>' +
        '</div>';
      } else {
        trackHTML += '<div class="cc-slide" style="flex:0 0 100%;min-width:100%;width:100%;box-sizing:border-box;">' +
          '<img src="' + slide.src + '" loading="lazy" style="width:100%;height:auto;display:block;"></div>';
      }
      dotsHTML += '<span class="cc-dot' + (si === 0 ? ' cc-dot-active' : '') + '"></span>';
    });
    trackEl.style.transform = 'translateX(0)';
    trackEl.innerHTML = trackHTML;
    if (counterEl) counterEl.textContent = '1 / ' + total;
    if (dotsEl)    dotsEl.innerHTML = dotsHTML;
    gal.setAttribute('data-current', '0');
    gal.setAttribute('data-total', total);
    attachSwipe(galId, pidx);
  }

  /* Update active state on price-bar buttons */
  var pricebar = document.getElementById('cc-thumbrow-' + galId);
  if (pricebar) {
    pricebar.querySelectorAll('.vc-pb-btn').forEach(function(btn) {
      btn.classList.toggle('vc-pb-active', parseInt(btn.getAttribute('data-vi')) === vi);
    });
  }

  /* Name pill */
  var selNameEl   = document.getElementById('vc-selname-' + pidx);
  var selNameText = document.getElementById('vc-selname-text-' + pidx);
  if (selNameEl) {
    selNameEl.style.opacity = '0';
    setTimeout(function() {
      if (selNameText) selNameText.textContent = v.name;
      var oldBadge = selNameEl.querySelector('.cc-vsel-badge');
      if (oldBadge) oldBadge.remove();
      if (v.badge) { var nb = document.createElement('span'); nb.className = 'cc-vsel-badge'; nb.textContent = v.badge; selNameEl.appendChild(nb); }
      selNameEl.style.opacity = '1';
    }, 150);
  }

  /* Price */
  var prWrap = document.getElementById('vc-prwrap-' + pidx);
  if (prWrap) prWrap.classList.add('cc-vpr-fade');
  setTimeout(function() {
    var newpEl = document.getElementById('vc-newp-' + pidx);
    var oldpEl = document.getElementById('vc-oldp-' + pidx);
    var saveEl = document.getElementById('vc-save-' + pidx);
    if (newpEl) newpEl.textContent = 'KES ' + (v.price || 0).toLocaleString();
    if (oldpEl) oldpEl.textContent = v.oldPrice ? 'KES ' + v.oldPrice.toLocaleString() : '';
    var pct = savingsPercent(v.price, v.oldPrice);
    if (saveEl) { if (pct > 0) { saveEl.textContent = 'SAVE ' + pct + '%'; saveEl.style.display = ''; } else { saveEl.style.display = 'none'; } }
    if (prWrap) prWrap.classList.remove('cc-vpr-fade');
  }, 180);

  /* Buy button */
  var buyBtn = document.getElementById('vc-buybtn-' + pidx);
  if (buyBtn) buyBtn.setAttribute('data-price', v.price);

  /* Reset hint */
  var hint = document.getElementById('selection-hint-' + pidx);
  if (hint) hint.textContent = '';
  if (selectedOptions[pidx]) { selectedOptions[pidx].size = null; selectedOptions[pidx].color = null; }
}

/* ── Legacy vcSwitch alias ── */
window.vcSwitch = function(cardIndex, vi) {
  var variants = null;
  var cats = Object.keys(products);
  for (var ci = 0; ci < cats.length; ci++) {
    var arr = products[cats[ci]];
    for (var pi = 0; pi < arr.length; pi++) {
      if (arr[pi]._cardIndex === cardIndex && arr[pi].productType === 'variant') { variants = arr[pi].variants; break; }
    }
    if (variants) break;
  }
  if (variants) vcSelectVariant(cardIndex, vi, variants);
};

// ============================================================
//  TOGGLE SUBMENU  (physical product categories)
// ============================================================
window.toggleSub = function(id) {
  document.querySelectorAll('.minor-menu').forEach(function(m) {
    var digitalIds = ['video-courses','ebooks-menu','crypto-menu','affiliate-menu','problem-menu','entertainment-menu'];
    if (m.id !== id && digitalIds.indexOf(m.id) === -1) {
      // FIX: visibility is driven by the "open" class (.minor-menu.open
      // uses display:block !important in CSS), so setting inline
      // style.display = 'none' alone never actually hid a panel that
      // still had .open on it — the !important class rule won every
      // time. That's why switching categories left the previous panel
      // (and its Back button) visibly expanded. Removing the class is
      // what actually closes it; the inline style is kept as a harmless
      // belt-and-suspenders for non-class-driven cases.
      m.classList.remove('open');
      m.style.display = 'none';
    }
  });
  var t = document.getElementById(id);
  if (!t) return;
  var isOpen = t.classList.contains('open');
if (isOpen) { t.classList.remove('open'); } else { t.classList.add('open'); }
  if (isOpen) {
    hideProducts();
  } else {
    setTimeout(function() { t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
  }
};
window.closeAllSubmenus = function() {
  var digitalIds = ['video-courses','ebooks-menu','crypto-menu','affiliate-menu','problem-menu','entertainment-menu'];
  document.querySelectorAll('.minor-menu').forEach(function(m) {
    if (digitalIds.indexOf(m.id) === -1) {
      m.classList.remove('open');
      m.style.display = 'none';
    }
  });
  hideProducts();
};

// ============================================================
//  showProducts — ROUTER: standard card OR variant card
// ============================================================
window.showProducts = function(category) {
  var container = document.getElementById('products-container');
  if (!container) return;
  container.innerHTML = '';
  Object.keys(selectedOptions).forEach(function(k) { delete selectedOptions[k]; });
  Object.keys(selectedVariants).forEach(function(k) { delete selectedVariants[k]; });

  var openMenu = null;
  document.querySelectorAll('.minor-menu').forEach(function(m) {
    // FIX: same root cause as toggleSub above — open panels are marked
    // via the "open" CSS class (display:block !important), not via
    // inline style.display. Checking inline style here meant this
    // never matched, so the grid container never got repositioned next
    // to the actually-open panel.
    if (m.classList.contains('open')) openMenu = m;
  });
  if (openMenu && openMenu.parentNode) {
    openMenu.parentNode.insertBefore(container, openMenu.nextSibling);
  }

  if (!products.hasOwnProperty(category)) {
    console.warn('[Cozycabin] showProducts(): "' + category + '" has no matching key in products.js — check for naming mismatch (e.g. singular vs plural) between index.html data-category and products.js.');
  }

  if (!products[category] || products[category].length === 0) {
    container.style.display = 'block';
    container.innerHTML =
      '<div class="empty-products">' +
        '<div style="font-size:48px;margin-bottom:16px;">🛍️</div>' +
        '<h2>Coming Soon!</h2>' +
        '<p>Products in this category are being stocked.<br>Check back soon or ask us on WhatsApp.</p>' +
        '<a href="https://wa.me/' + WHATSAPP_NUMBER + '" style="display:inline-block;margin-top:20px;background:#25d366;color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">📲 Ask on WhatsApp</a>' +
      '</div>';
    setTimeout(function() { container.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
    return;
  }

  products[category].forEach(function(product, index) {
    // Store card index on the product object so vcSwitch can find it
    product._cardIndex = index;
    selectedOptions[index] = { size: null, color: null };


    // ── ROUTING: variant card vs standard card ──
    var card;
    if (product.productType === 'variant') {
      card = renderVariantCard(product, index);
      if (!card) return;

    } else {
      // ── STANDARD CARD (unchanged) ──
      var pct = savingsPercent(product.price, product.oldPrice);

      var sizesHTML = '';
      (product.sizes || []).forEach(function(size) {
        sizesHTML += '<button class="size-btn" data-index="' + index + '" data-size="' + size + '">' + size + '</button>';
      });

      var colorsHTML = '';
      (product.colors || []).forEach(function(color) {
        if (color) colorsHTML += '<button class="color-btn" data-index="' + index + '" data-color="' + color + '">' + color + '</button>';
      });

      var savingsBadge = pct > 0
        ? '<span class="savings-badge">SAVE ' + pct + '%</span>'
        : '';

      var sizesSection = product.sizes && product.sizes.length > 0
        ? '<div class="sizes-box"><h4>Select Size</h4><div class="sizes-row" id="sizes-' + index + '">' + sizesHTML + '</div></div>'
        : '';

      var colorsSection = product.colors && product.colors.filter(Boolean).length > 0
        ? '<div class="colors-box"><h4>Select Colour</h4><div class="colors-row" id="colors-' + index + '">' + colorsHTML + '</div></div>'
        : '';

      var galleryHTML = buildGalleryHTML(product, index);
      var galId = 'gal-' + index;

      card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML =
        galleryHTML +
        '<h2 class="product-title">' + product.title + '</h2>' +
        '<p class="company-name">' + product.company + '</p>' +
        '<p class="product-description">' + product.description + '</p>' +
        '<div class="price-box">' +
          '<span class="new-price">KES ' + product.price.toLocaleString() + '</span>' +
          '<span class="old-price">KES ' + product.oldPrice.toLocaleString() + '</span>' +
          savingsBadge +
        '</div>' +
        sizesSection +
        colorsSection +
        '<p id="selection-hint-' + index + '" class="selection-hint"></p>' +
        '<button class="buy-btn" data-index="' + index +
          '" data-title="' + product.title.replace(/"/g, '&quot;') +
          '" data-price="' + product.price +
          '" data-product-id="' + (product.id || ccSlug(product.title)) + '">🛒 Order via WhatsApp</button>' +
        '<button class="cart-btn">🛍️ Add to Cart</button>' +
        '<details class="details-box"><summary>📋 More Details</summary><p style="margin-top:10px;">Premium quality product. Comfortable, durable and stylish. Nationwide delivery available via G4S, Simba Coach, Tahmeed and more.</p></details>';

      container.appendChild(card);

      // Set --gal-ratio CSS variable on viewport after DOM insert
      (function(pidx, ratio) {
        var galEl = document.getElementById('gal-' + pidx);
        if (galEl) {
          var vp = galEl.querySelector('.cc-viewport');
          if (vp) vp.style.setProperty('--gal-ratio', ratio);
        }
      }(index, product.ratio || '1/1'));

      attachSwipe(galId, index);
      return; // standard card already appended above
    }

    // Append variant card
    container.appendChild(card);
  });

  container.style.display = 'grid';
  setTimeout(function() { container.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);

  // ── TRACK PRODUCT VIEWS ──
  // Use IntersectionObserver so only actually-seen products count
  // Fires once per product per page session
  (function trackProductViews(cat) {
    if (!window.IntersectionObserver) return;
    var cards = container.querySelectorAll('.product-card');
    if (!cards.length) return;
    var viewedThisSession = window._ccViewedProducts || (window._ccViewedProducts = {});

    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var card    = entry.target;
        var title   = card.querySelector('.product-title, .product-name, .pc-name, h2, h3, .card-title');
        var pName   = (title ? title.textContent : card.getAttribute('data-title') || '').trim();
        var pId     = (cat + '_' + pName).replace(/\s+/g, '_').toLowerCase().substring(0, 80);

        if (!pName || viewedThisSession[pId]) return;
        viewedThisSession[pId] = true;
        obs.unobserve(card);

        // Write to Firestore product_views/{pId}
        try {
          Promise.all([
            import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
            import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js")
          ]).then(function(mods) {
            var _fbApps = mods[0].getApps();
            var _fbApp  = _fbApps.length ? _fbApps[0] : mods[0].initializeApp({
              apiKey:"AIzaSyDToZQ-f31ZA2RmPWNKZ4DTtVjyj-toMW0",
              authDomain:"cozycabin-affiliate.firebaseapp.com",
              projectId:"cozycabin-affiliate",
              storageBucket:"cozycabin-affiliate.firebasestorage.app",
              messagingSenderId:"765281276271",
              appId:"1:765281276271:web:1368fb340b1fb68a01189a"
            });
            var _db3 = mods[1].getFirestore(_fbApp);
            mods[1].setDoc(
              mods[1].doc(_db3, 'product_views', pId),
              {
                productId:    pId,
                productName:  pName,
                category:     cat,
                views:        mods[1].increment(1),
                lastViewedAt: mods[1].serverTimestamp(),
                topAffiliate: localStorage.getItem('referralCode') || ''
              },
              { merge: true }
            ).catch(function(){});
          }).catch(function(){});
        } catch(e) {}
      });
    }, { threshold: 0.3 });

    cards.forEach(function(c) { obs.observe(c); });
  })(category);
};

// ============================================================
//  UPDATE HINT
// ============================================================
function updateHint(index) {
  var hint = document.getElementById('selection-hint-' + index);
  if (!hint) return;
  var s = selectedOptions[index] && selectedOptions[index].size;
  var c = selectedOptions[index] && selectedOptions[index].color;
  if (s && c) {
    hint.textContent = '✅ Size ' + s + ' · ' + c + ' selected';
    hint.style.color = '#22c55e';
  } else if (s) {
    hint.textContent = '👉 Size ' + s + ' — now pick a colour';
    hint.style.color = '#f59e0b';
  } else if (c) {
    hint.textContent = '👉 ' + c + ' — now pick a size';
    hint.style.color = '#f59e0b';
  } else {
    hint.textContent = '';
  }
}

// ============================================================
// ============================================================
//  SINGLE DELEGATED CLICK HANDLER
// ============================================================
document.addEventListener('click', function(e) {
  var el = e.target;

  // grid-btn
  var gridBtn = el;
  while (gridBtn && gridBtn !== document) {
    if (gridBtn.classList && gridBtn.classList.contains('grid-btn')) break;
    gridBtn = gridBtn.parentNode;
  }
  if (gridBtn && gridBtn !== document) {
    var sub = gridBtn.getAttribute('data-submenu');
    if (sub) { e.preventDefault(); e.stopPropagation(); window.toggleSub(sub); return; }
  }

  // minor-btn
  var minorBtn = el;
  while (minorBtn && minorBtn !== document) {
    if (minorBtn.classList && minorBtn.classList.contains('minor-btn')) break;
    minorBtn = minorBtn.parentNode;
  }
  if (minorBtn && minorBtn !== document) {
    var cat = minorBtn.getAttribute('data-category');
    if (cat) { e.preventDefault(); e.stopPropagation(); window.showProducts(cat); return; }
  }

  // back-btn
  var backBtn = el;
  while (backBtn && backBtn !== document) {
    if (backBtn.classList && backBtn.classList.contains('back-btn')) break;
    backBtn = backBtn.parentNode;
  }
  if (backBtn && backBtn !== document) {
    if (!backBtn.getAttribute('onclick')) { e.preventDefault(); window.closeAllSubmenus(); }
    return;
  }

  // SIZE BTN
  if (el.classList.contains('size-btn')) {
    var idx2 = el.getAttribute('data-index');
    document.querySelectorAll('#sizes-' + idx2 + ' .size-btn')
      .forEach(function(b) { b.classList.remove('option-active'); });
    el.classList.add('option-active');
    if (!selectedOptions[idx2]) selectedOptions[idx2] = { size: null, color: null };
    selectedOptions[idx2].size = el.getAttribute('data-size');
    updateHint(idx2);
    return;
  }

  // COLOR BTN
  if (el.classList.contains('color-btn')) {
    var idx3 = el.getAttribute('data-index');
    document.querySelectorAll('#colors-' + idx3 + ' .color-btn')
      .forEach(function(b) { b.classList.remove('option-active'); });
    el.classList.add('option-active');
    if (!selectedOptions[idx3]) selectedOptions[idx3] = { size: null, color: null };
    selectedOptions[idx3].color = el.getAttribute('data-color');
    updateHint(idx3);
    return;
  }

  // BUY BTN — works for BOTH standard and variant cards
  if (el.classList.contains('buy-btn')) {
    var idx4    = el.getAttribute('data-index');
    var hint    = document.getElementById('selection-hint-' + idx4);
    var s2      = selectedOptions[idx4] ? selectedOptions[idx4].size  : null;
    var c2      = selectedOptions[idx4] ? selectedOptions[idx4].color : null;
    var isVC    = el.hasAttribute('data-variant-card');

    var card2     = el.closest('.product-card');
    var hasSizes  = card2 && card2.querySelector('.size-btn');
    var hasColors = card2 && card2.querySelector('.color-btn');

    if ((hasSizes && !s2) || (hasColors && !c2)) {
      if (hint) {
        hint.textContent = '⚠️ Please select ' +
          (hasSizes && !s2 ? 'size ' : '') +
          (hasSizes && !s2 && hasColors && !c2 ? 'and ' : '') +
          (hasColors && !c2 ? 'colour ' : '') + 'first';
        hint.style.color = '#ef4444';
      }
      return;
    }

    // For variant cards, include the selected variant name in the order
    var variantName = null;
    if (isVC) {
      var vcIdx = parseInt(el.getAttribute('data-variant-card'));
      var selnameEl = document.getElementById('vc-selname-text-' + vcIdx);
      if (selnameEl) {
        variantName = selnameEl.textContent;
      }
    }

    var ref = localStorage.getItem('referralCode');
    window._pendingOrder = {
      title:   el.getAttribute('data-title'),
      variant: variantName,           // null for standard cards — payment modal ignores null
      size:    s2 || 'N/A',
      color:   c2 || 'N/A',
      price:   parseInt(el.getAttribute('data-price')),
      ref:     ref,
      productId: el.getAttribute('data-product-id') || ''
    };

    window.openPaymentModal();
    return;
  }

  // Backdrop — smart payment modal
  var smartModal = document.getElementById('smart-payment-modal');
  if (smartModal && e.target === smartModal) { window.closePaymentModal(); }
});

// ============================================================
//  HERO BANNER — 19 slides, rotates every 2s
// ============================================================
(function() {
  function initHeroBanner() {
    var banner = document.getElementById('hero-banner');
    if (!banner) return;
    var slides = banner.querySelectorAll('.hero-slide');
    var dotsEl = document.getElementById('hero-dots');
    if (!slides.length || !dotsEl) return;
    var current = 0;
    var timer;
    slides.forEach(function(_, i) {
      var dot = document.createElement('button');
      dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Slide ' + (i + 1));
      dot.addEventListener('click', function(e) { e.stopPropagation(); goTo(i); resetTimer(); });
      dotsEl.appendChild(dot);
    });
    function goTo(n) {
      slides[current].classList.remove('active');
      slides[current].style.display = 'none';
      dotsEl.children[current].classList.remove('active');
      current = (n + slides.length) % slides.length;
      slides[current].classList.add('active');
      slides[current].style.display = 'flex';
      dotsEl.children[current].classList.add('active');
    }
    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(function() { goTo(current + 1); }, 2000);
    }
    slides.forEach(function(s, i) { s.style.display = i === 0 ? 'flex' : 'none'; });
    var startX = 0, startY = 0, swiped = false;
    banner.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX; startY = e.touches[0].clientY; swiped = false;
    }, { passive: true });
    banner.addEventListener('touchend', function(e) {
      var diffX = startX - e.changedTouches[0].clientX;
      var diffY = startY - e.changedTouches[0].clientY;
      if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
        swiped = true; goTo(diffX > 0 ? current + 1 : current - 1); resetTimer();
      }
    }, { passive: true });
    document.addEventListener('visibilitychange', function() { if (!document.hidden) { resetTimer(); } });
    resetTimer();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroBanner);
  } else { initHeroBanner(); }
})();

// ============================================================
//  PROMO BANNER
// ============================================================
(function() {
  function initPromoBanner() {
    var banner = document.getElementById('promo-banner');
    if (!banner) return;
    var slides = banner.querySelectorAll('.promo-slide');
    var dots   = banner.querySelectorAll('.promo-dot');
    if (!slides.length) return;
    var current = 0, timer;
    function showSlide(n) {
      slides[current].style.display = 'none'; slides[current].classList.remove('active');
      if (dots[current]) { dots[current].style.width='8px'; dots[current].style.background='#333'; dots[current].style.borderRadius='50%'; }
      current = (n + slides.length) % slides.length;
      slides[current].style.display = 'flex'; slides[current].classList.add('active');
      if (dots[current]) { dots[current].style.width='24px'; dots[current].style.background='#ffd700'; dots[current].style.borderRadius='4px'; }
    }
    function resetTimer() { clearInterval(timer); timer = setInterval(function() { showSlide(current + 1); }, 2000); }
    slides.forEach(function(s, i) { s.style.display = i===0?'flex':'none'; if(i===0) s.classList.add('active'); });
    if (dots[0]) { dots[0].style.width='24px'; dots[0].style.background='#ffd700'; dots[0].style.borderRadius='4px'; }
    document.addEventListener('visibilitychange', function() { if (!document.hidden) { resetTimer(); } });
    resetTimer();
    var startX = 0;
    banner.addEventListener('touchstart', function(e) { startX = e.touches[0].clientX; }, { passive: true });
    banner.addEventListener('touchend', function(e) {
      var diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { showSlide(diff > 0 ? current + 1 : current - 1); resetTimer(); }
    }, { passive: true });
    banner.addEventListener('click', function(e) {
      if (e.target.classList.contains('promo-dot')) return;
      var slide = slides[current];
      var label = slide.getAttribute('data-label') || 'COZYCABIN';
      var title = slide.getAttribute('data-title') || 'Shop with Cozycabin';
      var modalLabel = document.getElementById('promo-modal-label');
      var modalTitle = document.getElementById('promo-modal-title');
      if (modalLabel) modalLabel.textContent = label;
      if (modalTitle) modalTitle.textContent = title;
      var waMsg     = encodeURIComponent('👋 Hello Cozycabin!\n\nI saw your banner: "' + title + '"\n\nI would like to know more. Please assist. 🙏');
      var waConfirm = encodeURIComponent('👋 Hello Cozycabin!\n\nI have made payment for: "' + title + '"\n\nPlease confirm my order. 🛒');
      var inquireEl = document.getElementById('promo-wa-inquire');
      var confirmEl = document.getElementById('promo-wa-confirm');
      if (inquireEl) inquireEl.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + waMsg;
      if (confirmEl) confirmEl.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + waConfirm;
      var modal = document.getElementById('promo-action-modal');
      if (modal) { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; promoBackToStep1(); }
    });
    var closeBtn = document.getElementById('promo-modal-close');
    if (closeBtn) { closeBtn.addEventListener('click', function() { document.getElementById('promo-action-modal').style.display='none'; document.body.style.overflow=''; }); }
    var modal = document.getElementById('promo-action-modal');
    if (modal) { modal.addEventListener('click', function(e) { if(e.target===this){this.style.display='none'; document.body.style.overflow='';} }); }
    var inquireBtn = document.getElementById('promo-btn-inquire');
    if (inquireBtn) { inquireBtn.addEventListener('click', function() { document.getElementById('promo-step-1').style.display='none'; document.getElementById('promo-step-inquire').style.display='block'; document.getElementById('promo-step-pay').style.display='none'; }); }
    var payBtn = document.getElementById('promo-btn-pay');
    if (payBtn) { payBtn.addEventListener('click', function() { document.getElementById('promo-step-1').style.display='none'; document.getElementById('promo-step-inquire').style.display='none'; document.getElementById('promo-step-pay').style.display='block'; }); }
    document.querySelectorAll('.promo-back').forEach(function(btn) { btn.addEventListener('click', promoBackToStep1); });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPromoBanner);
  } else { initPromoBanner(); }
})();

// ============================================================
//  SMART PAYMENT MODAL
//  Now shows variant design name when present
// ============================================================
window.openPaymentModal = function() {
  var modal = document.getElementById('smart-payment-modal');
  if (!modal) return;
  var order = window._pendingOrder || {};

  // ── TRACK WHATSAPP CLICK ──
  // Log every time a customer taps Order (opens payment modal)
  (function trackWaClick() {
    try {
      Promise.all([
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js")
      ]).then(function(modules) {
        var _getApps = modules[0].getApps; var _initApp = modules[0].initializeApp;
        var _db2 = modules[1].getFirestore(
          _getApps().length ? _getApps()[0] : _initApp({
            apiKey:"AIzaSyDToZQ-f31ZA2RmPWNKZ4DTtVjyj-toMW0",
            authDomain:"cozycabin-affiliate.firebaseapp.com",
            projectId:"cozycabin-affiliate",
            storageBucket:"cozycabin-affiliate.firebasestorage.app",
            messagingSenderId:"765281276271",
            appId:"1:765281276271:web:1368fb340b1fb68a01189a"
          })
        );
        modules[1].addDoc(modules[1].collection(_db2, 'wa_clicks'), {
          productName:  order.title   || '',
          ref:          order.ref     || '',
          price:        order.price   || 0,
          device:       /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
          timestamp:    modules[1].serverTimestamp()
        }).catch(function(){});
      }).catch(function(){});
    } catch(e) {}
  })();
  var sumEl = document.getElementById('order-summary');
  if (sumEl && order.title) {
    sumEl.innerHTML =
      '<div style="background:#0a1128;border:1px solid rgba(255,215,0,0.2);border-radius:12px;padding:14px;margin-bottom:16px;">' +
        '<div style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Order Summary</div>' +
        '<div style="font-weight:700;color:#fff;margin-bottom:4px;">' + order.title + '</div>' +
        (order.variant ? '<div style="font-size:13px;color:#ffd700;">Variant: ' + order.variant + '</div>' : '') +
        (order.size && order.size !== 'N/A' ? '<div style="font-size:13px;color:#94a3b8;">Size: ' + order.size + '</div>' : '') +
        (order.color && order.color !== 'N/A' ? '<div style="font-size:13px;color:#94a3b8;">Colour: ' + order.color + '</div>' : '') +
        '<div style="font-size:20px;font-weight:800;color:#ffd700;margin-top:8px;">KES ' + (order.price || 0).toLocaleString() + '</div>' +
        (order.ref ? '<div style="font-size:11px;color:#64748b;margin-top:4px;">Ref: ' + order.ref + '</div>' : '') +
      '</div>';
  }
  // Build permanent share URL using ?id= (never breaks when you reorder products)
  var _shareId  = order.productId || '';
  var _shareURL = _shareId
    ? window.location.origin + window.location.pathname + '?id=' + _shareId
    : window.location.origin + window.location.pathname;
  // Update browser URL bar so native share picks up the correct link
  try { window.history.replaceState(null, '', '?id=' + _shareId); } catch(e) {}

  var waOrder = encodeURIComponent(
    '🛒 *COZYCABIN ORDER*\n\n' +
    'Product: ' + (order.title || '') + '\n' +
    (order.variant ? 'Variant: ' + order.variant + '\n' : '') +
    (order.size && order.size !== 'N/A' ? 'Size: ' + order.size + '\n' : '') +
    (order.color && order.color !== 'N/A' ? 'Colour: ' + order.color + '\n' : '') +
    'Price: KES ' + (order.price || 0).toLocaleString() + '\n' +
    (order.ref ? 'Ref: ' + order.ref + '\n' : '') +
    '\n🔗 ' + _shareURL + '\n' +
    '\nPlease confirm delivery details. 🙏'
  );
  var waOrderEl = document.getElementById('wa-order-link');
  if (waOrderEl) waOrderEl.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + waOrder;
  modal.style.display = 'flex';
  // ── Record affiliate pending order to Firestore (modular v10) ──
  if (order.ref) {
    try {
      // Dynamically import so products.js stays non-module compatible
      Promise.all([
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js")
      ]).then(function(modules) {
        var _getApps       = modules[0].getApps;
        var _initializeApp = modules[0].initializeApp;
        var _getFirestore  = modules[1].getFirestore;
        var _addDoc        = modules[1].addDoc;
        var _collection    = modules[1].collection;
        var _serverTs      = modules[1].serverTimestamp;
        var _doc           = modules[1].doc;
        var _setDoc        = modules[1].setDoc;
        var _increment     = modules[1].increment;

        var _fbCfg = {
          apiKey:            "AIzaSyDToZQ-f31ZA2RmPWNKZ4DTtVjyj-toMW0",
          authDomain:        "cozycabin-affiliate.firebaseapp.com",
          projectId:         "cozycabin-affiliate",
          storageBucket:     "cozycabin-affiliate.firebasestorage.app",
          messagingSenderId: "765281276271",
          appId:             "1:765281276271:web:1368fb340b1fb68a01189a"
        };
        var _app = _getApps().length ? _getApps()[0] : _initializeApp(_fbCfg);
        var _db  = _getFirestore(_app);

        // 1. Log pending order to affiliateOrders collection
        _addDoc(_collection(_db, 'affiliateOrders'), {
          ref:       order.ref,
          title:     order.title    || '',
          variant:   order.variant  || null,
          size:      order.size     || null,
          color:     order.color    || null,
          price:     order.price    || 0,
          status:    'pending',
          timestamp: _serverTs()
        }).catch(function(err) {
          console.warn('[Cozycabin] affiliateOrders write (non-critical):', err.message);
        });

        // 2. Increment click count on affiliate_clicks/{code}
        //    Deduplication: only write once per ref per 5-second window
        var _now = Date.now();
        var _ccLastClick = window._ccLastClickTs || {};
        if (_ccLastClick[order.ref] && (_now - _ccLastClick[order.ref]) < 5000) {
          // Duplicate tap within 5s — skip increment
        } else {
          _ccLastClick[order.ref] = _now;
          window._ccLastClickTs = _ccLastClick;
          var _clickRef = _doc(_db, 'affiliate_clicks', order.ref);
        _setDoc(_clickRef, {
          referralCode: order.ref,
          clicks:       _increment(1),
          lastClickAt:  _serverTs(),
          lastPage:     window.location.pathname || '/'
        }, { merge: true }).catch(function(e) {
          console.warn('[Cozycabin] click increment (non-critical):', e.message);
        });
        } // end deduplication guard

      }).catch(function(err) {
        console.warn('[Cozycabin] Firebase import (non-critical):', err.message);
      });
    } catch(e) {
      // Never break the shop for a tracking failure
    }
  }
  document.body.style.overflow = 'hidden';
  window.backToStep1();
};

window.closePaymentModal = function() {
  var modal = document.getElementById('smart-payment-modal');
  if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
};

window.chooseProductType = function(type) {
  ['payment-step-1','payment-step-kenya','payment-step-international','payment-step-digital']
    .forEach(function(id) { var el = document.getElementById(id); if (el) el.style.display = 'none'; });
  var map = { 'local-kenya': 'payment-step-kenya', 'international': 'payment-step-international', 'digital': 'payment-step-digital' };
  var target = map[type];
  if (target) { var el = document.getElementById(target); if (el) el.style.display = 'block'; }
};

window.backToStep1 = function() {
  ['payment-step-kenya','payment-step-international','payment-step-digital']
    .forEach(function(id) { var el = document.getElementById(id); if (el) el.style.display = 'none'; });
  var s1 = document.getElementById('payment-step-1');
  if (s1) s1.style.display = 'block';
};

// ============================================================
//  DIGITAL GRID TOGGLE
// ============================================================
window.toggleDigital = function(id) {
  var allDigital = ['video-courses','ebooks-menu','crypto-menu','affiliate-menu','problem-menu','entertainment-menu'];
  allDigital.forEach(function(mid) { var el = document.getElementById(mid); if (el && mid !== id) el.style.display = 'none'; });
  var target = document.getElementById(id);
  if (!target) return;
  var isOpen = target.style.display === 'block';
  target.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) setTimeout(function() { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50);
};

window.closeAllDigital = function() {
  ['video-courses','ebooks-menu','crypto-menu','affiliate-menu','problem-menu','entertainment-menu']
    .forEach(function(id) { var el = document.getElementById(id); if (el) el.style.display = 'none'; });
};

// ============================================================
//  HELPERS (global)
// ============================================================
function promoBackToStep1() {
  var s1 = document.getElementById('promo-step-1');
  var si = document.getElementById('promo-step-inquire');
  var sp = document.getElementById('promo-step-pay');
  if (s1) s1.style.display = 'block';
  if (si) si.style.display = 'none';
  if (sp) sp.style.display = 'none';
}

function cozyyCopy(text, btnId) {
  var btn = document.getElementById(btnId);
  if (!navigator.clipboard) {
    var ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    if (btn) { btn.textContent = '✅ Copied!'; btn.style.background = '#166534'; }
    setTimeout(function() { if (btn) { btn.textContent = 'Copy'; btn.style.background = ''; } }, 2500);
    return;
  }
  navigator.clipboard.writeText(text).then(function() {
    if (btn) { btn.textContent = '✅ Copied!'; btn.style.background = '#166534'; }
    setTimeout(function() { if (btn) { btn.textContent = 'Copy'; btn.style.background = ''; } }, 2500);
  }).catch(function() {
    if (btn) { btn.textContent = '❌ Failed'; }
    setTimeout(function() { if (btn) btn.textContent = 'Copy'; }, 2000);
  });
}

/* ============================================================
   COZYCABIN — ccGoTo PIXEL FIX
   Paste at the VERY BOTTOM of products.js

   Problem: translateX(-N * 100%) uses % of the TRACK width
   (all slides combined), not the viewport — so images shift wrong.
   Fix: use actual pixel width of the viewport instead.
   ============================================================ */

(function () {
  // Save the original ccGoTo built earlier in products.js
  var _prev = window.ccGoTo;

  window.ccGoTo = function (galId, si, pidx) {
    var gal      = document.getElementById(galId);
    var track    = document.getElementById('cc-track-' + galId);
    var counter  = document.getElementById('cc-counter-' + galId);
    if (!gal || !track) return;

    var total   = parseInt(gal.getAttribute('data-total'));
    var current = parseInt(gal.getAttribute('data-current'));

    // Pause video when leaving slide 0
    if (current === 0 && si !== 0) {
      var v = document.getElementById('ccvid-' + pidx);
      if (v && !v.paused) {
        v.pause();
        var ov = document.getElementById('cc-play-' + pidx);
        if (ov) { ov.style.opacity = '1'; ov.style.pointerEvents = 'auto'; }
      }
      if (window._vidTimer && window._vidTimer[pidx]) {
        clearTimeout(window._vidTimer[pidx]);
      }
    }

    gal.setAttribute('data-current', si);

    // ── THE KEY FIX ──
    // Use the viewport's real pixel width, not a percentage
    var viewport   = gal.querySelector('.cc-viewport');
    var slideWidth = viewport ? viewport.offsetWidth : gal.offsetWidth;
    track.style.transform = 'translateX(-' + (si * slideWidth) + 'px)';

    // Update counter
    if (counter) counter.textContent = (si + 1) + ' / ' + total;

    // Update dots
    gal.querySelectorAll('.cc-dot').forEach(function (d, i) {
      d.classList.toggle('cc-dot-active', i === si);
    });

    // Update thumbnails
    gal.querySelectorAll('.cc-thumb').forEach(function (th) {
      th.classList.toggle('cc-th-active', parseInt(th.getAttribute('data-si')) === si);
    });

    // Re-autoplay when returning to video slide 0
    if (si === 0) {
      var vid  = document.getElementById('ccvid-' + pidx);
      var ovl  = document.getElementById('cc-play-' + pidx);
      var prog = document.getElementById('cc-prog-' + pidx);
      if (prog) { prog.style.transition = 'none'; prog.style.width = '0%'; }
      if (vid) {
        vid.currentTime = 0;
        vid.play().then(function () {
          if (ovl) { ovl.style.opacity = '0'; ovl.style.pointerEvents = 'none'; }
          if (prog) {
            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                prog.style.transition = 'width 20s linear';
                prog.style.width = '100%';
              });
            });
          }
          if (parseInt(gal.getAttribute('data-total')) > 1) {
            if (!window._vidTimer) window._vidTimer = {};
            window._vidTimer[pidx] = setTimeout(function () {
              if (parseInt(gal.getAttribute('data-current')) === 0) {
                window.ccGoTo(galId, 1, pidx);
                if (vid) vid.pause();
              }
            }, 20000);
          }
        }).catch(function () {
          if (ovl) { ovl.style.opacity = '1'; ovl.style.pointerEvents = 'auto'; }
        });
      }
    }
  };

  // Fix slide position on screen rotate / resize
  window.addEventListener('resize', function () {
    document.querySelectorAll('.cc-gallery').forEach(function (gal) {
      var current = parseInt(gal.getAttribute('data-current') || '0');
      if (current === 0) return; // slide 0 is always at 0px, skip
      var track    = document.getElementById('cc-track-' + gal.id);
      var viewport = gal.querySelector('.cc-viewport');
      if (!track || !viewport) return;
      track.style.transition = 'none';
      track.style.transform  = 'translateX(-' + (current * viewport.offsetWidth) + 'px)';
      requestAnimationFrame(function () {
        track.style.transition = 'transform 0.35s ease';
      });
    });
  });
})();
// ============================================================
//  FEATURE 1 — renderVariantCard, vcSelectVariant, variant CSS
//  are defined above (unified V2 implementation).
// ============================================================

// ============================================================
//  FEATURE 2 — SIMILAR PRODUCTS
//  ──────────────────────────────────────────────────────────
//  Displayed below each product card (standard or variant).
//  Shows 4–8 products from same category, falls back to
//  related categories if not enough products exist.
// ============================================================


/* ── Related-category map (extend as new categories are added) ── */
var CC_RELATED = {
  hotpots:         ['flasks','bottles','cutlery','dispenser'],
  flasks:          ['hotpots','bottles','dispenser','cutlery'],
  bottles:         ['flasks','hotpots','dispenser','cutlery'],
  cutlery:         ['hotpots','flasks','dispenser','racks'],
  dispenser:       ['bottles','flasks','cutlery','hotpots'],
  fryers:          ['cookers','heaters','microwaves','irons'],
  racks:           ['cutlery','fryers','dispenser','hotpots','cookers'],
  cookers:         ['blenders','kettles','microwaves','racks'],
  blenders:        ['cookers','kettles','microwaves','cutlery'],
  kettles:         ['cookers','blenders','microwaves','hotpots'],
  microwaves:      ['cookers','kettles','fyers','blenders','fridges'],
  fridges:         ['microwaves','cookers','kettles','irons'],
  washingmachines: ['irons','heaters','fansapp','microwaves'],
  irons:           ['washingmachines','fryers','heaters','fansapp','kettles'],
  heaters:         ['irons','fans','fansapp','washingmachines'],
  fansapp:         ['heaters','fans','irons','washingmachines'],
  fans:            ['fansapp','heaters','solarlights','chargers'],
  shoes:           ['travel'],
  travel:          ['shoes'],
  solarfans:       ['solarlights','batteries','floodlights'],
  solarlights:     ['panels','inverters','batteries','chargers','floodlights','solarfans','streetlights'],
  panels:          ['solarlights','inverters','batteries','chargers'],
  inverters:       ['panels','batteries','chargers','solarlights'],
  batteries:       ['inverters','panels','chargers','solarlights'],
  chargers:        ['powerbanks','flashdisks','batteries','solarlights'],
  floodlights:     ['solarlights','streetlights','panels'],
  streetlights:    ['floodlights','solarlights','panels'],
  speakers:        ['earbuds','radios','tvbox','gaming'],
  earbuds:         ['speakers','radios','smartwatch','gaming'],
  radios:          ['speakers','earbuds','tvbox'],
  tvbox:           ['speakers','radios','gaming'],
  smartwatch:      ['earbuds','powerbanks','phones','gaming'],
  gaming:          ['speakers','earbuds','tvbox','smartwatch'],
  phones:          ['tablets','laptops','chargers','powerbanks'],
  tablets:         ['phones','laptops','keyboards','storage'],
  laptops:         ['tablets','phones','keyboards','mouse','storage'],
  keyboards:       ['laptops','mouse','tablets'],
  mouse:           ['keyboards','laptops'],
  printers:        ['laptops','storage','keyboards'],
  storage:         ['flashdisks','laptops','phones'],
  flashdisks:      ['storage','powerbanks','chargers'],
  powerbanks:      ['chargers','flashdisks','phones'],
  cameras:         ['alarms','trackers','recorders','locks'],
  alarms:          ['cameras','sensors','locks','doorbells'],
  locks:           ['alarms','cameras','doorbells','safes'],
  doorbells:       ['locks','alarms','cameras'],
  trackers:        ['cameras','sensors','safes'],
  sensors:         ['alarms','cameras','trackers'],
  safes:           ['locks','cameras','alarms'],
  recorders:       ['cameras','alarms','sensors'],
  wallart:         ['mirrors','flowers','lamps','frames','vases'],
  mirrors:         ['wallart','lamps','frames','flowers'],
  flowers:         ['wallart','vases','mirrors','lamps'],
  lamps:           ['wallart','mirrors','flowers','curtains'],
  carpets:         ['curtains','wallart','lamps','duvets'],
  curtains:        ['carpets','lamps','wallart','duvets'],
  frames:          ['wallart','mirrors','vases'],
  vases:           ['flowers','wallart','frames'],
  duvets:          ['bedsheets','blankets','pillows','mattress'],
  bedsheets:       ['duvets','pillows','covers','blankets'],
  blankets:        ['duvets','bedsheets','pillows','mattress'],
  pillows:         ['duvets','bedsheets','blankets','covers'],
  mattress:        ['duvets','blankets','pillows','bedsheets'],
  covers:          ['bedsheets','pillows','duvets','nets'],
  nets:            ['covers','bedsheets','duvets'],
  towels:          ['bedsheets','duvets','covers']
};

/* ── CSS for similar products strip (injected once) ── */
(function injectSimilarCSS() {
  if (document.getElementById('cc-similar-style')) return;
  var s = document.createElement('style');
  s.id = 'cc-similar-style';
  s.textContent = [
    '.cc-similar-wrap{margin-top:22px;padding-top:16px;border-top:1px solid rgba(255,215,0,0.12);}',
    '.cc-similar-heading{',
    '  font-size:11px;font-weight:800;color:#ffd700;',
    '  text-transform:uppercase;letter-spacing:0.12em;',
    '  margin-bottom:12px;',
    '}',
    '.cc-similar-row{',
    '  display:flex;gap:10px;overflow-x:auto;',
    '  padding-bottom:6px;scrollbar-width:none;',
    '}',
    '.cc-similar-row::-webkit-scrollbar{display:none;}',
    '.cc-similar-item{',
    '  flex:0 0 110px;cursor:pointer;',
    '  border-radius:10px;overflow:hidden;',
    '  background:rgba(10,17,40,0.7);',
    '  border:1px solid rgba(255,215,0,0.15);',
    '  transition:border-color .18s,transform .18s;',
    '}',
    '.cc-similar-item:hover{border-color:rgba(255,215,0,0.5);transform:translateY(-2px);}',
    '.cc-similar-item:active{transform:scale(0.97);}',
    '.cc-sim-img{width:100%;height:90px;object-fit:cover;display:block;}',
    '.cc-sim-info{padding:6px 7px 8px;}',
    '.cc-sim-title{',
    '  font-size:10px;font-weight:700;color:#e2e8f0;',
    '  line-height:1.3;margin-bottom:3px;',
    '  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;',
    '}',
    '.cc-sim-price{font-size:11px;font-weight:800;color:#ffd700;}'
  ].join('');
  document.head.appendChild(s);
})();
/* ── Collect candidates for similar products ── */
function ccGetSimilar(currentCategory, currentIndex) {
  var results = [];
  var seen    = {};

  /* 1. Same category first */
  var sameCat = (products[currentCategory] || []);
  sameCat.forEach(function(p, i) {
    if (i === currentIndex) return; // exclude self
    if (!seen[currentCategory + '-' + i]) {
      seen[currentCategory + '-' + i] = true;
      results.push({ product: p, category: currentCategory, catIndex: i });
    }
  });

  /* 2. Fill from related categories if < 4 */
  if (results.length < 4) {
    var related = CC_RELATED[currentCategory] || [];
    for (var ri = 0; ri < related.length && results.length < 8; ri++) {
      var relCat = related[ri];
      var relArr = products[relCat] || [];
      for (var rj = 0; rj < relArr.length && results.length < 8; rj++) {
        var key = relCat + '-' + rj;
        if (!seen[key]) {
          seen[key] = true;
          results.push({ product: relArr[rj], category: relCat, catIndex: rj });
        }
      }
    }
  }

  /* 3. Cap at 8 */
  return results.slice(0, 8);
}

/* ── Build and inject the similar products strip ── */
function ccBuildSimilar(containerId, currentCategory, currentIndex) {
  var wrap = document.getElementById(containerId);
  if (!wrap) return;

  // FIX: clear any previously-rendered strip before rebuilding.
  // Without this, revisiting a category (e.g. via Back then reopening,
  // or switching between categories) appended a brand-new heading+row
  // on top of the old ones every time, since this function is called
  // on every showProducts() pass and was purely additive.
  wrap.innerHTML = '';

  var candidates = ccGetSimilar(currentCategory, currentIndex);
  if (!candidates.length) { wrap.style.display = 'none'; return; }

  var heading = document.createElement('div');
  heading.className = 'cc-similar-heading';
  heading.textContent = '🛍 Similar Products';
  wrap.appendChild(heading);

  var row = document.createElement('div');
  row.className = 'cc-similar-row';

  candidates.forEach(function(c) {
    var p   = c.product;
    var img = (p.images && p.images[0]) ||
          (p.variants && p.variants[0] && (
            (p.variants[0].images && p.variants[0].images[0]) ||
            p.variants[0].image
          )) || '';
    var price = p.price || (p.variants && p.variants[0] && p.variants[0].price) || 0;

    var item = document.createElement('div');
    item.className = 'cc-similar-item';
    item.innerHTML =
       '<img class="cc-sim-img" src="' + img + '" loading="eager" onerror="this.style.background=\'#1a2340\';this.removeAttribute(\'src\')" alt="' + (p.title || '') + '">' +
      '<div class="cc-sim-info">' +
        '<div class="cc-sim-title">' + (p.title || '') + '</div>' +
        '<div class="cc-sim-price">KES ' + price.toLocaleString() + '</div>' +
      '</div>';

    /* Click → open that product's category panel and scroll to the item */
    item.addEventListener('click', function() {
      window.showProducts(c.category);
      /* After rendering, scroll to the specific card */
      setTimeout(function() {
        var container = document.getElementById('products-container');
        if (container) {
          var cards = container.querySelectorAll('.product-card');
          if (cards[c.catIndex]) {
            cards[c.catIndex].scrollIntoView({ behavior: 'smooth', block: 'start' });
            /* Brief highlight pulse */
            cards[c.catIndex].style.transition = 'box-shadow .3s';
            cards[c.catIndex].style.boxShadow  = '0 0 0 2px #ffd700';
            setTimeout(function() { cards[c.catIndex].style.boxShadow = ''; }, 1200);
          }
        }
      }, 400);
    });

    row.appendChild(item);
  });

  wrap.appendChild(row);
}

// ============================================================
//  PATCH showProducts — inject Similar Products strip only
//  Variant cards are rendered directly inside showProducts.
// ============================================================
(function patchShowProducts() {
  var _orig = window.showProducts;
  if (typeof _orig !== 'function') {
    console.error('[Cozycabin] patchShowProducts: window.showProducts not defined — skipping patch.');
    return;
  }
  window.showProducts = function(category) {
    _orig(category);
    var container = document.getElementById('products-container');
    if (!container) return;
    var catProducts = products[category];
    if (!catProducts || !catProducts.length) return;
    var allCards = container.querySelectorAll('.product-card');
    catProducts.forEach(function(product, index) {
      var targetCard = allCards[index];
      if (!targetCard) return;
      if (!targetCard.querySelector('.cc-similar-wrap')) {
        var simWrap = document.createElement('div');
        simWrap.className = 'cc-similar-wrap';
        simWrap.id = 'cc-sim-' + category + '-' + index;
        targetCard.appendChild(simWrap);
      }
      ccBuildSimilar('cc-sim-' + category + '-' + index, category, index);
    });
  };
})();
window.cozyyCopy = cozyyCopy;
window.copyText  = cozyyCopy;


// ============================================================
//  END OF UPGRADE — products-upgrade.js
// ============================================================

// ============================================================
//  STARTUP CATEGORY AUDIT
//  Scans every minor-btn[data-category] in the DOM and confirms
//  it has a matching key in products.js. Logs one warning per
//  mismatch so naming bugs (phone vs phones, etc) are caught
//  immediately on page load instead of silently failing on click.
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  var seen = {};
  var mismatches = [];
  document.querySelectorAll('[data-category]').forEach(function(btn) {
    var cat = btn.getAttribute('data-category');
    if (!cat || seen[cat]) return;
    seen[cat] = true;
    if (!products.hasOwnProperty(cat)) {
      mismatches.push(cat);
    }
  });
  if (mismatches.length) {
    console.warn(
      '[Cozycabin] Category audit found ' + mismatches.length +
      ' button(s) with no matching products.js key: ' + mismatches.join(', ') +
      '\nThese will show "Coming Soon" — add the key to products.js or fix the data-category spelling.'
    );
  } else {
    console.log('[Cozycabin] Category audit passed — every data-category button has a matching products.js key.');
  }
});











