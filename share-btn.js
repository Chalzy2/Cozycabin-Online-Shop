// ============================================================
//  COZYCABIN — Compact Product Share Buttons  v4
//  [ WhatsApp ] [ Copy ] [ Facebook ] [ Telegram ]
//  42×42 icon buttons, brand colors, floats over the bottom-
//  right corner of the product image — never covers the photo.
//  Every link uses https://cozycabin.co.ke/?id=PRODUCT_ID
//  sourced from product.id via data-product-id attribute.
//  No ?shop= or ?idx= links are ever created.
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
    '.cc-pshare-li   { background: #0A66C2; }',  /* LinkedIn */
    '.cc-pshare-tw   { background: #000000; }',  /* X/Twitter */
    '.cc-pshare-nat  { background: #7C3AED; }',  /* Native share */

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
    linkedin:
      '<svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037' +
      '-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85' +
      ' 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064' +
      ' 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729' +
      'v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0' +
      ' 22.222 0h.003z"/></svg>',
    twitter:
      '<svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714' +
      '-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.622 5.905-5.622zm-1.161' +
      ' 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    native:
      '<svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09' +
      '-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3' +
      '-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s' +
      '1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92' +
      ' 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>',
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

  window.ccShareLinkedIn = function (productId) {
    var url = buildUrl(productId);
    window.open('https://www.linkedin.com/sharing/share-offsite/?url=' +
      encodeURIComponent(url), '_blank', 'noopener,width=600,height=600');
  };

  window.ccShareTwitter = function (productId, title, price) {
    var url  = buildUrl(productId);
    var text = '🛍️ ' + title + ' — KES ' + Number(price).toLocaleString('en-KE') +
               ' | Cozycabin Kenya';
    window.open('https://x.com/intent/tweet?text=' + encodeURIComponent(text) +
      '&url=' + encodeURIComponent(url), '_blank', 'noopener');
  };

  window.ccShareNative = function (productId, title, price) {
    var url  = buildUrl(productId);
    var text = '🛍️ ' + title + ' — KES ' + Number(price).toLocaleString('en-KE');
    if (navigator.share) {
      navigator.share({ title: title, text: text, url: url })
        .catch(function () {}); // user cancelled — ignore
    } else {
      // Fallback: copy link
      var dummy = { querySelector: function() { return null; } };
      window.ccCopyLink(dummy, productId);
    }
  };


  // ── 6. BUILD BUTTON HTML ────────────────────────────────
  // Layout order: WhatsApp, Copy, Facebook, Telegram



  // ── 7. INJECT SHARE BUTTONS INTO CARDS ──────────────────
  // KEY DESIGN: share buttons do NOT bake productId at inject time.
  // Each button reads data-product-id from its own card at CLICK time.
  // This means even if injection runs before all attributes are set,
  // the correct product is always shared — never product #1.
  function injectShareButtons(category) {
    var container = document.getElementById('products-container');
    if (!container) return;

    var cards = container.querySelectorAll('.product-card');
    cards.forEach(function (card) {
      if (card.querySelector('.cc-pshare-row')) return; // already done

      // ── Read productId NOW (for title/price lookup only) ──────
      // We search the entire card for the buy button with data-product-id.
      // products.js sets this on EVERY buy-btn (standard + variant cards).
      var buyBtn    = card.querySelector('[data-product-id]');
      var productId = buyBtn ? buyBtn.getAttribute('data-product-id') : '';

      // ── Get title + price for tooltip/WA text ────────────────
      // These are display-only — the actual share URL is built at
      // click time using the live data-product-id on the card.
      var product = productId && window.CC_PRODUCTS_BY_ID
        ? (window.CC_PRODUCTS_BY_ID[productId] || {}).product : null;

      var title = product
        ? (product.title || '')
        : (card.querySelector('.product-title, h2') || {}).textContent || '';

      var price = 0;
      if (product) {
        price = product.price ||
          (product.variants && product.variants[0] && product.variants[0].price) || 0;
      }

      // ── Build share row with DELEGATED onclick ────────────────
      // Buttons use data-action attributes. A single delegated listener
      // on the container reads the CURRENT data-product-id from the card
      // at click time — correct for every card, every time.
      var row = document.createElement('div');
      row.className = 'cc-pshare-row';
      row.innerHTML =
        btn('cc-pshare-wa',   'WhatsApp', 'wa',   ICONS.whatsapp) +
        btn('cc-pshare-copy', 'Copy Link','copy',  ICONS.link)     +
        btn('cc-pshare-fb',   'Facebook', 'fb',    ICONS.facebook) +
        btn('cc-pshare-tg',   'Telegram', 'tg',    ICONS.telegram) +
        btn('cc-pshare-li',   'LinkedIn', 'li',    ICONS.linkedin) +
        btn('cc-pshare-tw',   'Twitter/X','tw',    ICONS.twitter)  +
        (navigator.share ? btn('cc-pshare-nat','Share','nat', ICONS.native) : '');

      // Inject: inside .product-gallery (floats over image corner)
      var gallery = card.querySelector('.product-gallery, .cc-gallery-wrap, .gallery');
      if (gallery) {
        gallery.style.position = gallery.style.position || 'relative';
        gallery.appendChild(row);
      } else {
        // Fallback: after the buy button
        var after = card.querySelector('.buy-btn, .cart-btn');
        if (after && after.parentNode) {
          after.parentNode.insertBefore(row, after.nextSibling);
        } else {
          card.appendChild(row);
        }
      }
    });
  }

  // Helper: build one icon button with data-action (no onclick string)
  function btn(cls, label, action, icon) {
    return '<button class="cc-pshare-btn ' + cls + '" type="button" ' +
      'data-tip="' + label + '" aria-label="' + label + '" ' +
      'data-cc-action="' + action + '">' + icon + '</button>';
  }

  // ── DELEGATED CLICK HANDLER ──────────────────────────────
  // Runs once. Reads productId from the card at click time —
  // the buy-btn's data-product-id is always the correct product.
  document.addEventListener('DOMContentLoaded', function () {
    var container = document.getElementById('products-container');
    if (!container) return;

    container.addEventListener('click', function (e) {
      var shareBtn = e.target.closest && e.target.closest('[data-cc-action]');
      if (!shareBtn) return;
      e.stopPropagation();

      // Walk up to the card to get the live productId
      var card      = shareBtn.closest('.product-card');
      if (!card) return;
      var buyBtn    = card.querySelector('[data-product-id]');
      var productId = buyBtn ? buyBtn.getAttribute('data-product-id') : '';
      if (!productId) return;

      // Get title + price fresh from CC_PRODUCTS_BY_ID
      var product = window.CC_PRODUCTS_BY_ID
        ? (window.CC_PRODUCTS_BY_ID[productId] || {}).product : null;
      var title = product ? (product.title || '') : '';
      var price = product
        ? (product.price || (product.variants && product.variants[0] && product.variants[0].price) || 0)
        : 0;

      var action = shareBtn.getAttribute('data-cc-action');

      if (action === 'wa')   { ccShareWhatsApp(productId, title, price); return; }
      if (action === 'copy') { ccCopyLink(shareBtn, productId); return; }
      if (action === 'fb')   { ccShareFacebook(productId); return; }
      if (action === 'tg')   { ccShareTelegram(productId, title, price); return; }
      if (action === 'li')   { ccShareLinkedIn(productId); return; }
      if (action === 'tw')   { ccShareTwitter(productId, title, price); return; }
      if (action === 'nat')  { ccShareNative(productId, title, price); return; }
    });
  });


  // ── 8. UPDATE URL BAR on card click ────────────────────
  // Clicking any product card updates the URL to ?id=product-id
  // so copy-from-address-bar, browser share, and back button
  // all use the permanent link automatically.
  document.addEventListener('click', function (e) {
    var card = e.target.closest && e.target.closest('.product-card');
    if (!card) return;
    var buyBtn    = card.querySelector('[data-product-id]');
    var productId = buyBtn ? buyBtn.getAttribute('data-product-id') : null;
    if (!productId) return;
    var newUrl = window.location.origin + window.location.pathname + '?id=' + productId;
    try { window.history.replaceState(null, '', newUrl); } catch (_) {}
  }, { passive: true });


  // ── 9. HOOK showProducts WITHOUT WRAPPING IT ────────────
  // Previous approach: wrapping window.showProducts created a stale
  // closure chain with the other wrappers in products.js and broke
  // category navigation.
  //
  // New approach: intercept via a property setter on window so we
  // are notified whenever ANY code assigns to window.showProducts.
  // We then decorate it once, cleanly, without re-wrapping.
  //
  // If Object.defineProperty is unavailable (old browsers), we fall
  // back to a single timed injection — safe because MutationObserver
  // will catch any cards that render after the timeout.
  (function hookShowProducts() {
    var _hooked = false;

    function decorateOnce(original) {
      if (_hooked) return;
      _hooked = true;
      var decorated = function (category) {
        _currentCategory = category;
        original.call(this, category);
        // Inject immediately + retry in case cards are async
        injectShareButtons(category);
        setTimeout(function () { injectShareButtons(category); }, 120);
        setTimeout(function () { injectShareButtons(category); }, 450);
      };
      // Copy any properties the original may have
      Object.keys(original).forEach(function (k) { decorated[k] = original[k]; });
      // Replace on window without triggering our own setter
      Object.defineProperty(window, 'showProducts', {
        value:        decorated,
        writable:     true,
        configurable: true,
        enumerable:   true
      });
    }

    // If showProducts is already defined, decorate now
    if (typeof window.showProducts === 'function') {
      decorateOnce(window.showProducts);
      return;
    }

    // Otherwise watch for it to be defined
    try {
      var _pending = undefined;
      Object.defineProperty(window, 'showProducts', {
        configurable: true,
        enumerable:   true,
        get: function () { return _pending; },
        set: function (fn) {
          _pending = fn;
          if (typeof fn === 'function') {
            // Defer so the setter chain finishes before we decorate
            setTimeout(function () { decorateOnce(_pending); }, 0);
          }
        }
      });
    } catch (e) {
      // Object.defineProperty not supported — single timed fallback
      var t = 0;
      var poll = setInterval(function () {
        t += 20;
        if (typeof window.showProducts === 'function') {
          clearInterval(poll);
          decorateOnce(window.showProducts);
        }
        if (t > 5000) clearInterval(poll);
      }, 20);
    }
  })();


  // ── 10. MUTATION OBSERVER (catch async renders) ──────────
  document.addEventListener('DOMContentLoaded', function () {
    var container = document.getElementById('products-container');
    if (!container) return;
    if (window.MutationObserver) {
      new MutationObserver(function () {
        if (_currentCategory) injectShareButtons(_currentCategory);
      }).observe(container, { childList: true, subtree: false });
    }
  });


  // ── 11. SCROLL → SHRINK, TAP → REVEAL ───────────────────
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
