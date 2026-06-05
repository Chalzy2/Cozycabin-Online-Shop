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
        "Images/timber-navy.webp","Images/timber-black (1).webp","Images/Blackwhite-timberland (1).webp","Images/timber-greywhite.webp","Images/timber-tan.webp","Images/Warmhseslipink.webp"
      ]
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
      }
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
        image: "Images/Spoonsetsil-2.webp"
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

  // ── Placeholders — add products + video fields later ──
  dispenser:[], hotpots:[], racks:[], flasks:[], bottles:[], cookers:[], blenders:[],
  solarlights:[], panels:[], inverters:[], batteries:[], streetlights:[], floodlights:[], chargers:[], fans:[],
  fridges:[], microwaves:[], washing:[], cookersapp:[], kettles:[], irons:[], heaters:[], fansapp:[],
  wallart:[], mirrors:[], flowers:[], lamps:[], carpets:[], curtains:[], frames:[], vases:[],
  duvets:[], bedsheets:[], blankets:[], pillows:[], mattress:[], covers:[], nets:[], towels:[],
  cameras:[], alarms:[], locks:[], doorbells:[], trackers:[], sensors:[], safes:[], recorders:[],
  speakers:[], radios:[], earbuds:[], tvbox:[], powerbanks:[], flashdisks:[], smartwatch:[], gaming:[],
  phones:[], laptops:[], tablets:[], routers:[], keyboards:[], mouse:[], printers:[], storage:[]
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
        '<div class="cc-slide" style="flex:0 0 100%;min-width:100%;width:100%;height:100%;position:relative;overflow:hidden;box-sizing:border-box;">' +
          '<video class="cc-video" id="ccvid-' + index + '" src="' + slide.src + '" ' +
                 'muted autoplay playsinline preload="auto" ' +
                 'oncanplay="ccOnCanPlay(' + index + ')" ' +
                 'onerror="ccOnVideoError(' + index + ')" ' +
                 'style="width:100%;height:100%;object-fit:cover;display:block;"></video>' +
          '<div class="cc-vid-progress" id="cc-prog-' + index + '"></div>' +
          '<div class="cc-play-overlay" id="cc-play-' + index + '" onclick="ccToggleVideo(' + index + ')" style="opacity:0;pointer-events:none;">' +
            '<div class="cc-play-btn"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:#000;margin-left:3px;"><polygon points="5,3 19,12 5,21"/></svg></div>' +
          '</div>' +
          '<span class="cc-vid-badge" id="cc-badge-' + index + '">⏳ Loading</span>' +
        '</div>';
    } else {
      trackHTML +=
        '<div class="cc-slide" style="flex:0 0 100%;min-width:100%;width:100%;height:100%;box-sizing:border-box;">' +
          '<img src="' + slide.src + '" loading="lazy" ' +
               'style="width:100%;height:100%;object-fit:cover;display:block;">' +
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
          '<img src="' + slide.src + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;">' +
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

      '<div class="cc-viewport" style="position:relative;width:100%;overflow:hidden;border-radius:14px;aspect-ratio:' +
      (product.ratio === '3/4' ? '3/4' : '1/1') + ';height:auto;box-sizing:border-box;">' +

        '<div class="cc-track" id="cc-track-' + galleryId + '" style="display:flex;flex-direction:row;flex-wrap:nowrap;width:100%;height:100%;position:absolute;top:0;left:0;right:0;bottom:0;transition:transform 0.35s ease;will-change:transform;">' +
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
    '.cc-gallery{width:100%;border-radius:12px;overflow:hidden;margin-bottom:10px;background:#000;}',
    '.cc-viewport{position:relative;width:100%;aspect-ratio:var(--gal-ratio,1/1);overflow:hidden;background:#0a0f1e;}',
    '.cc-track{display:flex;width:100%;height:100%;transition:transform 0.32s cubic-bezier(.4,0,.2,1);}',
    '.cc-slide{flex:0 0 100%;width:100%;height:100%;position:relative;overflow:hidden;}',
    '.cc-slide img,.cc-slide video{width:100%;height:100%;object-fit:cover;display:block;}',
    '.cc-vid-progress{position:absolute;bottom:0;left:0;height:3px;background:#ffd700;width:0%;z-index:5;border-radius:0 2px 2px 0;}',
    '.cc-play-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.28);cursor:pointer;transition:opacity 0.2s;z-index:4;}',
    '.cc-play-btn{width:54px;height:54px;background:#ffd700;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(255,215,0,0.5);}',
    '.cc-vid-badge{position:absolute;top:8px;left:8px;background:#ffd700;color:#000;font-size:9px;font-weight:800;letter-spacing:0.1em;padding:3px 8px;border-radius:5px;text-transform:uppercase;pointer-events:none;z-index:5;}',
    '.cc-counter{position:absolute;top:8px;right:8px;background:rgba(0,0,0,0.6);color:#fff;font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px;letter-spacing:0.04em;pointer-events:none;z-index:5;}',
    '.cc-dots{position:absolute;bottom:10px;left:0;right:0;display:flex;justify-content:center;gap:5px;pointer-events:none;z-index:5;}',
    '.cc-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.35);transition:background .2s,width .2s;}',
    '.cc-dot-active{background:#ffd700;width:16px;border-radius:3px;}',
    '.cc-thumbrow{display:flex;gap:7px;padding:8px 10px;overflow-x:auto;background:rgba(0,0,0,0.25);scrollbar-width:none;}',
    '.cc-thumbrow::-webkit-scrollbar{display:none;}',
    '.cc-thumb{flex:0 0 56px;height:56px;border-radius:8px;overflow:hidden;border:2px solid transparent;cursor:pointer;transition:border-color .15s;position:relative;}',
    '.cc-th-active{border-color:#ffd700!important;}',
    '.cc-thumb img,.cc-thumb video{width:100%;height:100%;object-fit:cover;display:block;}'
  ].join('');
  document.head.appendChild(s);
})();

// ============================================================
//  VARIANT CARD CSS — injected once into <head>
//  Completely separate from gallery CSS — no overlap
// ============================================================
(function injectVariantCSS() {
  if (document.getElementById('cc-variant-style')) return;
  var s = document.createElement('style');
  s.id = 'cc-variant-style';
  s.textContent = [
    /* ── Variant image area ── */
    '.vc-img-wrap{position:relative;width:100%;aspect-ratio:1/1;overflow:hidden;border-radius:14px;background:#0a0f1e;margin-bottom:10px;}',
    '.vc-img-wrap img{width:100%;height:100%;object-fit:cover;display:block;transition:opacity 0.25s ease;}',
    '.vc-img-wrap img.vc-fade{opacity:0;}',

    /* ── Variant tab strip ── */
    '.vc-tabs{display:flex;gap:6px;flex-wrap:wrap;padding:0 0 10px;margin-bottom:4px;}',
    '.vc-tab{flex-shrink:0;padding:5px 12px;border-radius:20px;border:1.5px solid rgba(255,215,0,0.25);',
    '  background:transparent;color:#94a3b8;font-size:12px;font-weight:600;cursor:pointer;',
    '  transition:all 0.18s ease;line-height:1.3;white-space:nowrap;}',
    '.vc-tab:hover{border-color:rgba(255,215,0,0.55);color:#e2e8f0;}',
    '.vc-tab.vc-active{border-color:#ffd700;background:rgba(255,215,0,0.12);color:#ffd700;}',

    /* ── Variant price row ── */
    '.vc-price-row{display:flex;align-items:baseline;gap:8px;margin-bottom:6px;flex-wrap:wrap;}',
    '.vc-price{font-size:20px;font-weight:800;color:#ffd700;}',
    '.vc-old{font-size:13px;color:#64748b;text-decoration:line-through;}',
    '.vc-save{font-size:10px;font-weight:700;color:#22c55e;background:rgba(34,197,94,0.12);',
    '  border:1px solid rgba(34,197,94,0.25);border-radius:4px;padding:2px 6px;white-space:nowrap;}',

    /* ── Variant name label ── */
    '.vc-variant-label{font-size:11px;font-weight:600;color:#94a3b8;margin-bottom:8px;',
    '  text-transform:uppercase;letter-spacing:0.08em;}',
    '.vc-variant-label span{color:#ffd700;}',

    /* ── Variant badge (top-left of image) ── */
    '.vc-badge{position:absolute;top:8px;left:8px;background:#ffd700;color:#000;',
    '  font-size:9px;font-weight:800;letter-spacing:0.1em;padding:3px 8px;border-radius:5px;',
    '  text-transform:uppercase;pointer-events:none;z-index:3;}',

    /* ── Variant image counter ── */
    '.vc-counter{position:absolute;top:8px;right:8px;background:rgba(0,0,0,0.6);color:#fff;',
    '  font-size:10px;font-weight:700;padding:3px 9px;border-radius:20px;pointer-events:none;z-index:3;}',
  ].join('');
  document.head.appendChild(s);
})();

// ============================================================
//  VARIANT CARD RENDERER
//  Called by showProducts() when product.productType === 'variant'
//  Returns a DOM element — same as standard card approach
// ============================================================

// Tracks which variant is selected per card: { cardIndex: variantIndex }
var selectedVariants = {};

function renderVariantCard(product, index) {
  // Initialise state — default to first variant
  selectedVariants[index] = 0;
  selectedOptions[index]  = { size: null, color: null };

  var variants = product.variants || [];
  if (!variants.length) return null;

  var first = variants[0];

  // ── Tab strip HTML ──
  var tabsHTML = '';
  variants.forEach(function(v, vi) {
    tabsHTML +=
      '<button class="vc-tab' + (vi === 0 ? ' vc-active' : '') + '" ' +
              'data-card="' + index + '" data-vi="' + vi + '" ' +
              'onclick="vcSwitch(' + index + ',' + vi + ')">' +
        v.name +
      '</button>';
  });

  // ── Savings for first variant ──
  var pct0 = savingsPercent(first.price, first.oldPrice);
  var saveBadge0 = pct0 > 0 ? '<span class="vc-save">SAVE ' + pct0 + '%</span>' : '';

  // ── Size buttons (shared across all variants if product.sizes exists) ──
  var sizesSection = '';
  if (product.sizes && product.sizes.length) {
    var sizesHTML = '';
    product.sizes.forEach(function(sz) {
      sizesHTML += '<button class="size-btn" data-index="' + index + '" data-size="' + sz + '">' + sz + '</button>';
    });
    sizesSection =
      '<div class="sizes-box"><h4>Select Size</h4>' +
      '<div class="sizes-row" id="sizes-' + index + '">' + sizesHTML + '</div></div>';
  }

  // ── Build card ──
  var card = document.createElement('div');
  card.className = 'product-card';
  card.setAttribute('data-variant-card', index);

  card.innerHTML =
    // Image area
    '<div class="vc-img-wrap" id="vc-img-wrap-' + index + '">' +
      '<img id="vc-img-' + index + '" src="' + first.image + '" loading="lazy" alt="' + product.title + '">' +
      (product.badge ? '<span class="vc-badge">' + product.badge + '</span>' : '') +
      '<span class="vc-counter">' + variants.length + ' Designs</span>' +
    '</div>' +

    // Variant tabs
    '<div class="vc-tabs" id="vc-tabs-' + index + '">' + tabsHTML + '</div>' +

    // Active variant label
    '<div class="vc-variant-label" id="vc-label-' + index + '">Design: <span>' + first.name + '</span></div>' +

    // Title + company
    '<h2 class="product-title">' + product.title + '</h2>' +
    (product.company ? '<p class="company-name">' + product.company + '</p>' : '') +
    (product.description ? '<p class="product-description">' + product.description + '</p>' : '') +

    // Price row — updates on tab switch
    '<div class="vc-price-row" id="vc-price-' + index + '">' +
      '<span class="vc-price" id="vc-p-' + index + '">KES ' + first.price.toLocaleString() + '</span>' +
      (first.oldPrice ? '<span class="vc-old" id="vc-op-' + index + '">KES ' + first.oldPrice.toLocaleString() + '</span>' : '<span id="vc-op-' + index + '"></span>') +
      '<span id="vc-save-' + index + '">' + saveBadge0 + '</span>' +
    '</div>' +

    // Sizes (optional)
    sizesSection +

    // Selection hint
    '<p id="selection-hint-' + index + '" class="selection-hint"></p>' +

    // Buttons — same classes as standard card so click handler works
    '<button class="buy-btn" ' +
            'data-index="' + index + '" ' +
            'data-title="' + product.title.replace(/"/g, '&quot;') + '" ' +
            'data-price="' + first.price + '" ' +
            'data-variant-card="' + index + '">' +
      '🛒 Order via WhatsApp' +
    '</button>' +
    '<button class="cart-btn">🛍️ Add to Cart</button>' +
    '<details class="details-box"><summary>📋 More Details</summary>' +
      '<p style="margin-top:10px;">Premium quality product. ' +
      'Nationwide delivery available via G4S, Simba Coach, Tahmeed and more.</p>' +
    '</details>';

  return card;
}

// ── Switch active variant inside a variant card ──
window.vcSwitch = function(cardIndex, vi) {
  var variants = null;

  // Find the product by walking all category arrays
  var cats = Object.keys(products);
  for (var ci = 0; ci < cats.length; ci++) {
    var arr = products[cats[ci]];
    for (var pi = 0; pi < arr.length; pi++) {
      // Match by rendered card index stored during showProducts()
      if (arr[pi]._cardIndex === cardIndex && arr[pi].productType === 'variant') {
        variants = arr[pi].variants;
        break;
      }
    }
    if (variants) break;
  }
  if (!variants || !variants[vi]) return;

  var v = variants[vi];
  selectedVariants[cardIndex] = vi;

  // ── Swap image with fade ──
  var img = document.getElementById('vc-img-' + cardIndex);
  if (img) {
    img.classList.add('vc-fade');
    setTimeout(function() {
      img.src = v.image;
      img.onload = function() { img.classList.remove('vc-fade'); };
      // Fallback remove fade even if onload doesn't fire
      setTimeout(function() { img.classList.remove('vc-fade'); }, 350);
    }, 150);
  }

  // ── Update price ──
  var priceEl = document.getElementById('vc-p-' + cardIndex);
  var oldEl   = document.getElementById('vc-op-' + cardIndex);
  var saveEl  = document.getElementById('vc-save-' + cardIndex);
  if (priceEl) priceEl.textContent = 'KES ' + v.price.toLocaleString();
  if (oldEl)   oldEl.textContent   = v.oldPrice ? 'KES ' + v.oldPrice.toLocaleString() : '';
  if (saveEl) {
    var pct = savingsPercent(v.price, v.oldPrice);
    saveEl.innerHTML = pct > 0 ? '<span class="vc-save">SAVE ' + pct + '%</span>' : '';
  }

  // ── Update variant label ──
  var labelEl = document.getElementById('vc-label-' + cardIndex);
  if (labelEl) labelEl.innerHTML = 'Design: <span>' + v.name + '</span>';

  // ── Update buy button price + data ──
  var buyBtn = document.querySelector('[data-variant-card="' + cardIndex + '"].buy-btn');
  if (buyBtn) buyBtn.setAttribute('data-price', v.price);

  // ── Update active tab style ──
  var tabs = document.querySelectorAll('#vc-tabs-' + cardIndex + ' .vc-tab');
  tabs.forEach(function(tab, ti) {
    tab.classList.toggle('vc-active', ti === vi);
  });

  // ── Reset selection hint ──
  var hint = document.getElementById('selection-hint-' + cardIndex);
  if (hint) { hint.textContent = ''; }
  if (selectedOptions[cardIndex]) {
    selectedOptions[cardIndex].size  = null;
    selectedOptions[cardIndex].color = null;
  }
};

// ============================================================
//  TOGGLE SUBMENU  (physical product categories)
// ============================================================
window.toggleSub = function(id) {
  document.querySelectorAll('.minor-menu').forEach(function(m) {
    var digitalIds = ['video-courses','ebooks-menu','crypto-menu','affiliate-menu','problem-menu','entertainment-menu'];
    if (m.id !== id && digitalIds.indexOf(m.id) === -1) {
      m.style.display = 'none';
    }
  });
  var t = document.getElementById(id);
  if (!t) return;
  var isOpen = t.style.display === 'block';
  t.style.display = isOpen ? 'none' : 'block';
  if (isOpen) {
    hideProducts();
  } else {
    setTimeout(function() { t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
  }
};

window.closeAllSubmenus = function() {
  var digitalIds = ['video-courses','ebooks-menu','crypto-menu','affiliate-menu','problem-menu','entertainment-menu'];
  document.querySelectorAll('.minor-menu').forEach(function(m) {
    if (digitalIds.indexOf(m.id) === -1) m.style.display = 'none';
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
    if (m.style.display === 'block') openMenu = m;
  });
  if (openMenu && openMenu.parentNode) {
    openMenu.parentNode.insertBefore(container, openMenu.nextSibling);
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

    var card;


    // ── ROUTING: variant card vs standard card ──
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
          '" data-price="' + product.price + '">🛒 Order via WhatsApp</button>' +
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
//  SINGLE DELEGATED CLICK HANDLER
// ============================================================
document.addEventListener('click', function(e) {
  var el = e.target;

  var gridBtn = el.closest('.grid-btn');
  if (gridBtn) {
    var sub = gridBtn.getAttribute('data-submenu');
    if (sub) { e.preventDefault(); e.stopPropagation(); window.toggleSub(sub); return; }
  }

  var minorBtn = el.closest('.minor-btn');
  if (minorBtn) {
    var cat = minorBtn.getAttribute('data-category');
    if (cat) { e.preventDefault(); e.stopPropagation(); window.showProducts(cat); return; }
  }

  var backBtn = el.closest('.back-btn');
  if (backBtn) {
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
      var vi    = selectedVariants[vcIdx] || 0;
      var labelEl = document.getElementById('vc-label-' + vcIdx);
      if (labelEl) {
        var span = labelEl.querySelector('span');
        if (span) variantName = span.textContent;
      }
    }

    var ref = localStorage.getItem('referralCode');
    window._pendingOrder = {
      title:   el.getAttribute('data-title'),
      variant: variantName,           // null for standard cards — payment modal ignores null
      size:    s2 || 'N/A',
      color:   c2 || 'N/A',
      price:   parseInt(el.getAttribute('data-price')),
      ref:     ref
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
  var sumEl = document.getElementById('order-summary');
  if (sumEl && order.title) {
    sumEl.innerHTML =
      '<div style="background:#0a1128;border:1px solid rgba(255,215,0,0.2);border-radius:12px;padding:14px;margin-bottom:16px;">' +
        '<div style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Order Summary</div>' +
        '<div style="font-weight:700;color:#fff;margin-bottom:4px;">' + order.title + '</div>' +
        (order.variant ? '<div style="font-size:13px;color:#ffd700;">Design: ' + order.variant + '</div>' : '') +
        (order.size && order.size !== 'N/A' ? '<div style="font-size:13px;color:#94a3b8;">Size: ' + order.size + '</div>' : '') +
        (order.color && order.color !== 'N/A' ? '<div style="font-size:13px;color:#94a3b8;">Colour: ' + order.color + '</div>' : '') +
        '<div style="font-size:20px;font-weight:800;color:#ffd700;margin-top:8px;">KES ' + (order.price || 0).toLocaleString() + '</div>' +
        (order.ref ? '<div style="font-size:11px;color:#64748b;margin-top:4px;">Ref: ' + order.ref + '</div>' : '') +
      '</div>';
  }
  var waOrder = encodeURIComponent(
    '🛒 *COZYCABIN ORDER*\n\n' +
    'Product: ' + (order.title   || '') + '\n' +
    (order.variant ? 'Design: '  + order.variant + '\n' : '') +
    'Size: '    + (order.size    || 'N/A') + '\n' +
    'Colour: '  + (order.color   || 'N/A') + '\n' +
    'Price: KES ' + (order.price || 0).toLocaleString() + '\n' +
    (order.ref ? 'Ref: ' + order.ref + '\n' : '') +
    '\nPlease confirm delivery details. 🙏'
  );
  var waOrderEl = document.getElementById('wa-order-link');
  if (waOrderEl) waOrderEl.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + waOrder;
  modal.style.display = 'flex';
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
//  COZYCABIN UPGRADE — products-upgrade.js
//  PASTE THIS FILE AT THE VERY BOTTOM OF products.js
//  ──────────────────────────────────────────────────────────
//  Adds:
//    • Feature 1 — Variant Product Card  (productType:"variant")
//    • Feature 2 — Similar Products strip
//
//  Does NOT touch any existing functions, variables, products,
//  gallery, swipe, video, cart, modals, or WhatsApp flow.
// ============================================================

// ============================================================
//  FEATURE 1 — VARIANT PRODUCT CARD
//  ──────────────────────────────────────────────────────────
//  A Variant product looks like:
//  {
//    title: "Premium Hotpot Collection",
//    productType: "variant",
//    variants: [
//      { name:"Gold Design",   price:3300, oldPrice:4000, image:"Images/hotpot-gold.webp" },
//      { name:"Floral Design", price:2999, oldPrice:3500, image:"Images/hotpot-floral.webp" },
//      { name:"Luxury Design", price:3800, oldPrice:4500, image:"Images/hotpot-luxury.webp" }
//    ]
//  }
//
//  All other product fields (description, video, badge, etc.)
//  are still supported alongside variants.
// ============================================================

/* ── CSS for variant card (injected once) ── */
(function injectVariantCSS() {
  if (document.getElementById('cc-variant-style')) return;
  var s = document.createElement('style');
  s.id = 'cc-variant-style';
  s.textContent = [
    /* variant selector row */
    '.cc-variant-row{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 6px;}',
    '.cc-variant-btn{',
    '  display:flex;flex-direction:column;align-items:center;gap:4px;',
    '  border:2px solid rgba(255,215,0,0.25);border-radius:10px;',
    '  background:rgba(10,17,40,0.7);padding:6px 10px;cursor:pointer;',
    '  transition:border-color .18s,background .18s;min-width:72px;',
    '}',
    '.cc-variant-btn:hover{border-color:rgba(255,215,0,0.6);background:rgba(255,215,0,0.07);}',
    '.cc-variant-btn.cc-var-active{border-color:#ffd700;background:rgba(255,215,0,0.13);}',
    '.cc-variant-thumb{width:52px;height:52px;border-radius:7px;object-fit:cover;display:block;pointer-events:none;}',
    '.cc-variant-label{font-size:10px;font-weight:700;color:#cbd5e1;text-align:center;line-height:1.2;max-width:68px;',
    '  white-space:normal;word-break:break-word;}',
    '.cc-variant-btn.cc-var-active .cc-variant-label{color:#ffd700;}',
    /* animated price swap */
    '.cc-var-price-wrap{transition:opacity .18s;opacity:1;}',
    '.cc-var-price-wrap.cc-fading{opacity:0;}',
    /* selected design name tag */
    '.cc-var-selected-name{',
    '  display:inline-block;font-size:11px;font-weight:700;',
    '  background:rgba(255,215,0,0.12);color:#ffd700;',
    '  border:1px solid rgba(255,215,0,0.3);border-radius:20px;',
    '  padding:3px 12px;margin-bottom:6px;letter-spacing:0.04em;',
    '}',
    /* variant main image */
    '.cc-var-main-img{',
    '  width:100%;border-radius:14px;object-fit:cover;display:block;',
    '  aspect-ratio:1/1;transition:opacity .22s;',
    '}',
    '.cc-var-main-img.cc-img-fade{opacity:0;}',
    '.cc-var-img-wrap{position:relative;width:100%;margin-bottom:10px;border-radius:14px;overflow:hidden;background:#0a0f1e;}'
  ].join('');
  document.head.appendChild(s);
})();

/* ── renderVariantCard ── */
function renderVariantCard(product, index) {
  if (!product.variants || !product.variants.length) return null;

  var card = document.createElement('div');
  card.className = 'product-card';
  card.setAttribute('data-product-index', index);

  var firstVar = product.variants[0];

  /* ── image area ── */
  var imgWrap = document.createElement('div');
  imgWrap.className = 'cc-var-img-wrap';

  var mainImg = document.createElement('img');
  mainImg.className = 'cc-var-main-img';
  mainImg.src = firstVar.image || '';
  mainImg.alt = product.title;
  mainImg.loading = 'lazy';
  mainImg.id = 'cc-var-img-' + index;
  imgWrap.appendChild(mainImg);

  card.appendChild(imgWrap);

  /* ── selected design name ── */
  var nameTag = document.createElement('div');
  nameTag.className = 'cc-var-selected-name';
  nameTag.id = 'cc-var-name-' + index;
  nameTag.textContent = firstVar.name;
  card.appendChild(nameTag);

  /* ── title ── */
  var h2 = document.createElement('h2');
  h2.className = 'product-title';
  h2.textContent = product.title;
  card.appendChild(h2);

  /* ── company ── */
  if (product.company) {
    var co = document.createElement('p');
    co.className = 'company-name';
    co.textContent = product.company;
    card.appendChild(co);
  }

  /* ── description ── */
  if (product.description) {
    var desc = document.createElement('p');
    desc.className = 'product-description';
    desc.textContent = product.description;
    card.appendChild(desc);
  }

  /* ── price box ── */
  var pct = savingsPercent(firstVar.price, firstVar.oldPrice);
  var priceWrap = document.createElement('div');
  priceWrap.id = 'cc-var-price-' + index;
  priceWrap.className = 'price-box cc-var-price-wrap';
  priceWrap.innerHTML =
    '<span class="new-price" id="cc-var-newp-' + index + '">KES ' + (firstVar.price || 0).toLocaleString() + '</span>' +
    '<span class="old-price" id="cc-var-oldp-' + index + '">KES ' + (firstVar.oldPrice || 0).toLocaleString() + '</span>' +
    (pct > 0 ? '<span class="savings-badge" id="cc-var-badge-' + index + '">SAVE ' + pct + '%</span>' : '<span class="savings-badge" id="cc-var-badge-' + index + '" style="display:none;"></span>');
  card.appendChild(priceWrap);

  /* ── variant selector ── */
  var varLabel = document.createElement('div');
  varLabel.style.cssText = 'font-size:12px;font-weight:700;color:#94a3b8;margin:8px 0 2px;text-transform:uppercase;letter-spacing:0.06em;';
  varLabel.textContent = 'Select Design';
  card.appendChild(varLabel);

  var varRow = document.createElement('div');
  varRow.className = 'cc-variant-row';
  varRow.id = 'cc-varrow-' + index;

  product.variants.forEach(function(v, vi) {
    var btn = document.createElement('button');
    btn.className = 'cc-variant-btn' + (vi === 0 ? ' cc-var-active' : '');
    btn.setAttribute('data-vi', vi);
    btn.setAttribute('data-pidx', index);

    var thumb = document.createElement('img');
    thumb.className = 'cc-variant-thumb';
    thumb.src = v.image || '';
    thumb.alt = v.name;
    thumb.loading = 'lazy';

    var lbl = document.createElement('span');
    lbl.className = 'cc-variant-label';
    lbl.textContent = v.name;

    btn.appendChild(thumb);
    btn.appendChild(lbl);
    varRow.appendChild(btn);

    btn.addEventListener('click', function() {
      ccSelectVariant(index, vi, product.variants);
    });
  });

  card.appendChild(varRow);

  /* ── hint ── */
  var hint = document.createElement('p');
  hint.className = 'selection-hint';
  hint.id = 'selection-hint-' + index;
  card.appendChild(hint);

  /* ── buy button ── */
  var buyBtn = document.createElement('button');
  buyBtn.className = 'buy-btn';
  buyBtn.setAttribute('data-index', index);
  buyBtn.setAttribute('data-title', product.title);
  buyBtn.setAttribute('data-price', firstVar.price);
  buyBtn.setAttribute('data-variant-mode', '1');
  buyBtn.id = 'cc-var-buybtn-' + index;
  buyBtn.textContent = '🛒 Order via WhatsApp';

  buyBtn.addEventListener('click', function() {
    var v = product.variants[window._ccSelectedVariant && window._ccSelectedVariant[index] !== undefined ? window._ccSelectedVariant[index] : 0];
    window._pendingOrder = {
      title: product.title + ' — ' + v.name,
      size:  'N/A',
      color: v.name,
      price: v.price,
      ref:   localStorage.getItem('referralCode')
    };
    window.openPaymentModal();
  });

  card.appendChild(buyBtn);

  /* ── cart button ── */
  var cartBtn = document.createElement('button');
  cartBtn.className = 'cart-btn';
  cartBtn.textContent = '🛍️ Add to Cart';
  card.appendChild(cartBtn);

  /* ── details ── */
  var details = document.createElement('details');
  details.className = 'details-box';
  details.innerHTML = '<summary>📋 More Details</summary><p style="margin-top:10px;">Premium quality product. Comfortable, durable and stylish. Nationwide delivery available via G4S, Simba Coach, Tahmeed and more.</p>';
  card.appendChild(details);

  /* ── similar products placeholder ── */
  var simContainer = document.createElement('div');
  simContainer.className = 'cc-similar-wrap';
  simContainer.id = 'cc-sim-' + index;
  card.appendChild(simContainer);

  return card;
}

/* ── Switch variant: update image, name, price ── */
window.ccSelectVariant = function(pidx, vi, variants) {
  if (!variants || vi >= variants.length) return;
  if (!window._ccSelectedVariant) window._ccSelectedVariant = {};
  window._ccSelectedVariant[pidx] = vi;

  var v = variants[vi];

  /* Image fade */
  var img = document.getElementById('cc-var-img-' + pidx);
  if (img) {
    img.classList.add('cc-img-fade');
    setTimeout(function() {
      img.src = v.image || '';
      img.classList.remove('cc-img-fade');
    }, 200);
  }

  /* Name tag */
  var nameTag = document.getElementById('cc-var-name-' + pidx);
  if (nameTag) nameTag.textContent = v.name;

  /* Price fade */
  var pw = document.getElementById('cc-var-price-' + pidx);
  if (pw) pw.classList.add('cc-fading');
  setTimeout(function() {
    var newp  = document.getElementById('cc-var-newp-' + pidx);
    var oldp  = document.getElementById('cc-var-oldp-' + pidx);
    var badge = document.getElementById('cc-var-badge-' + pidx);
    if (newp) newp.textContent = 'KES ' + (v.price || 0).toLocaleString();
    if (oldp) oldp.textContent = 'KES ' + (v.oldPrice || 0).toLocaleString();
    var pct = savingsPercent(v.price, v.oldPrice);
    if (badge) {
      if (pct > 0) { badge.textContent = 'SAVE ' + pct + '%'; badge.style.display = ''; }
      else { badge.style.display = 'none'; }
    }
    if (pw) pw.classList.remove('cc-fading');
  }, 180);

  /* Buy button price */
  var buyBtn = document.getElementById('cc-var-buybtn-' + pidx);
  if (buyBtn) buyBtn.setAttribute('data-price', v.price);

  /* Active thumb */
  var row = document.getElementById('cc-varrow-' + pidx);
  if (row) {
    row.querySelectorAll('.cc-variant-btn').forEach(function(btn) {
      btn.classList.toggle('cc-var-active', parseInt(btn.getAttribute('data-vi')) === vi);
    });
  }
};

// ============================================================
//  FEATURE 2 — SIMILAR PRODUCTS
//  ──────────────────────────────────────────────────────────
//  Displayed below each product card (standard or variant).
//  Shows 4–8 products from same category, falls back to
//  related categories if not enough products exist.
// ============================================================

/* ── Related-category map (extend as new categories are added) ── */
var CC_RELATED = {
  hotpots:     ['flasks','bottles','cutlery','dispenser'],
  flasks:      ['hotpots','bottles','dispenser','cutlery'],
  bottles:     ['flasks','hotpots','dispenser','cutlery'],
  cutlery:     ['hotpots','flasks','dispenser','racks'],
  dispenser:   ['bottles','flasks','cutlery','hotpots'],
  racks:       ['cutlery','dispenser','hotpots','cookers'],
  cookers:     ['blenders','kettles','microwaves','racks'],
  blenders:    ['cookers','kettles','microwaves','cutlery'],
  kettles:     ['cookers','blenders','microwaves','hotpots'],
  microwaves:  ['cookers','kettles','blenders','fridges'],
  fridges:     ['microwaves','cookers','kettles','irons'],
  washing:     ['irons','heaters','fansapp','microwaves'],
  irons:       ['washing','heaters','fansapp','kettles'],
  heaters:     ['irons','fans','fansapp','washing'],
  fansapp:     ['heaters','fans','irons','washing'],
  fans:        ['fansapp','heaters','solarlights','chargers'],
  shoes:       ['travel'],
  travel:      ['shoes'],
  solarlights: ['panels','inverters','batteries','chargers','floodlights','streetlights'],
  panels:      ['solarlights','inverters','batteries','chargers'],
  inverters:   ['panels','batteries','chargers','solarlights'],
  batteries:   ['inverters','panels','chargers','solarlights'],
  chargers:    ['powerbanks','flashdisks','batteries','solarlights'],
  floodlights: ['solarlights','streetlights','panels'],
  streetlights:['floodlights','solarlights','panels'],
  speakers:    ['earbuds','radios','tvbox','gaming'],
  earbuds:     ['speakers','radios','smartwatch','gaming'],
  radios:      ['speakers','earbuds','tvbox'],
  tvbox:       ['speakers','radios','gaming'],
  smartwatch:  ['earbuds','powerbanks','phones','gaming'],
  gaming:      ['speakers','earbuds','tvbox','smartwatch'],
  phones:      ['tablets','laptops','chargers','powerbanks'],
  tablets:     ['phones','laptops','keyboards','storage'],
  laptops:     ['tablets','phones','keyboards','mouse','storage'],
  keyboards:   ['laptops','mouse','tablets'],
  mouse:       ['keyboards','laptops'],
  printers:    ['laptops','storage','keyboards'],
  storage:     ['flashdisks','laptops','phones'],
  flashdisks:  ['storage','powerbanks','chargers'],
  powerbanks:  ['chargers','flashdisks','phones'],
  cameras:     ['alarms','trackers','recorders','locks'],
  alarms:      ['cameras','sensors','locks','doorbells'],
  locks:       ['alarms','cameras','doorbells','safes'],
  doorbells:   ['locks','alarms','cameras'],
  trackers:    ['cameras','sensors','safes'],
  sensors:     ['alarms','cameras','trackers'],
  safes:       ['locks','cameras','alarms'],
  recorders:   ['cameras','alarms','sensors'],
  wallart:     ['mirrors','flowers','lamps','frames','vases'],
  mirrors:     ['wallart','lamps','frames','flowers'],
  flowers:     ['wallart','vases','mirrors','lamps'],
  lamps:       ['wallart','mirrors','flowers','curtains'],
  carpets:     ['curtains','wallart','lamps','duvets'],
  curtains:    ['carpets','lamps','wallart','duvets'],
  frames:      ['wallart','mirrors','vases'],
  vases:       ['flowers','wallart','frames'],
  duvets:      ['bedsheets','blankets','pillows','mattress'],
  bedsheets:   ['duvets','pillows','covers','blankets'],
  blankets:    ['duvets','bedsheets','pillows','mattress'],
  pillows:     ['duvets','bedsheets','blankets','covers'],
  mattress:    ['duvets','blankets','pillows','bedsheets'],
  covers:      ['bedsheets','pillows','duvets','nets'],
  nets:        ['covers','bedsheets','duvets'],
  towels:      ['bedsheets','duvets','covers']
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
    var img = (p.images && p.images[0]) || (p.variants && p.variants[0] && p.variants[0].image) || '';
    var price = p.price || (p.variants && p.variants[0] && p.variants[0].price) || 0;

    var item = document.createElement('div');
    item.className = 'cc-similar-item';
    item.innerHTML =
      '<img class="cc-sim-img" src="' + img + '" loading="lazy" alt="' + (p.title || '') + '">' +
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
//  PATCH showProducts — hook in Variant + Similar rendering
//  ──────────────────────────────────────────────────────────
//  Wraps the EXISTING showProducts without replacing it.
//  Strategy:
//    • Let the original showProducts run first (handles all
//      standard cards, categories, positioning, scroll)
//    • Then, for any product with productType:"variant",
//      SWAP the standard card the original created with a
//      proper variant card built by renderVariantCard()
//    • Then inject similar products strip into every card
// ============================================================
(function patchShowProducts() {
  var _originalShowProducts = window.showProducts;

  window.showProducts = function(category) {
    /* ① Run original — builds all standard cards as before */
    _originalShowProducts(category);

    var container = document.getElementById('products-container');
    if (!container) return;

    var categoryProducts = products[category];
    if (!categoryProducts || !categoryProducts.length) return;

    /* ② Walk each product — swap variant cards, then inject similar */
    var cards = container.querySelectorAll('.product-card');

    categoryProducts.forEach(function(product, index) {

      /* ── VARIANT SWAP ── */
      if (product.productType === 'variant' && product.variants && product.variants.length) {
        var originalCard = cards[index];
        var variantCard  = renderVariantCard(product, index);
        if (variantCard && originalCard) {
          container.replaceChild(variantCard, originalCard);
        }
      }

      /* ── SIMILAR PRODUCTS ── */
      /* Re-query cards after possible replacement */
      var allCards = container.querySelectorAll('.product-card');
      var targetCard = allCards[index];
      if (!targetCard) return;

      /* Add similar container if not already there */
      if (!targetCard.querySelector('.cc-similar-wrap')) {
        var simWrap = document.createElement('div');
        simWrap.className = 'cc-similar-wrap';
        simWrap.id = 'cc-sim-' + category + '-' + index;
        targetCard.appendChild(simWrap);
      }

      /* Build similar products strip */
      ccBuildSimilar('cc-sim-' + category + '-' + index, category, index);
    });
  };
})();
window.copyText = cozyyCopy;
window.cozyyCopy = cozyyCopy


// ============================================================
//  END OF UPGRADE — products-upgrade.js
// ============================================================






    
    
