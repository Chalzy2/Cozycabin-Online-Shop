/* =========================
   REFERRAL SYSTEM
========================= */

const urlParams = new URLSearchParams(window.location.search);
const referralCode = urlParams.get("ref");
if (referralCode) {
  localStorage.setItem("referralCode", referralCode);
}

/* =========================
   WHATSAPP NUMBER
   Change to your real number
   Country code, no + or spaces
========================= */

const WHATSAPP_NUMBER = "254702468460";

/* =========================
   SELECTION STATE
========================= */

const selectedOptions = {};

/* =========================
   PRODUCTS DATABASE
========================= */

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
  kettles: [], irons: [], heaters: [], fansapp: []

};

/* =========================
   TOGGLE SUBMENU
========================= */

window.toggleSub = function(id) {

  document.querySelectorAll('.minor-menu').forEach(function(menu) {
    if (menu.id !== id) menu.style.display = 'none';
  });

  var target = document.getElementById(id);
  if (!target) return;

  var isOpen = target.style.display === 'block';
  target.style.display = isOpen ? 'none' : 'block';

  if (isOpen) hideProducts();
};

/* =========================
   CLOSE ALL SUBMENUS
========================= */

window.closeAllSubmenus = function() {
  document.querySelectorAll('.minor-menu').forEach(function(menu) {
    menu.style.display = 'none';
  });
  hideProducts();
};

/* =========================
   HIDE PRODUCTS
========================= */

function hideProducts() {
  var container = document.getElementById('products-container');
  if (!container) return;
  container.innerHTML = '';
  container.style.display = 'none';
}

/* =========================
   SHOW PRODUCTS
========================= */

window.showProducts = function(category) {

  var container = document.getElementById('products-container');

  if (!container) {
    console.error('ERROR: No element with id="products-container" found on this page.');
    return;
  }

  /* Clear old state */
  container.innerHTML = '';
  Object.keys(selectedOptions).forEach(function(k) {
    delete selectedOptions[k];
  });

  /* Empty category */
  if (!products[category] || products[category].length === 0) {
    container.style.display = 'block';
    container.innerHTML =
      '<div class="empty-products">' +
        '<h2>No Products Yet</h2>' +
        '<p>Products for this category will appear here soon.</p>' +
      '</div>';
    container.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  /* Build cards */
  products[category].forEach(function(product, index) {

    selectedOptions[index] = { size: null, color: null };

    /* Thumbnail HTML */
    var thumbsHTML = '';
    product.images.forEach(function(img, i) {
      thumbsHTML +=
        '<img src="' + img + '" ' +
        'class="thumb-image' + (i === 0 ? ' thumb-active' : '') + '" ' +
        'onclick="changeImage(' + index + ', \'' + img + '\', this)" ' +
        'loading="lazy" alt="View ' + (i + 1) + '">';
    });

    /* Sizes HTML */
    var sizesHTML = '';
    (product.sizes || []).forEach(function(size) {
      sizesHTML +=
        '<button class="size-btn" ' +
        'onclick="selectSize(' + index + ', ' + size + ', this)">' +
        size + '</button>';
    });

    /* Colors HTML */
    var colorsHTML = '';
    (product.colors || []).forEach(function(color) {
      colorsHTML +=
        '<button class="color-btn" ' +
        'onclick="selectColor(' + index + ', \'' + color + '\', this)">' +
        color + '</button>';
    });

    var card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML =

      /* Gallery */
      '<div class="product-gallery">' +
        '<img id="mainImage-' + index + '" ' +
        'src="' + product.images[0] + '" ' +
        'class="main-product-image" loading="lazy" alt="' + product.title + '">' +
      '</div>' +

      /* Thumbnails */
      '<div class="thumbnail-row" id="thumbs-' + index + '">' +
        thumbsHTML +
      '</div>' +

      /* Info */
      '<h2 class="product-title">' + product.title + '</h2>' +
      '<p class="company-name">' + product.company + '</p>' +
      '<p class="product-description">' + product.description + '</p>' +

      /* Price */
      '<div class="price-box">' +
        '<span class="new-price">KES ' + product.price.toLocaleString() + '</span>' +
        '<span class="old-price">KES ' + product.oldPrice.toLocaleString() + '</span>' +
      '</div>' +

      /* Sizes */
      '<div class="sizes-box">' +
        '<h4>Select Size</h4>' +
        '<div class="sizes-row" id="sizes-' + index + '">' + sizesHTML + '</div>' +
      '</div>' +

      /* Colors */
      '<div class="colors-box">' +
        '<h4>Select Color</h4>' +
        '<div class="colors-row" id="colors-' + index + '">' + colorsHTML + '</div>' +
      '</div>' +

      /* Hint */
      '<p id="selection-hint-' + index + '" class="selection-hint"></p>' +

      /* Buttons */
      '<button class="buy-btn" ' +
      'onclick="buyNow(' + index + ', \'' + product.title.replace(/'/g, "\\'") + '\', ' + product.price + ')">' +
        '🛒 Order via WhatsApp' +
      '</button>' +

      '<button class="cart-btn">Add to Cart</button>' +

      /* Details */
      '<details class="details-box">' +
        '<summary>More Details</summary>' +
        '<p>Premium quality product. Comfortable, durable, stylish and suitable for daily use.</p>' +
      '</details>';

    container.appendChild(card);
  });

  /* Show grid and scroll */
  container.style.display = 'grid';
  container.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* =========================
   CHANGE IMAGE
========================= */

window.changeImage = function(index, image, thumbEl) {
  var main = document.getElementById('mainImage-' + index);
  if (main) main.src = image;

  document.querySelectorAll('#thumbs-' + index + ' .thumb-image').forEach(function(t) {
    t.classList.remove('thumb-active');
  });
  if (thumbEl) thumbEl.classList.add('thumb-active');
};

/* =========================
   SELECT SIZE
========================= */

window.selectSize = function(index, size, btn) {
  document.querySelectorAll('#sizes-' + index + ' .size-btn').forEach(function(b) {
    b.classList.remove('option-active');
  });
  btn.classList.add('option-active');
  selectedOptions[index].size = size;
  updateHint(index);
};

/* =========================
   SELECT COLOR
========================= */

window.selectColor = function(index, color, btn) {
  document.querySelectorAll('#colors-' + index + ' .color-btn').forEach(function(b) {
    b.classList.remove('option-active');
  });
  btn.classList.add('option-active');
  selectedOptions[index].color = color;
  updateHint(index);
};

/* =========================
   UPDATE HINT
========================= */

function updateHint(index) {
  var hint = document.getElementById('selection-hint-' + index);
  if (!hint) return;
  var size  = selectedOptions[index].size;
  var color = selectedOptions[index].color;

  if (size && color) {
    hint.textContent = '✅ Size ' + size + ' · ' + color + ' selected';
    hint.style.color = '#22c55e';
  } else if (size) {
    hint.textContent = 'Size ' + size + ' selected — now pick a color';
    hint.style.color = '#f59e0b';
  } else if (color) {
    hint.textContent = color + ' selected — now pick a size';
    hint.style.color = '#f59e0b';
  } else {
    hint.textContent = '';
  }
}

/* =========================
   BUY NOW — WHATSAPP
========================= */

window.buyNow = function(index, productName, price) {
  var hint  = document.getElementById('selection-hint-' + index);
  var size  = selectedOptions[index] ? selectedOptions[index].size  : null;
  var color = selectedOptions[index] ? selectedOptions[index].color : null;

  if (!size || !color) {
    if (hint) {
      hint.textContent = (!size && !color)
        ? '⚠️ Please select a size and color first'
        : (!size ? '⚠️ Please select a size before ordering'
                 : '⚠️ Please select a color before ordering');
      hint.style.color = '#ef4444';
    }
    return;
  }

  var referral = localStorage.getItem('referralCode');
  var referralLine = referral ? '\n🔗 Referral Code: ' + referral : '';

  var message =
    '👋 Hello Cozycabin!\n\n' +
    "I'd like to place an order:\n\n" +
    '🛍️ Product: ' + productName + '\n' +
    '📏 Size: '    + size        + '\n' +
    '🎨 Color: '   + color       + '\n' +
    '💰 Price: KES ' + price.toLocaleString() +
    referralLine +
    '\n\nPlease confirm availability. Thank you!';

  window.open(
    'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message),
    '_blank'
  );
};
