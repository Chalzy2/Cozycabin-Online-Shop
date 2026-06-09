// ============================================================
//  COZYCABIN — Share Button
//  Adds a "🔗 Share" button to every product card
//  Works for: Standard cards, Variant cards, all categories
//  Position: After "Add to Cart", before "More Details"
//
//  INSTALL: Add this ONE line to the bottom of index.html,
//  just before </body>, after your other scripts:
//
//    <script src="share-btn.js"></script>
// ============================================================

(function () {

  // ── 1. INJECT CSS (once) ──────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [

    /* Share button itself */
    '.cc-share-btn {',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  gap: 8px;',
    '  width: 100%;',
    '  padding: 13px 18px;',
    '  margin-top: 8px;',
    '  border: 1.5px solid rgba(255,255,255,0.13);',
    '  border-radius: 12px;',
    '  background: rgba(255,255,255,0.04);',
    '  color: #e2e8f0;',
    '  font-family: "Outfit", Arial, sans-serif;',
    '  font-size: 14px;',
    '  font-weight: 700;',
    '  cursor: pointer;',
    '  letter-spacing: 0.02em;',
    '  transition: background 0.2s, border-color 0.2s, transform 0.15s;',
    '  -webkit-tap-highlight-color: transparent;',
    '}',
    '.cc-share-btn:hover, .cc-share-btn:active {',
    '  background: rgba(255,255,255,0.09);',
    '  border-color: rgba(255,255,255,0.28);',
    '  transform: scale(0.98);',
    '}',

    /* Toast notification */
    '.cc-share-toast {',
    '  position: fixed;',
    '  bottom: 88px;',
    '  left: 50%;',
    '  transform: translateX(-50%) translateY(0);',
    '  background: #1a1a2e;',
    '  color: #fff;',
    '  padding: 12px 22px;',
    '  border-radius: 22px;',
    '  font-size: 13px;',
    '  font-weight: 600;',
    '  font-family: "Outfit", Arial, sans-serif;',
    '  z-index: 99999;',
    '  box-shadow: 0 6px 24px rgba(0,0,0,0.5);',
    '  border: 1px solid rgba(255,215,0,0.25);',
    '  opacity: 1;',
    '  transition: opacity 0.4s ease;',
    '  white-space: nowrap;',
    '}',
    '.cc-share-toast.cc-toast-fade {',
    '  opacity: 0;',
    '}',

  ].join('');
  document.head.appendChild(style);


  // ── 2. TOAST HELPER ──────────────────────────────────────
  function showToast(msg) {
    // Remove any existing toast
    var old = document.querySelector('.cc-share-toast');
    if (old) old.remove();

    var toast = document.createElement('div');
    toast.className = 'cc-share-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(function () {
      toast.classList.add('cc-toast-fade');
      setTimeout(function () { toast.remove(); }, 400);
    }, 2600);
  }


  // ── 3. CORE SHARE FUNCTION ───────────────────────────────
  //  Called by every share button.
  //  title, price, category, idx — used to build the share URL.
  //  The middleware at Cloudflare edge handles the OG image injection.
  window.ccShareProduct = function (title, price, category, idx) {

    var BASE   = 'https://cozycabin.co.ke/';
    var url    = BASE + '?shop=' + encodeURIComponent(category) + '&idx=' + idx;
    var priceStr = 'KES ' + Number(price).toLocaleString('en-KE');
    var text   = '🛍️ *' + title + '*\n💰 ' + priceStr + '\n👉 Shop at Cozycabin Kenya:';

    // ── Native share sheet (Android / iOS) ──
    if (navigator.share) {
      navigator.share({
        title: title + ' — ' + priceStr + ' | Cozycabin Kenya',
        text:  text,
        url:   url
      }).catch(function () {
        // User cancelled — silent
      });
      return;
    }

    // ── Fallback: copy link to clipboard ──
    var full = text + '\n' + url;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(full).then(function () {
        showToast('✅ Link copied! Paste anywhere to share.');
      }).catch(function () {
        prompt('Copy this link:', url);
      });
    } else {
      // Last resort — prompt dialog
      prompt('Copy this link:', url);
    }
  };


  // ── 4. BUILD SHARE BUTTON HTML ───────────────────────────
  //  Returns an HTML string for a share button.
  //  We embed all data in data-* attributes so the delegated
  //  click handler in step 5 can fire ccShareProduct.
  function makeShareBtnHTML(title, price, category, idx) {
    // Escape quotes for inline HTML attribute
    var safetitle = String(title).replace(/"/g, '&quot;');
    return '<button class="cc-share-btn" ' +
             'data-share-title="' + safetitle + '" ' +
             'data-share-price="' + price + '" ' +
             'data-share-cat="'   + category + '" ' +
             'data-share-idx="'   + idx + '">' +
             '🔗 Share' +
           '</button>';
  }


  // ── 5. DELEGATED CLICK HANDLER ───────────────────────────
  //  One listener for ALL share buttons, no matter when they're added to DOM.
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.cc-share-btn');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    window.ccShareProduct(
      btn.getAttribute('data-share-title'),
      parseInt(btn.getAttribute('data-share-price'), 10) || 0,
      btn.getAttribute('data-share-cat'),
      parseInt(btn.getAttribute('data-share-idx'), 10) || 0
    );
  });


  // ── 6. PATCH showProducts ────────────────────────────────
  //  Wrap the existing showProducts so every time products render,
  //  we inject a share button into each card AFTER the cart button.
  //
  //  We use a MutationObserver on #products-container so we catch
  //  cards from BOTH standard and variant renderers with zero risk
  //  of race conditions.

  var _observer = null;
  var _currentCategory = null;

  function injectShareButtons(category) {
    var container = document.getElementById('products-container');
    if (!container) return;

    var cards = container.querySelectorAll('.product-card');
    cards.forEach(function (card, idx) {
      // Skip if already has a share button
      if (card.querySelector('.cc-share-btn')) return;

      // ── Resolve product data ──
      var catData  = (typeof products !== 'undefined') ? products[category] : null;
      var product  = catData ? catData[idx] : null;
      if (!product) return;

      // Price: standard card uses product.price;
      // variant card — use first variant price or product.price
      var price = product.price;
      if (!price && product.variants && product.variants[0]) {
        price = product.variants[0].price || 0;
      }

      var shareHTML = makeShareBtnHTML(product.title, price, category, idx);
      var shareEl   = document.createElement('div');
      shareEl.innerHTML = shareHTML;
      var shareBtn = shareEl.firstChild;

      // ── Position: after .cart-btn, before <details> ──
      var cartBtn  = card.querySelector('.cart-btn');
      var details  = card.querySelector('.details-box');

      if (cartBtn && cartBtn.nextSibling) {
        card.insertBefore(shareBtn, cartBtn.nextSibling);
      } else if (details) {
        card.insertBefore(shareBtn, details);
      } else {
        card.appendChild(shareBtn);
      }
    });
  }

  // ── Patch window.showProducts ──
  (function patchShowProducts() {
    var MAX_WAIT = 80; // ms — wait for original showProducts to be defined
    var elapsed  = 0;

    function tryPatch() {
      if (typeof window.showProducts !== 'function') {
        elapsed += 10;
        if (elapsed < MAX_WAIT * 10) { setTimeout(tryPatch, 10); }
        return;
      }

      var _orig = window.showProducts;
      window.showProducts = function (category) {
        _currentCategory = category;
        _orig(category);

        // Inject immediately (standard cards render synchronously)
        injectShareButtons(category);

        // Also inject after a short delay (variant cards use setTimeout internally)
        setTimeout(function () { injectShareButtons(category); }, 80);
        setTimeout(function () { injectShareButtons(category); }, 300);
      };
    }

    tryPatch();
  })();


  // ── 7. ALSO CATCH CARDS ALREADY IN THE DOM ───────────────
  //  (e.g., if showProducts was called before this script loaded)
  document.addEventListener('DOMContentLoaded', function () {
    var container = document.getElementById('products-container');
    if (!container) return;

    // If products-container already has cards, inject now
    if (_currentCategory && container.children.length) {
      injectShareButtons(_currentCategory);
    }

    // Watch for future renders
    if (window.MutationObserver) {
      if (_observer) _observer.disconnect();
      _observer = new MutationObserver(function () {
        if (_currentCategory) {
          injectShareButtons(_currentCategory);
        }
      });
      _observer.observe(container, { childList: true, subtree: false });
    }
  });

})();
