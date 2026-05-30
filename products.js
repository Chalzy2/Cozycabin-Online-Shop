// ============================================================
//  COZYCABIN PRODUCTS.JS — v3 FIXED
//  FIXES:
//  1. openPaymentModal — order summary scope error fixed
//  2. hero banner click → toggleSub working (no conflict)
//  3. back-btn in digital submenus handled separately
//  4. Banner rotates every 2s across all 19 slides ✅
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
// ============================================================
var products = {
  shoes: [
    {
      title: "Classic Black Sneakers", company: "Fashion",
      price: 1999, oldPrice: 2500, sizes: [41,42,43,44],
      colors: ["Black","Grey","Gold"],
      description: "Comfortable lightweight sneakers for daily wear.",
      images: ["Images/black-shoes.webp","Images/greyshoes.webp","Images/gold-shoes.webp"]
    },
    {
      title: "Ladies Fashion Sneakers", company: "Fashion",
      price: 1999, oldPrice: 2500, sizes: [41,42,43,44],
      colors: ["White","Black"],
      description: "Stylish ladies sneakers with soft inner comfort.",
      images: ["Images/women-wshoe.webp","Images/women-bshoes.webp"]
    },
    {
      title: "Calvin Klein Casual", company: "Calvin Klein",
      price: 3200, oldPrice: 4000, sizes: [40,41,42,43,44,45],
      colors: ["Brown","Blue","Tan"],
      description: "Premium Calvin Klein casual sneakers with durable sole.",
      images: ["Images/calvin-brown.webp","Images/calvin-blue.webp","Images/calvin-tan.webp"]
    },
    {
      title: "Timberland Casual", company: "Timberland",
      price: 3200, oldPrice: 4000, sizes: [40,41,42,43,44,45],
      colors: ["Black","White"],
      description: "Elegant Timberland casual shoes for smart everyday fashion.",
      images: ["Images/timber-black.webp","Images/timber-white.webp"]
    }
  ],

  cutlery: [
    {
      title: "Silicone Spoons", company: "Kitchen",
      price: 1499, oldPrice: 2000, sizes: [],
      colors: ["Black","Grey"],
      description: "Elegant Silicone spoons for everyday use.",
      images: ["Images/blcksilicn.webp","Images/Silcn12psc1499.webp"]
    },
    {
      title: "24 Psc Gold Cutlery Set", company: "Kitchen",
      price: 2500, oldPrice: 3500, sizes: [],
      colors: ["Gold","Silver"],
      description: "Elegant 24-pieces stainless steel cutlery set with stand.",
      images: ["Images/24goldcutlery-set.webp","Images/24goldcutlery-set.webp"]
    }
  ],

  // ── Placeholders — add products later ──
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
//  TOGGLE SUBMENU  (physical product categories)
// ============================================================
window.toggleSub = function(id) {
  // Close all physical submenus except the target
  document.querySelectorAll('.minor-menu').forEach(function(m) {
    // Don't close digital dropdowns here — they have their own closeAllDigital
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
//  SHOW PRODUCTS
// ============================================================
window.showProducts = function(category) {
  var container = document.getElementById('products-container');
  if (!container) return;
  container.innerHTML = '';
  Object.keys(selectedOptions).forEach(function(k) { delete selectedOptions[k]; });

  // Find the currently open submenu reliably
  var openMenu = null;
  document.querySelectorAll('.minor-menu').forEach(function(m) {
    if (m.style.display === 'block') openMenu = m;
  });
  // Move container to right below the open submenu
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
    selectedOptions[index] = { size: null, color: null };

    var pct = savingsPercent(product.price, product.oldPrice);

    var thumbsHTML = '';
    product.images.forEach(function(img, i) {
      thumbsHTML +=
        '<img src="' + img + '" class="thumb-image' + (i === 0 ? ' thumb-active' : '') +
        '" data-index="' + index + '" data-img="' + img + '" loading="lazy">';
    });

    var sizesHTML = '';
    (product.sizes || []).forEach(function(size) {
      sizesHTML +=
        '<button class="size-btn" data-index="' + index + '" data-size="' + size + '">' + size + '</button>';
    });

    var colorsHTML = '';
    (product.colors || []).forEach(function(color) {
      colorsHTML +=
        '<button class="color-btn" data-index="' + index + '" data-color="' + color + '">' + color + '</button>';
    });

    var savingsBadge = pct > 0
      ? '<span class="savings-badge">SAVE ' + pct + '%</span>'
      : '';

    var sizesSection = product.sizes && product.sizes.length > 0
      ? '<div class="sizes-box"><h4>Select Size</h4><div class="sizes-row" id="sizes-' + index + '">' + sizesHTML + '</div></div>'
      : '';

    var colorsSection = product.colors && product.colors.length > 0
      ? '<div class="colors-box"><h4>Select Colour</h4><div class="colors-row" id="colors-' + index + '">' + colorsHTML + '</div></div>'
      : '';

    var card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML =
      '<div class="product-gallery">' +
        '<img id="mainImage-' + index + '" src="' + product.images[0] + '" class="main-product-image" loading="lazy">' +
      '</div>' +
      '<div class="thumbnail-row" id="thumbs-' + index + '">' + thumbsHTML + '</div>' +
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

  // ── GRID BTN → toggleSub ──
  var gridBtn = el.closest('.grid-btn');
  if (gridBtn) {
    var sub = gridBtn.getAttribute('data-submenu');
    if (sub) {
      e.preventDefault();
      e.stopPropagation();
      window.toggleSub(sub);
      return;
    }
  }

  // ── MINOR BTN → showProducts ──
  var minorBtn = el.closest('.minor-btn');
  if (minorBtn) {
    var cat = minorBtn.getAttribute('data-category');
    if (cat) {
      e.preventDefault();
      e.stopPropagation();
      window.showProducts(cat);
      return;
    }
  }

  // ── BACK BTN (physical categories only — digital back buttons use onclick directly) ──
  var backBtn = el.closest('.back-btn');
  if (backBtn) {
    // If the back button has an inline onclick (digital dropdowns), let it run naturally
    if (!backBtn.getAttribute('onclick')) {
      e.preventDefault();
      window.closeAllSubmenus();
    }
    return;
  }

  // ── THUMBNAIL ──
  if (el.classList.contains('thumb-image')) {
    var idx = el.getAttribute('data-index');
    var main = document.getElementById('mainImage-' + idx);
    if (main) main.src = el.getAttribute('data-img');
    document.querySelectorAll('#thumbs-' + idx + ' .thumb-image')
      .forEach(function(t) { t.classList.remove('thumb-active'); });
    el.classList.add('thumb-active');
    return;
  }

  // ── SIZE BTN ──
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

  // ── COLOR BTN ──
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

  // ── BUY BTN ──
  if (el.classList.contains('buy-btn')) {
    var idx4 = el.getAttribute('data-index');
    var hint = document.getElementById('selection-hint-' + idx4);
    var s2   = selectedOptions[idx4] ? selectedOptions[idx4].size  : null;
    var c2   = selectedOptions[idx4] ? selectedOptions[idx4].color : null;

    var card2    = el.closest('.product-card');
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

    var ref = localStorage.getItem('referralCode');
    window._pendingOrder = {
      title: el.getAttribute('data-title'),
      size:  s2 || 'N/A',
      color: c2 || 'N/A',
      price: parseInt(el.getAttribute('data-price')),
      ref:   ref
    };

    window.openPaymentModal();
    return;
  }

  // ── BACKDROP — smart payment modal ──
  var smartModal = document.getElementById('smart-payment-modal');
  if (smartModal && e.target === smartModal) {
    window.closePaymentModal();
  }
});

// ============================================================
//  HERO BANNER — 19 slides, rotates every 2s
//  Slide onclick attrs call toggleSub → opens submenu below
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

    // Build dots
    slides.forEach(function(_, i) {
      var dot = document.createElement('button');
      dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Slide ' + (i + 1));
      dot.addEventListener('click', function(e) {
        e.stopPropagation(); // prevent triggering slide onclick
        goTo(i);
        resetTimer();
      });
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

    // Explicitly show first slide on all devices
    slides.forEach(function(s, i) {
      s.style.display = i === 0 ? 'flex' : 'none';
    });

    // Swipe support (left/right swipe changes slide, does NOT fire onclick)
    var startX = 0;
    var startY = 0;
    var swiped = false;

    banner.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      swiped = false;
    }, { passive: true });

    banner.addEventListener('touchend', function(e) {
      var diffX = startX - e.changedTouches[0].clientX;
      var diffY = startY - e.changedTouches[0].clientY;
      if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
        swiped = true;
        goTo(diffX > 0 ? current + 1 : current - 1);
        resetTimer();
      }
    }, { passive: true });

    // Restart timer when user returns to the tab
    document.addEventListener('visibilitychange', function() {
      if (!document.hidden) { resetTimer(); }
    });

    resetTimer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroBanner);
  } else {
    initHeroBanner();
  }
})();

// ============================================================
//  PROMO BANNER (separate element #promo-banner, not hero)
// ============================================================
(function() {
  function initPromoBanner() {
    var banner = document.getElementById('promo-banner');
    if (!banner) return;

    var slides = banner.querySelectorAll('.promo-slide');
    var dots   = banner.querySelectorAll('.promo-dot');
    if (!slides.length) return;

    var current = 0;
    var timer;

    function showSlide(n) {
      slides[current].style.display = 'none';
      slides[current].classList.remove('active');
      if (dots[current]) {
        dots[current].style.width = '8px';
        dots[current].style.background = '#333';
        dots[current].style.borderRadius = '50%';
      }
      current = (n + slides.length) % slides.length;
      slides[current].style.display = 'flex';
      slides[current].classList.add('active');
      if (dots[current]) {
        dots[current].style.width = '24px';
        dots[current].style.background = '#ffd700';
        dots[current].style.borderRadius = '4px';
      }
    }

    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(function() { showSlide(current + 1); }, 2000);
    }

    slides.forEach(function(s, i) {
      s.style.display = i === 0 ? 'flex' : 'none';
      if (i === 0) s.classList.add('active');
    });
    if (dots[0]) {
      dots[0].style.width = '24px';
      dots[0].style.background = '#ffd700';
      dots[0].style.borderRadius = '4px';
    }

    document.addEventListener('visibilitychange', function() {
      if (!document.hidden) { resetTimer(); }
    });

    resetTimer();

    // Swipe
    var startX = 0;
    banner.addEventListener('touchstart', function(e) { startX = e.touches[0].clientX; }, { passive: true });
    banner.addEventListener('touchend', function(e) {
      var diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { showSlide(diff > 0 ? current + 1 : current - 1); resetTimer(); }
    }, { passive: true });

    // Tap → open promo modal
    banner.addEventListener('click', function(e) {
      // Don't fire if user clicked a dot
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
      if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        promoBackToStep1();
      }
    });

    // Close button
    var closeBtn = document.getElementById('promo-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        document.getElementById('promo-action-modal').style.display = 'none';
        document.body.style.overflow = '';
      });
    }

    // Backdrop close
    var modal = document.getElementById('promo-action-modal');
    if (modal) {
      modal.addEventListener('click', function(e) {
        if (e.target === this) { this.style.display = 'none'; document.body.style.overflow = ''; }
      });
    }

    // Step buttons
    var inquireBtn = document.getElementById('promo-btn-inquire');
    if (inquireBtn) {
      inquireBtn.addEventListener('click', function() {
        document.getElementById('promo-step-1').style.display       = 'none';
        document.getElementById('promo-step-inquire').style.display = 'block';
        document.getElementById('promo-step-pay').style.display     = 'none';
      });
    }
    var payBtn = document.getElementById('promo-btn-pay');
    if (payBtn) {
      payBtn.addEventListener('click', function() {
        document.getElementById('promo-step-1').style.display       = 'none';
        document.getElementById('promo-step-inquire').style.display = 'none';
        document.getElementById('promo-step-pay').style.display     = 'block';
      });
    }

    document.querySelectorAll('.promo-back').forEach(function(btn) {
      btn.addEventListener('click', promoBackToStep1);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPromoBanner);
  } else {
    initPromoBanner();
  }
})();

// ============================================================
//  SMART PAYMENT MODAL — FIXED (order summary scope corrected)
// ============================================================
window.openPaymentModal = function() {
  var modal = document.getElementById('smart-payment-modal');
  if (!modal) return;

  // Get pending order set by BUY BTN handler
  var order = window._pendingOrder || {};

  // Inject order summary
  var sumEl = document.getElementById('order-summary');
  if (sumEl && order.title) {
    sumEl.innerHTML =
      '<div style="background:#0a1128;border:1px solid rgba(255,215,0,0.2);border-radius:12px;padding:14px;margin-bottom:16px;">' +
        '<div style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Order Summary</div>' +
        '<div style="font-weight:700;color:#fff;margin-bottom:4px;">' + order.title + '</div>' +
        (order.size && order.size !== 'N/A' ? '<div style="font-size:13px;color:#94a3b8;">Size: ' + order.size + '</div>' : '') +
        (order.color && order.color !== 'N/A' ? '<div style="font-size:13px;color:#94a3b8;">Colour: ' + order.color + '</div>' : '') +
        '<div style="font-size:20px;font-weight:800;color:#ffd700;margin-top:8px;">KES ' + (order.price || 0).toLocaleString() + '</div>' +
        (order.ref ? '<div style="font-size:11px;color:#64748b;margin-top:4px;">Ref: ' + order.ref + '</div>' : '') +
      '</div>';
  }

  // Build WhatsApp order message for Kenya step
  var waOrder = encodeURIComponent(
    '🛒 *COZYCABIN ORDER*\n\n' +
    'Product: ' + (order.title || '') + '\n' +
    'Size: '    + (order.size  || 'N/A') + '\n' +
    'Colour: '  + (order.color || 'N/A') + '\n' +
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
    .forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
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
//  DIGITAL GRID TOGGLE (keep in sync with inline script)
// ============================================================
window.toggleDigital = function(id) {
  var allDigital = ['video-courses','ebooks-menu','crypto-menu','affiliate-menu','problem-menu','entertainment-menu'];
  allDigital.forEach(function(mid) {
    var el = document.getElementById(mid);
    if (el && mid !== id) el.style.display = 'none';
  });
  var target = document.getElementById(id);
  if (!target) return;
  var isOpen = target.style.display === 'block';
  target.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) setTimeout(function() { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50);
};

window.closeAllDigital = function() {
  ['video-courses','ebooks-menu','crypto-menu','affiliate-menu','problem-menu','entertainment-menu']
    .forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
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
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
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

window.copyText = cozyyCopy;
window.cozyyCopy = cozyyCopy
      


                                         
