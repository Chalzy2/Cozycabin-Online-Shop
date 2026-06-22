// ============================================================
//  COZYCABIN — Compact Product Share Buttons  v3
//  [ WhatsApp ] [ Copy ] [ Facebook ] [ Telegram ]
//  42×42 icon buttons, brand colors, floats over the bottom-
//  right corner of the product image — never covers the photo.
//  Replaces the old large text buttons. Legacy ?shop=&idx=
//  link generation was already removed in v2 — this version
//  only changes the visual/behavior layer, links are unchanged
//  (always https://cozycabin.co.ke/?id=PRODUCT_ID).
// ============================================================

(function () {

  // ── 1. CSS ──────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [

    /* Row of 4 compact icon buttons, floats over the image's
       bottom-right corner — never the center, so it never
       blocks the product photo itself. */
    '.cc-pshare-row {',
    '  position: absolute;',
    '  right: 10px;',
    '  bottom: 10px;',
    '  z-index: 6;',
    '  display: flex;',
    '  flex-direction: row;',
    '  flex-wrap: nowrap;',
    '  gap: 8px;',
    '  opacity: .62;',
    '  transition: opacity .25s ease, transform .25s ease;',
    '}',
    '.cc-pshare-row.cc-revealed { opacity: 1; }',

    /* Scroll state — shrink slightly + dim further while the
       page is actively scrolling, settle back when it stops */
    'body.cc-scrolling .cc-pshare-row {',
    '  transform: scale(.86);',
    '  opacity: .4;',
    '}',
    'body.cc-scrolling .cc-pshare-row.cc-revealed { opacity: .85; }',

    /* Each icon button — 42×42, rounded, brand color, shadow */
    '.cc-pshare-btn {',
    '  width: 42px;',
    '  height: 42px;',
    '  border-radius: 10px;',
    '  border: none;',
    '  padding: 0;',
    '  flex-shrink: 0;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  cursor: pointer;',
    '  position: relative;',
    '  box-shadow: 0 3px 10px rgba(0,0,0,.32);',
    '  transition: transform .15s ease, box-shadow .15s ease;',
    '  -webkit-tap-highlight-color: transparent;',
    '}',
    '.cc-pshare-btn svg {',
    '  width: 20px; height: 20px; fill: #fff; pointer-events: none;',
    '}',
    '.cc-pshare-btn:hover  { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,.4); }',
    '.cc-pshare-btn:active { transform: scale(.90); }',

    /* Official brand colors */
    '.cc-pshare-wa   { background: #25D366; }',  /* WhatsApp */
    '.cc-pshare-copy { background: #1B5E20; }',  /* Cozy Green */
    '.cc-pshare-fb   { background: #1877F2; }',  /* Facebook  */
    '.cc-pshare-tg   { background: #229ED9; }',  /* Telegram  */
    '.cc-pshare-copy.copied { background: #F9A825; }',

    /* Tooltip — desktop hover / keyboard focus only */
    '.cc-pshare-btn::after {',
    '  content: attr(data-tip);',
    '  position: absolute;',
    '  bottom: 50px;',
    '  left: 50%;',
    '  transform: translateX(-50%) translateY(4px);',
    '  background: #1B5E20;',
    '  color: #fff;',
    '  font-family: "Outfit", "Inter", Arial, sans-serif;',
    '  font-size: 11px;',
    '  font-weight: 600;',
    '  padding: 4px 9px;',
    '  border-radius: 6px;',
    '  white-space: nowrap;',
    '  opacity: 0;',
    '  pointer-events: none;',
    '  transition: opacity .15s ease, transform .15s ease;',
    '}',
    '.cc-pshare-btn:hover::after, .cc-pshare-btn:focus-visible::after {',
    '  opacity: 1; transform: translateX(-50%) translateY(0);',
    '}',

    '@media (max-width: 480px) {',
    '  .cc-pshare-row { right: 8px; bottom: 8px; gap: 7px; }',
    '  .cc-pshare-btn { width: 40px; height: 40px; border-radius: 9px; }',
    '  .cc-pshare-btn svg { width: 19px; height: 19px; }',
    '}',

    /* Toast */
    '.cc-toast {',
    '  position: fixed;',
    '  bottom: 84px;',
    '  left: 50%;',
    '  transform: translateX(-50%) translateY(0);',
    '  background: #0f1316;',
    '  color: #fff;',
    '  padding: 11px 22px;',
    '  border-radius: 24px;',
    '  font-size: 13px;',
    '  font-weight: 600;',
    '  font-family: "Outfit", "Inter", Arial, sans-serif;',
    '  z-index: 99999;',
    '  box-shadow: 0 6px 24px rgba(0,0,0,0.55);',
    '  border: 1px solid rgba(27,94,32,0.5);',
    '  opacity: 1;',
    '  transition: opacity 0.35s ease;',
    '  white-space: nowrap;',
    '  pointer-events: none;',
    '}',
    '.cc-toast.cc-fade { opacity: 0; }',

  ].join('');
  document.head.appendChild(style);


  // ── 2. TOAST ────────────────────────────────────────────
  function showToast(msg) {
    var old = document.querySelector('.cc-toast');
    if (old) old.remove();
    var t = document.createElement('div');
    t.className   = 'cc-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () {
      t.classList.add('cc-fade');
      setTimeout(function () { t.remove(); }, 380);
    }, 2200);
  }


  // ── 3. BUILD SHARE URL ──────────────────────────────────
  // Permanent link, built directly from product.id — never
  // generates legacy ?shop=&idx= links. (functions/_middleware.js
  // and cc-deeplink.js still understand old ?shop=&idx= links for
  // anyone who has one saved/shared already — this just stops
  // creating new ones.)
  function buildUrl(productId) {
    return `https://cozycabin.co.ke/?id=${productId}`;
  }


  // ── 4. ICON SVGS (white, 24×24 viewBox) ────────────────
  var ICONS = {
    whatsapp:
      '<svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471' +
      '-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297' +
      '-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018' +
      '-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198' +
      '.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51' +
      '-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04' +
      ' 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306' +
      ' 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006' +
      '-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>' +
      '<path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.112 1.523 5.836L0 24' +
      'l6.335-1.501A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12' +
      ' 0zm0 21.818a9.812 9.812 0 0 1-5.003-1.371l-.36-.213-3.76.891.946-3.668' +
      '-.234-.376A9.784 9.784 0 0 1 2.182 12C2.182 6.579 6.578 2.182 12 2.182' +
      'c5.42 0 9.818 4.397 9.818 9.818 0 5.42-4.397 9.818-9.818 9.818z"/></svg>',
    facebook:
      '<svg viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128' +
      ' 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195' +
      ' 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.987' +
      'C18.343 21.128 22 16.991 22 12z"/></svg>',
    telegram:
      '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
    link:
      '<svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24' +
      ' 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1' +
      ' 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>',
    check:
      '<svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>',
  };


  // ── 5. SHARE ACTIONS ─────────────────────────────────────
  function buildShareText(title, price) {
    var priceStr = 'KES ' + Number(price).toLocaleString('en-KE');
    return '🛍️ ' + title + '\n💰 ' + priceStr + '\n👉 Shop at Cozycabin Kenya:';
  }

  window.ccShareWhatsApp = function (productId, title, price) {
    var url  = buildUrl(productId);
    var text = buildShareText(title, price) + '\n' + url;
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
  };

  window.ccCopyLink = function (btn, productId) {
    var url = buildUrl(productId);
    var iconEl = btn.querySelector('svg');

    function onCopied() {
      if (iconEl) iconEl.outerHTML = ICONS.check;
      btn.classList.add('copied');
      showToast('✅ Link copied — paste anywhere to share');
      setTimeout(function () {
        var icon = btn.querySelector('svg');
        if (icon) icon.outerHTML = ICONS.link;
        btn.classList.remove('copied');
      }, 2000);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(onCopied)
        .catch(function () { fallbackCopy(url, onCopied); });
    } else {
      fallbackCopy(url, onCopied);
    }
  };

  function fallbackCopy(text, cb) {
    var ta       = document.createElement('textarea');
    ta.value     = text;
    ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    try { document.execCommand('copy'); cb(); }
    catch(e) { prompt('Copy this link:', text); }
    document.body.removeChild(ta);
  }

  window.ccShareFacebook = function (productId) {
    var url = buildUrl(productId);
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url),
      '_blank', 'noopener,width=600,height=600');
  };

  window.ccShareTelegram = function (productId, title, price) {
    var url  = buildUrl(productId);
    var text = '🛍️ ' + title + ' — KES ' + Number(price).toLocaleString('en-KE');
    window.open('https://t.me/share/url?url=' + encodeURIComponent(url) +
      '&text=' + encodeURIComponent(text), '_blank', 'noopener');
  };


  // ── 6. BUILD BUTTON HTML ────────────────────────────────
  // Layout order: WhatsApp, Copy, Facebook, Telegram
  function makeBtns(title, price, productId) {
    var safeTitle = String(title).replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    var waBtn = '<button class="cc-pshare-btn cc-pshare-wa" type="button" ' +
      'title="WhatsApp" data-tip="WhatsApp" aria-label="Share on WhatsApp" ' +
      'onclick="ccShareWhatsApp(\'' + productId + '\',\'' + safeTitle + '\',' + price + ')">' +
      ICONS.whatsapp + '</button>';

    var copyBtn = '<button class="cc-pshare-btn cc-pshare-copy" type="button" ' +
      'title="Copy Link" data-tip="Copy Link" aria-label="Copy product link" ' +
      'onclick="ccCopyLink(this,\'' + productId + '\')">' +
      ICONS.link + '</button>';

    var fbBtn = '<button class="cc-pshare-btn cc-pshare-fb" type="button" ' +
      'title="Facebook" data-tip="Facebook" aria-label="Share on Facebook" ' +
      'onclick="ccShareFacebook(\'' + productId + '\')">' +
      ICONS.facebook + '</button>';

    var tgBtn = '<button class="cc-pshare-btn cc-pshare-tg" type="button" ' +
      'title="Telegram" data-tip="Telegram" aria-label="Share on Telegram" ' +
      'onclick="ccShareTelegram(\'' + productId + '\',\'' + safeTitle + '\',' + price + ')">' +
      ICONS.telegram + '</button>';

    return '<div class="cc-pshare-row">' + waBtn + copyBtn + fbBtn + tgBtn + '</div>';
  }


  // ── 7. INJECT INTO CARDS ────────────────────────────────
  // Lives inside .product-gallery (which is already
  // position:relative) so it floats over the image's
  // bottom-right corner — never the center of the photo.
  var _currentCategory = null;

  function injectShareButtons(category) {
    var container = document.getElementById('products-container');
    if (!container) return;

    var cards = container.querySelectorAll('.product-card');
    cards.forEach(function (card, idx) {
      if (card.querySelector('.cc-pshare-row')) return; // already injected

      var catData = (typeof products !== 'undefined') ? products[category] : null;
      var product = catData ? catData[idx] : null;
      if (!product) return;

      // Support both standard products (product.price)
      // and variant products (product.variants[0].price)
      var price = product.price;
      if (!price && product.variants && product.variants[0]) {
        price = product.variants[0].price || 0;
      }

      var wrap = document.createElement('div');
      wrap.innerHTML = makeBtns(product.title, price, product.id);
      var shareRow = wrap.firstChild;

      // Preferred anchor: inside the image gallery, bottom-right
      // corner overlay — keeps it off the product photo itself.
      var gallery = card.querySelector('.product-gallery');
      if (gallery) {
        gallery.appendChild(shareRow);
      } else {
        // Fallback for any card without a .product-gallery wrapper
        var cartBtn = card.querySelector('.cart-btn');
        var details = card.querySelector('.details-box, details, .more-details');
        if (cartBtn && cartBtn.parentNode) {
          cartBtn.parentNode.insertBefore(shareRow, cartBtn.nextSibling);
        } else if (details) {
          card.insertBefore(shareRow, details);
        } else {
          card.appendChild(shareRow);
        }
      }
    });
  }


  // ── 8. PATCH showProducts ───────────────────────────────
  (function patchShowProducts() {
    var elapsed = 0;
    function tryPatch() {
      if (typeof window.showProducts !== 'function') {
        elapsed += 10;
        if (elapsed < 5000) setTimeout(tryPatch, 10);
        return;
      }
      var _orig = window.showProducts;
      window.showProducts = function (category) {
        _currentCategory = category;
        _orig(category);
        injectShareButtons(category);
        setTimeout(function () { injectShareButtons(category); }, 100);
        setTimeout(function () { injectShareButtons(category); }, 400);
      };
    }
    tryPatch();
  })();


  // ── 9. MUTATION OBSERVER (catch async renders) ──────────
  document.addEventListener('DOMContentLoaded', function () {
    var container = document.getElementById('products-container');
    if (!container) return;
    if (window.MutationObserver) {
      new MutationObserver(function () {
        if (_currentCategory) injectShareButtons(_currentCategory);
      }).observe(container, { childList: true, subtree: false });
    }
  });


  // ── 10. SCROLL → SHRINK, TAP → REVEAL ───────────────────
  // While the page is actively scrolling, every share row
  // shrinks and dims slightly so it never distracts from
  // browsing. Tapping a card (or a button itself) brings its
  // row to full opacity for a few seconds.
  (function scrollAndRevealController() {
    var scrollTimer = null;
    window.addEventListener('scroll', function () {
      document.body.classList.add('cc-scrolling');
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        document.body.classList.remove('cc-scrolling');
      }, 500);
    }, { passive: true });

    var revealTimers = new WeakMap();
    function reveal(row) {
      if (!row) return;
      row.classList.add('cc-revealed');
      clearTimeout(revealTimers.get(row));
      revealTimers.set(row, setTimeout(function () {
        row.classList.remove('cc-revealed');
      }, 3000));
    }

    document.addEventListener('pointerdown', function (e) {
      var card = e.target.closest && e.target.closest('.product-card');
      if (!card) return;
      reveal(card.querySelector('.cc-pshare-row'));
    }, { passive: true });
  })();

})();
