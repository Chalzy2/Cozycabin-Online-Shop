// ============================================================
//  wa-share-enhancer.js — Cozycabin Kenya
//
//  Adds "Share on WhatsApp" to every product card.
//  Share URL: https://cozycabin.co.ke/?shop=shoes&idx=0
//
//  The Cloudflare Pages middleware (functions/_middleware.js)
//  intercepts that URL when WhatsApp's crawler fetches it,
//  injects the correct og:image + og:title → thumbnail appears.
//  Human visitors pass through to the normal site and the
//  wa-share-enhancer auto-opens the right category.
//
//  INSTALL: add one line to index.html before </body>:
//    <script src="wa-share-enhancer.js"></script>
// ============================================================

(function (global) {
  'use strict';

  var SITE = 'https://cozycabin.co.ke';

  var CAT_LABELS = {
    shoes:'Shoes & Footwear', travel:'Travel Bags & Suitcases',
    cutlery:'Cutlery & Kitchenware', hotpots:'Hot Pots',
    solarlights:'Solar Lights', panels:'Solar Panels',
    inverters:'Inverters', batteries:'Batteries',
    duvets:'Duvets', bedsheets:'Bed Sheets', blankets:'Blankets',
    pillows:'Pillows', towels:'Towels', wallart:'Wall Art',
    mirrors:'Mirrors', cameras:'CCTV Cameras', speakers:'Speakers',
    phones:'Phones', laptops:'Laptops', tablets:'Tablets',
    smartwatch:'Smart Watches', earbuds:'Earbuds',
    powerbanks:'Power Banks', gaming:'Gaming',
  };

  // ── Helpers ───────────────────────────────────────────────
  function getPrice(product) {
    if (product.productType === 'variant' && product.variants && product.variants.length)
      return product.variants[0].price || 0;
    return product.price || 0;
  }

  function shortDesc(product) {
    var d = (product.description || '').replace(/\s+/g, ' ').trim();
    return d.length > 100 ? d.slice(0, 97) + '…' : d;
  }

  // ── Build the share URL ───────────────────────────────────
  // Cloudflare middleware reads ?shop= and ?idx= from this URL
  // and injects the product thumbnail into the OG tags.
  function shareUrl(category, idx) {
    var ref = typeof localStorage !== 'undefined' && localStorage.getItem('referralCode');
    var u   = SITE + '/?shop=' + encodeURIComponent(category) + '&idx=' + idx;
    if (ref) u += '&ref=' + encodeURIComponent(ref);
    return u;
  }

  // ── WhatsApp message ──────────────────────────────────────
  function buildMessage(product, category, idx) {
    var price    = getPrice(product);
    var catLabel = CAT_LABELS[category] || category;
    var desc     = shortDesc(product);
    var link     = shareUrl(category, idx);

    return [
      '🛍️ *' + (product.title || '') + '*',
      price ? '💰 KES ' + Number(price).toLocaleString() : '',
      desc  ? '📦 ' + desc : '',
      '',
      '👉 Shop ' + catLabel + ' at Cozycabin Kenya:',
      link
    ].filter(function(l, i) { return i < 3 ? l !== '' : true; }).join('\n');
  }

  // ── Share button CSS ──────────────────────────────────────
  (function () {
    if (document.getElementById('cc-share-style')) return;
    var s = document.createElement('style');
    s.id  = 'cc-share-style';
    s.textContent =
      '.cc-wa-share-btn{display:flex;align-items:center;justify-content:center;' +
      'gap:7px;width:100%;margin:8px 0 4px;padding:11px 16px;' +
      'background:linear-gradient(135deg,#25d366 0%,#128c7e 100%);' +
      'color:#fff;font-size:14px;font-weight:700;letter-spacing:.02em;' +
      'border:none;border-radius:12px;cursor:pointer;' +
      'box-shadow:0 4px 14px rgba(37,211,102,.3);' +
      'transition:transform .15s,box-shadow .15s;}' +
      '.cc-wa-share-btn:hover{transform:translateY(-1px);' +
      'box-shadow:0 6px 20px rgba(37,211,102,.4);}' +
      '.cc-wa-share-btn:active{transform:scale(.97);}';
    document.head.appendChild(s);
  })();

  // ── Inject button into a card ─────────────────────────────
  function injectBtn(card, product, category, idx) {
    if (!card || !product) return;
    if (card.querySelector('.cc-wa-share-btn')) return;

    var btn = document.createElement('button');
    btn.className = 'cc-wa-share-btn';
    btn.type = 'button';
    // WhatsApp SVG icon
    btn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"' +
      ' style="width:17px;height:17px;fill:#fff;flex-shrink:0;">' +
      '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471' +
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
      'c5.42 0 9.818 4.397 9.818 9.818 0 5.42-4.397 9.818-9.818 9.818z"/></svg>' +
      '📤 Share on WhatsApp';

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var msg = buildMessage(product, category, idx);
      window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
    });

    var details = card.querySelector('.details-box');
    if (details) card.insertBefore(btn, details);
    else         card.appendChild(btn);
  }

  // ── Patch showProducts ────────────────────────────────────
  (function patch() {
    if (typeof window.showProducts !== 'function') {
      setTimeout(patch, 50); return;
    }
    var _orig = window.showProducts;
    window.showProducts = function (category) {
      _orig.call(this, category);
      setTimeout(function () {
        var container = document.getElementById('products-container');
        if (!container) return;
        var list  = (typeof products !== 'undefined') ? (products[category] || []) : [];
        var cards = container.querySelectorAll('.product-card');
        list.forEach(function (p, i) {
          if (cards[i]) injectBtn(cards[i], p, category, i);
        });
      }, 30);
    };
  })();

  // ── Auto-open category from ?shop= on page load ──────────
  (function autoOpen() {
    function run() {
      var p   = new URLSearchParams(window.location.search);
      var cat = p.get('shop');
      if (!cat) return;
      var ref = p.get('ref');
      if (ref && typeof localStorage !== 'undefined')
        localStorage.setItem('referralCode', ref);
      if (typeof window.showProducts === 'function') {
        setTimeout(function () { window.showProducts(cat); }, 200);
      } else {
        setTimeout(run, 100);
      }
    }
    if (document.readyState === 'loading')
      document.addEventListener('DOMContentLoaded', run);
    else run();
  })();

}(window));
