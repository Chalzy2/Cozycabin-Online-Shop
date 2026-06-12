// ============================================================
//  COZYCABIN — Share Button v2
//  - Primary action: COPY LINK instantly on tap
//  - Secondary: native share sheet button (optional)
//  - Works for all categories including variant products
//  - Zero loading time — copy is instant
// ============================================================

(function () {

  // ── 1. CSS ──────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [

    /* Share button row — two buttons side by side */
    '.cc-share-row {',
    '  display: flex;',
    '  gap: 6px;',
    '  margin-top: 8px;',
    '  width: 100%;',
    '}',

    /* Copy link button (primary — full width when alone) */
    '.cc-copy-btn {',
    '  flex: 1;',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  gap: 7px;',
    '  padding: 12px 14px;',
    '  border-radius: 12px;',
    '  background: rgba(245,200,66,0.10);',
    '  border: 1.5px solid rgba(245,200,66,0.35);',
    '  color: #f5c842;',
    '  font-family: "Outfit", "Inter", Arial, sans-serif;',
    '  font-size: 13px;',
    '  font-weight: 700;',
    '  cursor: pointer;',
    '  transition: background 0.15s, transform 0.1s;',
    '  -webkit-tap-highlight-color: transparent;',
    '}',
    '.cc-copy-btn:active {',
    '  background: rgba(245,200,66,0.22);',
    '  transform: scale(0.97);',
    '}',
    '.cc-copy-btn.copied {',
    '  background: rgba(29,185,84,0.15);',
    '  border-color: rgba(29,185,84,0.5);',
    '  color: #1db954;',
    '}',

    /* Share sheet button (secondary — small icon button) */
    '.cc-share-sheet-btn {',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  padding: 12px 14px;',
    '  border-radius: 12px;',
    '  background: rgba(255,255,255,0.04);',
    '  border: 1.5px solid rgba(255,255,255,0.10);',
    '  color: #6b7a84;',
    '  font-size: 16px;',
    '  cursor: pointer;',
    '  transition: background 0.15s, transform 0.1s;',
    '  -webkit-tap-highlight-color: transparent;',
    '  flex-shrink: 0;',
    '}',
    '.cc-share-sheet-btn:active {',
    '  background: rgba(255,255,255,0.10);',
    '  transform: scale(0.95);',
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
    '  border: 1px solid rgba(29,185,84,0.4);',
    '  opacity: 1;',
    '  transition: opacity 0.35s ease;',
    '  white-space: nowrap;',
    '  pointer-events: none;',
    '}',
    '.cc-toast.cc-fade {',
    '  opacity: 0;',
    '}',

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
  function buildUrl(category, idx) {
    return 'https://cozycabin.co.ke/?shop=' +
           encodeURIComponent(category) + '&idx=' + idx;
  }


  // ── 4. COPY LINK (instant — no loading) ────────────────
  window.ccCopyLink = function (btn, category, idx) {
    var url = buildUrl(category, idx);

    function onCopied() {
      // Flash button green
      btn.textContent = '✓ Link Copied!';
      btn.classList.add('copied');
      showToast('✅ Link copied — paste anywhere to share');
      setTimeout(function () {
        btn.innerHTML  = '🔗 Copy Link';
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


  // ── 5. SHARE SHEET (secondary — opens native sheet) ────
  window.ccShareSheet = function (title, price, category, idx) {
    var url      = buildUrl(category, idx);
    var priceStr = 'KES ' + Number(price).toLocaleString('en-KE');
    var text     = '🛍️ ' + title + '\n💰 ' + priceStr + '\n👉 Shop at Cozycabin Kenya:';

    if (navigator.share) {
      navigator.share({ title: title + ' — ' + priceStr, text: text, url: url })
        .catch(function () {}); // user cancelled — silent
    } else {
      // No native share — just copy instead
      window.ccCopyLink({ textContent:'', classList:{add:function(){},remove:function(){}} }, category, idx);
    }
  };


  // ── 6. BUILD BUTTON HTML ────────────────────────────────
  function makeBtns(title, price, category, idx) {
    var safeTitle = String(title).replace(/"/g, '&quot;');
    var hasShare  = !!navigator.share;

    var copyBtn = '<button class="cc-copy-btn" ' +
      'onclick="ccCopyLink(this,\'' + category + '\',' + idx + ')" ' +
      'data-share-title="' + safeTitle + '" ' +
      'data-share-price="' + price + '" ' +
      'data-share-cat="'   + category + '" ' +
      'data-share-idx="'   + idx + '">' +
      '🔗 Copy Link' +
    '</button>';

    // Only show share-sheet icon if browser supports it
    var sheetBtn = hasShare
      ? '<button class="cc-share-sheet-btn" title="Share via apps" ' +
          'onclick="ccShareSheet(\'' + safeTitle + '\',' + price + ',\'' + category + '\',' + idx + ')">' +
          '↗' +
        '</button>'
      : '';

    return '<div class="cc-share-row">' + copyBtn + sheetBtn + '</div>';
  }


  // ── 7. INJECT INTO CARDS ────────────────────────────────
  var _currentCategory = null;

  function injectShareButtons(category) {
    var container = document.getElementById('products-container');
    if (!container) return;

    var cards = container.querySelectorAll('.product-card');
    cards.forEach(function (card, idx) {
      if (card.querySelector('.cc-share-row')) return; // already injected

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
      wrap.innerHTML = makeBtns(product.title, price, category, idx);
      var shareRow = wrap.firstChild;

      // Position: after .cart-btn, before details/more-details
      var cartBtn = card.querySelector('.cart-btn');
      var details = card.querySelector('.details-box, details, .more-details');

      if (cartBtn && cartBtn.parentNode) {
        cartBtn.parentNode.insertBefore(shareRow, cartBtn.nextSibling);
      } else if (details) {
        card.insertBefore(shareRow, details);
      } else {
        card.appendChild(shareRow);
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

})();
