// COZYCABIN PRODUCTS.JS — FINAL

var WHATSAPP_NUMBER = "254702468460";
var selectedOptions = {};

// REFERRAL
var urlParams = new URLSearchParams(window.location.search);
var urlRef = urlParams.get('ref');
if (urlRef) localStorage.setItem('referralCode', urlRef);
var referralCode = localStorage.getItem('referralCode');

// PRODUCTS DATABASE
var products = {
  shoes: [
    {
      title: "Classic Black Sneakers", company: "Fashion",
      price: 1999, oldPrice: 2500, sizes: [41,42,43,44],
      colors: ["Black","Gray","Gold"],
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
  shirts:[], hoodies:[], watches:[], bags:[], caps:[], jeans:[], jackets:[],
  cutlery:[], dispenser:[], hotpots:[], racks:[], flasks:[], bottles:[], cookers:[], blenders:[],
  solarlights:[], panels:[], inverters:[], batteries:[], streetlights:[], floodlights:[], chargers:[], fans:[],
  fridges:[], microwaves:[], washing:[], cookersapp:[], kettles:[], irons:[], heaters:[], fansapp:[],
  wallart:[], mirrors:[], flowers:[], lamps:[], carpets:[], curtains:[], frames:[], vases:[],
  duvets:[], bedsheets:[], blankets:[], pillows:[], mattress:[], covers:[], nets:[], towels:[],
  cameras:[], alarms:[], locks:[], doorbells:[], trackers:[], sensors:[], safes:[], recorders:[],
  speakers:[], radios:[], earbuds:[], tvbox:[], powerbanks:[], flashdisks:[], smartwatch:[], gaming:[],
  phones:[], laptops:[], tablets:[], routers:[], keyboards:[], mouse:[], printers:[], storage:[]
};

// HIDE PRODUCTS
function hideProducts() {
  var c = document.getElementById('products-container');
  if (c) { c.innerHTML = ''; c.style.display = 'none'; }
}

// TOGGLE SUBMENU
window.toggleSub = function(id) {
  document.querySelectorAll('.minor-menu').forEach(function(m) {
    if (m.id !== id) m.style.display = 'none';
  });
  var t = document.getElementById(id);
  if (!t) return;
  var isOpen = t.style.display === 'block';
  t.style.display = isOpen ? 'none' : 'block';
  if (isOpen) hideProducts();
};

// CLOSE ALL
window.closeAllSubmenus = function() {
  document.querySelectorAll('.minor-menu').forEach(function(m) { m.style.display = 'none'; });
  hideProducts();
};

// SHOW PRODUCTS
window.showProducts = function(category) {
  var container = document.getElementById('products-container');
  if (!container) return;
  container.innerHTML = '';
  Object.keys(selectedOptions).forEach(function(k) { delete selectedOptions[k]; });

  // Move container right below the open submenu
  var openMenu = document.querySelector('.minor-menu[style*="block"]');
  if (openMenu && openMenu.parentNode) {
    openMenu.parentNode.insertBefore(container, openMenu.nextSibling);
  }

  if (!products[category] || products[category].length === 0) {
    container.style.display = 'block';
    container.innerHTML = '<div class="empty-products"><h2>No Products Yet</h2><p>Coming soon!</p></div>';
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  products[category].forEach(function(product, index) {
    selectedOptions[index] = { size: null, color: null };

    var thumbsHTML = '';
    product.images.forEach(function(img, i) {
      thumbsHTML += '<img src="' + img + '" class="thumb-image' + (i===0?' thumb-active':'') +
        '" data-index="' + index + '" data-img="' + img + '" loading="lazy">';
    });

    var sizesHTML = '';
    (product.sizes||[]).forEach(function(size) {
      sizesHTML += '<button class="size-btn" data-index="' + index + '" data-size="' + size + '">' + size + '</button>';
    });

    var colorsHTML = '';
    (product.colors||[]).forEach(function(color) {
      colorsHTML += '<button class="color-btn" data-index="' + index + '" data-color="' + color + '">' + color + '</button>';
    });

    var card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML =
      '<div class="product-gallery"><img id="mainImage-' + index + '" src="' + product.images[0] + '" class="main-product-image" loading="lazy"></div>' +
      '<div class="thumbnail-row" id="thumbs-' + index + '">' + thumbsHTML + '</div>' +
      '<h2 class="product-title">' + product.title + '</h2>' +
      '<p class="company-name">' + product.company + '</p>' +
      '<p class="product-description">' + product.description + '</p>' +
      '<div class="price-box"><span class="new-price">KES ' + product.price.toLocaleString() + '</span><span class="old-price">KES ' + product.oldPrice.toLocaleString() + '</span></div>' +
      '<div class="sizes-box"><h4>Select Size</h4><div class="sizes-row" id="sizes-' + index + '">' + sizesHTML + '</div></div>' +
      '<div class="colors-box"><h4>Select Color</h4><div class="colors-row" id="colors-' + index + '">' + colorsHTML + '</div></div>' +
      '<p id="selection-hint-' + index + '" class="selection-hint"></p>' +
      '<button class="buy-btn" data-index="' + index + '" data-title="' + product.title.replace(/"/g,'&quot;') + '" data-price="' + product.price + '">🛒 Order via WhatsApp</button>' +
      '<button class="cart-btn">Add to Cart</button>' +
      '<details class="details-box"><summary>More Details</summary><p>Premium quality. Comfortable, durable and stylish.</p></details>';
    container.appendChild(card);
  });

  container.style.display = 'grid';
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// UPDATE HINT
function updateHint(index) {
  var hint = document.getElementById('selection-hint-' + index);
  if (!hint) return;
  var s = selectedOptions[index] && selectedOptions[index].size;
  var c = selectedOptions[index] && selectedOptions[index].color;
  if (s && c)      { hint.textContent = '✅ Size ' + s + ' · ' + c + ' selected'; hint.style.color = '#22c55e'; }
  else if (s)      { hint.textContent = 'Size ' + s + ' selected — now pick a color'; hint.style.color = '#f59e0b'; }
  else if (c)      { hint.textContent = c + ' selected — now pick a size'; hint.style.color = '#f59e0b'; }
  else             { hint.textContent = ''; }
}

// SINGLE CLICK HANDLER — handles everything
document.addEventListener('click', function(e) {
  var el = e.target;

  // GRID BTN → toggleSub via data-submenu
  var gridBtn = el.closest('.grid-btn');
  if (gridBtn) {
    var sub = gridBtn.getAttribute('data-submenu');
    if (sub) { e.preventDefault(); window.toggleSub(sub); return; }
  }

  // MINOR BTN → showProducts via data-category
  var minorBtn = el.closest('.minor-btn');
  if (minorBtn) {
    var cat = minorBtn.getAttribute('data-category');
    if (cat) { e.preventDefault(); window.showProducts(cat); return; }
  }

  // BACK BTN
  if (el.closest('.back-btn')) { e.preventDefault(); window.closeAllSubmenus(); return; }

  // THUMBNAIL
  if (el.classList.contains('thumb-image')) {
    var idx = el.getAttribute('data-index');
    var main = document.getElementById('mainImage-' + idx);
    if (main) main.src = el.getAttribute('data-img');
    document.querySelectorAll('#thumbs-' + idx + ' .thumb-image').forEach(function(t) { t.classList.remove('thumb-active'); });
    el.classList.add('thumb-active');
    return;
  }

  // SIZE BTN
  if (el.classList.contains('size-btn')) {
    var idx2 = el.getAttribute('data-index');
    document.querySelectorAll('#sizes-' + idx2 + ' .size-btn').forEach(function(b) { b.classList.remove('option-active'); });
    el.classList.add('option-active');
    if (!selectedOptions[idx2]) selectedOptions[idx2] = {size:null,color:null};
    selectedOptions[idx2].size = el.getAttribute('data-size');
    updateHint(idx2); return;
  }

  // COLOR BTN
  if (el.classList.contains('color-btn')) {
    var idx3 = el.getAttribute('data-index');
    document.querySelectorAll('#colors-' + idx3 + ' .color-btn').forEach(function(b) { b.classList.remove('option-active'); });
    el.classList.add('option-active');
    if (!selectedOptions[idx3]) selectedOptions[idx3] = {size:null,color:null};
    selectedOptions[idx3].color = el.getAttribute('data-color');
    updateHint(idx3); return;
  }

  // BUY BTN
if (el.classList.contains('buy-btn')) {
    var idx4 = el.getAttribute('data-index');
    var hint = document.getElementById('selection-hint-' + idx4);
    var s2 = selectedOptions[idx4] ? selectedOptions[idx4].size : null;
    var c2 = selectedOptions[idx4] ? selectedOptions[idx4].color : null;
    if (!s2 || !c2) {
      if (hint) { hint.textContent = '⚠️ Please select size and color first'; hint.style.color = '#ef4444'; }
      return;
    }

    // Save order details for payment modal
    var ref = localStorage.getItem('referralCode');
    window._pendingOrder = {
      title: el.getAttribute('data-title'),
      size: s2,
      color: c2,
      price: parseInt(el.getAttribute('data-price')),
      ref: ref
    };

    // Open smart payment modal
    window.openPaymentModal();
    return;
}
// =============================================
// PROMO BANNER v2 — Rotate + Action Modal
// =============================================
(function() {
  var slides  = document.querySelectorAll('.promo-slide');
  var dots    = document.querySelectorAll('.promo-dot');
  var colors  = ['#ffd700','#22c55e','#ff8a00','#0d84ff','#ff6bff','#ff4444'];
  if (!slides.length) return;
  var current = 0;

  function showSlide(n) {
    slides[current].style.display = 'none';
    dots[current].style.background = '#333';
    dots[current].style.width = '8px';
    current = (n + slides.length) % slides.length;
    slides[current].style.display = 'flex';
    dots[current].style.background = colors[current] || '#ffd700';
    dots[current].style.width = '24px';
  }

  // Rotate every 8 seconds
  setInterval(function() { showSlide(current + 1); }, 8000);

  // Swipe support
  var startX = 0;
  var banner = document.getElementById('promo-banner');
  if (banner) {
    banner.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
    }, { passive: true });
    banner.addEventListener('touchend', function(e) {
      var diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) showSlide(diff > 0 ? current + 1 : current - 1);
    }, { passive: true });

    // TAP → open action modal
    banner.addEventListener('click', function() {
      var slide = slides[current];
      var label = slide.getAttribute('data-label') || 'COZYCABIN';
      var title = slide.getAttribute('data-title') || 'Shop with Cozycabin';

      // Set modal content
      document.getElementById('promo-modal-label').textContent = label;
      document.getElementById('promo-modal-title').textContent = title;

      // Set WhatsApp links with slide context
      var waMsg = encodeURIComponent(
        '👋 Hello Cozycabin!\n\nI saw your banner: "' + title + '"\n\nI would like to know more. Please assist. 🙏'
      );
      var waConfirm = encodeURIComponent(
        '👋 Hello Cozycabin!\n\nI have made payment for: "' + title + '"\n\nPlease confirm my order. 🛒'
      );
      document.getElementById('promo-wa-inquire').href = 'https://wa.me/254702468460?text=' + waMsg;
      document.getElementById('promo-wa-confirm').href = 'https://wa.me/254702468460?text=' + waConfirm;

      // Show modal
      var modal = document.getElementById('promo-action-modal');
      if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        promoBackToStep1();
      }
    });
  }

  // Close modal
  var closeBtn = document.getElementById('promo-modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', function() {
      document.getElementById('promo-action-modal').style.display = 'none';
      document.body.style.overflow = '';
    });
  }

  // Close on backdrop tap
  document.getElementById('promo-action-modal').addEventListener('click', function(e) {
    if (e.target === this) {
      this.style.display = 'none';
      document.body.style.overflow = '';
    }
  });

  // Inquire button
  document.getElementById('promo-btn-inquire').addEventListener('click', function() {
    document.getElementById('promo-step-1').style.display = 'none';
    document.getElementById('promo-step-inquire').style.display = 'block';
    document.getElementById('promo-step-pay').style.display = 'none';
  });

  // Pay button
  document.getElementById('promo-btn-pay').addEventListener('click', function() {
    document.getElementById('promo-step-1').style.display = 'none';
    document.getElementById('promo-step-inquire').style.display = 'none';
    document.getElementById('promo-step-pay').style.display = 'block';
  });

  // Back buttons
  document.querySelectorAll('.promo-back').forEach(function(btn) {
    btn.addEventListener('click', promoBackToStep1);
  });
})();

function promoBackToStep1() {
  document.getElementById('promo-step-1').style.display = 'block';
  document.getElementById('promo-step-inquire').style.display = 'none';
  document.getElementById('promo-step-pay').style.display = 'none';
}

function cozyyCopy(text, btnId) {
  var btn = document.getElementById(btnId);
  navigator.clipboard.writeText(text).then(function() {
    if (btn) { btn.textContent = '✅ Copied!'; btn.style.background = '#166534'; }
    setTimeout(function() {
      if (btn) { btn.textContent = 'Copy'; btn.style.background = '#22c55e'; }
    }, 2000);
  }).catch(function() {
    var el = document.createElement('textarea');
    el.value = text; document.body.appendChild(el);
    el.select(); document.execCommand('copy');
    document.body.removeChild(el);
    if (btn) { btn.textContent = '✅ Copied!'; }
    setTimeout(function() { if (btn) btn.textContent = 'Copy'; }, 2000);
  });
}


  // Auto-rotate every 3 seconds
  setInterval(function() { showSlide(current + 1); }, 3000);

  // Tap banner → open submenu + show products
  var banner = document.getElementById('promo-banner');
  if (banner) {
    banner.addEventListener('click', function() {
      var slide    = slides[current];
      var submenu  = slide.getAttribute('data-submenu');
      var category = slide.getAttribute('data-category');
      if (submenu) window.toggleSub(submenu);
      setTimeout(function() {
        if (category) window.showProducts(category);
      }, 300);
    });
  }
})();

// =============================================
// HERO BANNER v2 — Auto-counts all slides
// including advertiser AD SLOTS
// Just add a slide with class "hero-slide"
// and it gets included automatically
// =============================================
(function() {
  var slides = document.querySelectorAll('.hero-slide');
  var dotsContainer = document.getElementById('hero-dots');
  if (!slides.length || !dotsContainer) return;

  var dotColors = [
    '#2db742','#0d84ff','#ffd700','#22c55e',
    '#f2c94c','#ff6bff','#ff4500',
    // Ad slot colors — add more as needed
    '#ff0099','#00ccff','#ff6600','#9900ff','#00ff99'
  ];

  // Auto-generate dots based on slide count
  slides.forEach(function(_, i) {
    var dot = document.createElement('span');
    dot.style.cssText = 'width:' + (i===0?'24':'8') + 'px;height:6px;border-radius:3px;' +
      'background:' + (i===0 ? dotColors[0] : '#333') + ';display:inline-block;transition:.3s;';
    dotsContainer.appendChild(dot);
  });

  var dots = dotsContainer.querySelectorAll('span');
  var current = 0;

  function showSlide(n) {
    slides[current].style.display = 'none';
    dots[current].style.background = '#333';
    dots[current].style.width = '8px';
    current = (n + slides.length) % slides.length;
    slides[current].style.display = 'flex';
    dots[current].style.background = dotColors[current] || '#ffd700';
    dots[current].style.width = '24px';
  }

  // 8 seconds per slide
  setInterval(function() { showSlide(current + 1); }, 8000);

  // Swipe support for mobile
  var startX = 0;
  var banner = document.getElementById('hero-banner');
  if (banner) {
    banner.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
    }, { passive: true });
    banner.addEventListener('touchend', function(e) {
      var diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        showSlide(diff > 0 ? current + 1 : current - 1);
      }
    }, { passive: true });
  }
})();


// =============================================
// SMART PAYMENT MODAL
// =============================================
window.openPaymentModal = function() {
  var modal = document.getElementById('smart-payment-modal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    // Reset to step 1
    backToStep1();
  }
};

window.closePaymentModal = function() {
  var modal = document.getElementById('smart-payment-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
};

// Close when tapping backdrop
document.addEventListener('click', function(e) {
  var modal = document.getElementById('smart-payment-modal');
  if (modal && e.target === modal) {
    window.closePaymentModal();
  }
});

window.chooseProductType = function(type) {
  document.getElementById('payment-step-1').style.display = 'none';
  document.getElementById('payment-step-kenya').style.display = 'none';
  document.getElementById('payment-step-international').style.display = 'none';
  document.getElementById('payment-step-digital').style.display = 'none';

  if (type === 'local-kenya')   document.getElementById('payment-step-kenya').style.display = 'block';
  if (type === 'international') document.getElementById('payment-step-international').style.display = 'block';
  if (type === 'digital')       document.getElementById('payment-step-digital').style.display = 'block';
};

window.backToStep1 = function() {
  document.getElementById('payment-step-kenya').style.display = 'none';
  document.getElementById('payment-step-international').style.display = 'none';
  document.getElementById('payment-step-digital').style.display = 'none';
  document.getElementById('payment-step-1').style.display = 'block';
};

window.copyText = function(text, btnId) {
  navigator.clipboard.writeText(text).then(function() {
    var btn = document.getElementById(btnId);
    if (btn) {
      btn.textContent = '✅ Copied!';
      btn.style.background = '#166534';
      setTimeout(function() {
        btn.textContent = 'Copy';
        btn.style.background = '#22c55e';
      }, 2000);
    }
  }).catch(function() {
    // Fallback for older Android
    var el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    var btn = document.getElementById(btnId);
    if (btn) {
      btn.textContent = '✅ Copied!';
      setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
    }
  });
};
