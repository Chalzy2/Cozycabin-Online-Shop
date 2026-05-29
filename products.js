// v5
/* =========================
   REFERRAL SYSTEM
========================= */
const urlParams = new URLSearchParams(window.location.search);
const referralCode = urlParams.get("ref");
if (referralCode) {
  localStorage.setItem("referralCode", referralCode);
}

const WHATSAPP_NUMBER = "254702468460";
const selectedOptions = {};

const products = {
  shoes: [
    {
      title: "Classic Black Sneakers",
      company: "Fashion",
      price: 1999,
      oldPrice: 2500,
      sizes: [41, 42, 43, 44],
      colors: ["Black", "Gray", "Gold"],
      description: "Comfortable lightweight sneakers for daily wear.",
      images: ["Images/black-shoes.webp", "Images/greyshoes.webp", "Images/gold-shoes.webp"]
    },
    {
      title: "Ladies Fashion Sneakers",
      company: "Fashion",
      price: 1999,
      oldPrice: 2500,
      sizes: [41, 42, 43, 44],
      colors: ["White", "Black"],
      description: "Stylish ladies sneakers with soft inner comfort.",
      images: ["Images/women-wshoe.webp", "Images/women-bshoes.webp"]
    },
    {
      title: "Calvin Klein Casual",
      company: "Calvin Klein",
      price: 3200,
      oldPrice: 4000,
      sizes: [40, 41, 42, 43, 44, 45],
      colors: ["Brown", "Blue", "Tan"],
      description: "Premium Calvin Klein casual sneakers with durable sole.",
      images: ["Images/calvin-brown.webp", "Images/calvin-blue.webp", "Images/calvin-tan.webp"]
    },
    {
      title: "Timberland Casual",
      company: "Timberland",
      price: 3200,
      oldPrice: 4000,
      sizes: [40, 41, 42, 43, 44, 45],
      colors: ["Black", "White"],
      description: "Elegant Timberland casual shoes for smart everyday fashion.",
      images: ["Images/timber-black.webp", "Images/timber-white.webp"]
    }
  ],
  shirts: [], hoodies: [], watches: [], bags: [],
  caps: [], jeans: [], jackets: [],
  cutlery: [], dispenser: [], hotpots: [], racks: [],
  flasks: [], bottles: [], cookers: [], blenders: [],
  solarlights: [], panels: [], inverters: [], batteries: [],
  streetlights: [], floodlights: [], chargers: [], fans: [],
  fridges: [], microwaves: [], washing: [], cookersapp: [],
  kettles: [], irons: [], heaters: [], fansapp: [],
  wallart: [], mirrors: [], flowers: [], lamps: [],
  carpets: [], curtains: [], frames: [], vases: [],
  duvets: [], bedsheets: [], blankets: [], pillows: [],
  mattress: [], covers: [], nets: [], towels: [],
  cameras: [], alarms: [], locks: [], doorbells: [],
  trackers: [], sensors: [], safes: [], recorders: [],
  speakers: [], radios: [], earbuds: [], tvbox: [],
  powerbanks: [], flashdisks: [], smartwatch: [], gaming: [],
  phones: [], laptops: [], tablets: [], routers: [],
  keyboards: [], mouse: [], printers: [], storage: []
};

/* =========================
   CORE FUNCTIONS
========================= */
function hideProducts() {
  var c = document.getElementById('products-container');
  if (!c) return;
  c.innerHTML = '';
  c.style.display = 'none';
}

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

window.closeAllSubmenus = function() {
  document.querySelectorAll('.minor-menu').forEach(function(m) {
    m.style.display = 'none';
  });
  hideProducts();
};

window.showProducts = function(category) {
  var container = document.getElementById('products-container');
  if (!container) { alert('No container!'); return; }

  container.innerHTML = '';
  Object.keys(selectedOptions).forEach(function(k) { delete selectedOptions[k]; });

  /* Move container after open submenu */
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
      thumbsHTML += '<img src="' + img + '" class="thumb-image' + (i === 0 ? ' thumb-active' : '') +
        '" data-index="' + index + '" data-img="' + img + '" loading="lazy" alt="View ' + (i+1) + '">';
    });

    var sizesHTML = '';
    (product.sizes || []).forEach(function(size) {
      sizesHTML += '<button class="size-btn" data-index="' + index + '" data-size="' + size + '">' + size + '</button>';
    });

    var colorsHTML = '';
    (product.colors || []).forEach(function(color) {
      colorsHTML += '<button class="color-btn" data-index="' + index + '" data-color="' + color + '">' + color + '</button>';
    });

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
      '</div>' +
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

function updateHint(index) {
  var hint = document.getElementById('selection-hint-' + index);
  if (!hint) return;
  var size = selectedOptions[index].size;
  var color = selectedOptions[index].color;
  if (size && color) { hint.textContent = '✅ Size ' + size + ' · ' + color + ' selected'; hint.style.color = '#22c55e'; }
  else if (size) { hint.textContent = 'Size ' + size + ' selected — now pick a color'; hint.style.color = '#f59e0b'; }
  else if (color) { hint.textContent = color + ' selected — now pick a size'; hint.style.color = '#f59e0b'; }
  else { hint.textContent = ''; }
}

/* =========================
   SINGLE EVENT LISTENER
   Handles ALL clicks via
   data attributes — no onclick
========================= */
document.addEventListener('click', function(e) {
  var el = e.target;

  /* GRID BTN (div) → toggleSub */
  var gridBtn = el.closest('.grid-btn');
  if (gridBtn) {
    var oc = gridBtn.getAttribute('onclick');
    if (oc) {
      var m = oc.match(/toggleSub\('([^']+)'\)/);
      if (m) { e.preventDefault(); window.toggleSub(m[1]); return; }
    }
  }

  /* MINOR BTN → showProducts */
  var minorBtn = el.closest('.minor-btn');
  if (minorBtn) {
    var oc2 = minorBtn.getAttribute('onclick');
    if (oc2) {
      var m2 = oc2.match(/showProducts\('([^']+)'\)/);
      if (m2) { e.preventDefault(); window.showProducts(m2[1]); return; }
    }
  }

  /* BACK BTN */
  if (el.closest('.back-btn')) {
    e.preventDefault();
    window.closeAllSubmenus();
    return;
  }

  /* THUMB IMAGE */
  if (el.classList.contains('thumb-image')) {
    var idx = el.getAttribute('data-index');
    var img = el.getAttribute('data-img');
    var main = document.getElementById('mainImage-' + idx);
    if (main) main.src = img;
    document.querySelectorAll('#thumbs-' + idx + ' .thumb-image').forEach(function(t) { t.classList.remove('thumb-active'); });
    el.classList.add('thumb-active');
    return;
  }

  /* SIZE BTN */
  if (el.classList.contains('size-btn')) {
    var idx2 = el.getAttribute('data-index');
    var size = el.getAttribute('data-size');
    document.querySelectorAll('#sizes-' + idx2 + ' .size-btn').forEach(function(b) { b.classList.remove('option-active'); });
    el.classList.add('option-active');
    if (!selectedOptions[idx2]) selectedOptions[idx2] = { size: null, color: null };
    selectedOptions[idx2].size = size;
    updateHint(idx2);
    return;
  }

  /* COLOR BTN */
  if (el.classList.contains('color-btn')) {
    var idx3 = el.getAttribute('data-index');
    var color = el.getAttribute('data-color');
    document.querySelectorAll('#colors-' + idx3 + ' .color-btn').forEach(function(b) { b.classList.remove('option-active'); });
    el.classList.add('option-active');
    if (!selectedOptions[idx3]) selectedOptions[idx3] = { size: null, color: null };
    selectedOptions[idx3].color = color;
    updateHint(idx3);
    return;
  }

  /* BUY BTN */
  if (el.classList.contains('buy-btn')) {
    var idx4 = el.getAttribute('data-index');
    var title = el.getAttribute('data-title');
    var price = parseInt(el.getAttribute('data-price'));
    var hint = document.getElementById('selection-hint-' + idx4);
    var size2 = selectedOptions[idx4] ? selectedOptions[idx4].size : null;
    var color2 = selectedOptions[idx4] ? selectedOptions[idx4].color : null;
    if (!size2 || !color2) {
      if (hint) { hint.textContent = '⚠️ Please select size and color first'; hint.style.color = '#ef4444'; }
      return;
    }
    var ref = localStorage.getItem('referralCode');
    var msg = '👋 Hello Cozycabin!\n\nI\'d like to order:\n\n🛍️ ' + title + '\n📏 Size: ' + size2 + '\n🎨 Color: ' + color2 + '\n💰 KES ' + price.toLocaleString() + (ref ? '\n🔗 Ref: ' + ref : '') + '\n\nPlease confirm. Thank you!';
    window.open('https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg), '_blank');
    return;
  }
});
