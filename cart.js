// ============================================================
//  COZYCABIN — cart.js v2
//  Complete Cart + Checkout + Delivery System
//  Features:
//  - Cart drawer with qty controls
//  - Full checkout form (name, phone, county, town)
//  - Delivery methods: Nairobi CBD (FREE), Bus Parcel, Pickup
//  - Bus company selector with custom input
//  - Order summary before sending
//  - WhatsApp order with full formatted message
//  - Future-ready: M-Pesa, Paybill, affiliate, tracking hooks
// ============================================================

(function () {
'use strict';

// ══════════════════════════════════
//  CONFIG
// ══════════════════════════════════
var WA = '254702468460';

var KENYA_COUNTIES = [
  'Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika','Malindi',
  'Kitale','Garissa','Kisii','Nyeri','Meru','Embu','Machakos',
  'Kilifi','Kwale','Taita Taveta','Lamu','Tana River',
  'Marsabit','Isiolo','Mandera','Wajir','Turkana','West Pokot',
  'Samburu','Trans Nzoia','Uasin Gishu','Elgeyo Marakwet','Nandi',
  'Baringo','Laikipia','Kajiado','Makueni','Kitui','Tharaka Nithi',
  'Murang\'a','Kiambu','Nyandarua','Kirinyaga','Nyamira','Migori',
  'Homa Bay','Siaya','Kisumu','Vihiga','Kakamega','Bungoma',
  'Busia','Bomet','Kericho','Narok','Samburu'
];

var BUS_COMPANIES = [
  'Easy Coach','ENA Coach','Guardian Coach','Modern Coast',
  'Mash Poa','Dreamline Express','Tahmeed','G4S Courier',
  'Simba Coach','Climax Bus','Other (specify)'
];

// ══════════════════════════════════
//  STATE
// ══════════════════════════════════
var cart     = [];
var checkout = {
  step: 1, // 1=cart, 2=delivery, 3=summary
  name: '', phone: '', county: '', town: '',
  deliveryMethod: '', busCompany: '', busCustom: '',
  busStage: '', receiverName: '', receiverPhone: '',
  notes: '', deliveryFee: 0
};

// ══════════════════════════════════
//  CSS
// ══════════════════════════════════
(function injectCSS() {
  if (document.getElementById('cc-cart-style')) return;
  var s = document.createElement('style');
  s.id  = 'cc-cart-style';
  s.textContent = [

  /* ── Badge ── */
  '#cc-cart-count{position:absolute;top:-6px;right:-8px;background:#ffd700;color:#000;font-size:10px;font-weight:800;min-width:18px;height:18px;border-radius:10px;display:none;align-items:center;justify-content:center;font-family:"Outfit",Arial,sans-serif;padding:0 4px;box-shadow:0 2px 8px rgba(255,215,0,.5);}',
  '#cc-cart-count.visible{display:flex;}',

  /* ── Overlay ── */
  '#cc-cart-overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:8999;display:none;}',

  /* ── Drawer ── */
  '#cc-cart-drawer{position:fixed;bottom:0;left:0;right:0;background:linear-gradient(180deg,#0d1117,#0a0f1c);border-top:2px solid #ffd700;border-radius:22px 22px 0 0;z-index:9000;max-height:92vh;display:flex;flex-direction:column;transform:translateY(100%);transition:transform .32s cubic-bezier(.4,0,.2,1);font-family:"Outfit",Arial,sans-serif;}',
  '#cc-cart-drawer.open{transform:translateY(0);}',

  /* ── Handle ── */
  '.cc-handle{width:40px;height:4px;border-radius:2px;background:rgba(255,255,255,.18);margin:12px auto 0;flex-shrink:0;}',

  /* ── Header ── */
  '.cc-dheader{display:flex;align-items:center;justify-content:space-between;padding:12px 18px 10px;border-bottom:1px solid rgba(255,215,0,.15);flex-shrink:0;}',
  '.cc-dheader h3{font-size:16px;font-weight:800;color:#ffd700;font-family:"Rajdhani","Outfit",sans-serif;letter-spacing:.5px;display:flex;align-items:center;gap:8px;}',
  '.cc-dclose{background:none;border:none;color:#64748b;font-size:22px;cursor:pointer;line-height:1;padding:2px 6px;border-radius:6px;transition:color .15s;}',
  '.cc-dclose:hover{color:#ffd700;}',

  /* ── Step indicator ── */
  '.cc-steps{display:flex;align-items:center;justify-content:center;gap:0;padding:10px 18px 8px;flex-shrink:0;}',
  '.cc-step-item{display:flex;align-items:center;gap:0;}',
  '.cc-step-dot{width:26px;height:26px;border-radius:50%;border:2px solid rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#64748b;transition:.2s;}',
  '.cc-step-dot.active{border-color:#ffd700;background:#ffd700;color:#000;}',
  '.cc-step-dot.done{border-color:#22c55e;background:#22c55e;color:#fff;}',
  '.cc-step-label{font-size:9px;color:#64748b;margin-top:3px;text-align:center;white-space:nowrap;}',
  '.cc-step-line{width:28px;height:2px;background:rgba(255,255,255,.08);margin:0 3px;position:relative;top:-6px;}',
  '.cc-step-line.done{background:#22c55e;}',

  /* ── Body ── */
  '.cc-dbody{flex:1;overflow-y:auto;padding:12px 16px;display:flex;flex-direction:column;gap:8px;}',

  /* ── Cart item ── */
  '.cc-ci{display:flex;align-items:center;gap:10px;background:#0a0f1e;border:1px solid rgba(255,215,0,.12);border-radius:14px;padding:11px;}',
  '.cc-ci-img{width:52px;height:52px;border-radius:9px;object-fit:cover;flex-shrink:0;background:#111;border:1px solid rgba(255,255,255,.07);}',
  '.cc-ci-info{flex:1;min-width:0;}',
  '.cc-ci-title{font-size:12px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px;}',
  '.cc-ci-variant{font-size:10px;color:#ffd700;margin-bottom:1px;}',
  '.cc-ci-opts{font-size:10px;color:#64748b;margin-bottom:3px;}',
  '.cc-ci-price{font-size:13px;font-weight:800;color:#ffd700;}',
  '.cc-qty{display:flex;align-items:center;gap:0;margin-top:5px;}',
  '.cc-qb{width:26px;height:26px;border-radius:7px;background:#0f172a;border:1px solid rgba(255,255,255,.1);color:#fff;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;}',
  '.cc-qb:hover{background:#1e293b;}',
  '.cc-qn{width:30px;text-align:center;font-size:12px;font-weight:700;color:#fff;}',
  '.cc-rm{background:none;border:none;color:#ef4444;font-size:15px;cursor:pointer;padding:4px;opacity:.6;flex-shrink:0;}',
  '.cc-rm:hover{opacity:1;}',

  /* ── Empty ── */
  '.cc-empty{text-align:center;padding:36px 20px;color:#64748b;}',
  '.cc-empty-icon{font-size:44px;margin-bottom:10px;}',

  /* ── Section label ── */
  '.cc-sec-label{font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:6px;margin-top:2px;}',

  /* ── Info box (delivery notice) ── */
  '.cc-info-box{background:rgba(255,215,0,.05);border:1px solid rgba(255,215,0,.2);border-radius:12px;padding:12px 14px;font-size:11px;color:#94a3b8;line-height:1.7;}',
  '.cc-info-box b{color:#ffd700;display:block;margin-bottom:4px;font-size:12px;}',
  '.cc-info-row{display:flex;align-items:baseline;gap:6px;margin-bottom:3px;}',
  '.cc-info-check{color:#22c55e;font-size:12px;flex-shrink:0;}',

  /* ── Form fields ── */
  '.cc-field{margin-bottom:10px;}',
  '.cc-field label{display:block;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.8px;margin-bottom:5px;}',
  '.cc-inp{width:100%;background:#0a0f1e;border:1.5px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font-size:13px;padding:10px 12px;font-family:"Outfit",Arial,sans-serif;outline:none;transition:border-color .15s;}',
  '.cc-inp:focus{border-color:#ffd700;box-shadow:0 0 0 2px rgba(255,215,0,.1);}',
  '.cc-inp::placeholder{color:#334155;}',
  'select.cc-inp{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 10 6\'%3E%3Cpath fill=\'%2364748b\' d=\'M0 0l5 6 5-6z\'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;background-size:8px;padding-right:30px;}',
  'textarea.cc-inp{resize:none;height:70px;}',
  '.cc-inp.cc-err{border-color:#ef4444;}',
  '.cc-field-err{font-size:10px;color:#ef4444;margin-top:3px;}',

  /* ── Delivery method cards ── */
  '.cc-dm-grid{display:flex;flex-direction:column;gap:8px;margin-bottom:10px;}',
  '.cc-dm-card{background:#0a0f1e;border:2px solid rgba(255,255,255,.08);border-radius:12px;padding:12px 14px;cursor:pointer;transition:.15s;display:flex;align-items:center;gap:12px;-webkit-tap-highlight-color:transparent;}',
  '.cc-dm-card:hover{border-color:rgba(255,215,0,.4);}',
  '.cc-dm-card.selected{border-color:#ffd700;background:rgba(255,215,0,.05);}',
  '.cc-dm-icon{font-size:22px;flex-shrink:0;}',
  '.cc-dm-info{flex:1;}',
  '.cc-dm-title{font-size:13px;font-weight:700;color:#fff;margin-bottom:2px;}',
  '.cc-dm-sub{font-size:10px;color:#64748b;}',
  '.cc-dm-badge{font-size:10px;font-weight:800;padding:3px 9px;border-radius:20px;flex-shrink:0;}',
  '.cc-dm-badge.free{background:rgba(34,197,94,.15);color:#22c55e;border:1px solid rgba(34,197,94,.3);}',
  '.cc-dm-badge.paid{background:rgba(255,215,0,.1);color:#ffd700;border:1px solid rgba(255,215,0,.25);}',

  /* ── Order summary ── */
  '.cc-summary-box{background:#0a0f1e;border:1px solid rgba(255,215,0,.15);border-radius:14px;padding:14px;margin-bottom:8px;}',
  '.cc-sum-row{display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.05);}',
  '.cc-sum-row:last-child{border-bottom:none;}',
  '.cc-sum-label{font-size:11px;color:#94a3b8;}',
  '.cc-sum-value{font-size:12px;color:#fff;font-weight:600;text-align:right;max-width:60%;}',
  '.cc-sum-total-row{display:flex;justify-content:space-between;align-items:center;padding:10px 0 0;margin-top:4px;}',
  '.cc-sum-total-label{font-size:13px;font-weight:700;color:#fff;}',
  '.cc-sum-total-value{font-size:20px;font-weight:900;color:#ffd700;}',

  /* ── Footer ── */
  '.cc-dfooter{padding:12px 16px 16px;border-top:1px solid rgba(255,255,255,.07);flex-shrink:0;display:flex;flex-direction:column;gap:7px;}',
  '.cc-total-bar{display:flex;justify-content:space-between;align-items:center;margin-bottom:2px;}',
  '.cc-total-label{font-size:12px;color:#94a3b8;font-weight:600;}',
  '.cc-total-val{font-size:19px;font-weight:900;color:#ffd700;}',
  '.cc-total-count{font-size:10px;color:#64748b;}',

  /* ── Buttons ── */
  '.cc-btn-gold{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:14px;background:linear-gradient(135deg,#ca8a04,#ffd700);color:#000;font-size:14px;font-weight:800;border:none;border-radius:13px;cursor:pointer;font-family:"Outfit",Arial,sans-serif;transition:opacity .15s,transform .1s;letter-spacing:.2px;}',
  '.cc-btn-gold:hover{opacity:.92;}.cc-btn-gold:active{transform:scale(.98);}',
  '.cc-btn-green{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:14px;background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;font-size:14px;font-weight:800;border:none;border-radius:13px;cursor:pointer;font-family:"Outfit",Arial,sans-serif;transition:opacity .15s,transform .1s;}',
  '.cc-btn-green:hover{opacity:.92;}.cc-btn-green:active{transform:scale(.98);}',
  '.cc-btn-outline{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:11px;background:none;border:1.5px solid rgba(255,255,255,.12);color:#94a3b8;font-size:12px;font-weight:700;border-radius:11px;cursor:pointer;font-family:"Outfit",Arial,sans-serif;transition:.15s;}',
  '.cc-btn-outline:hover{border-color:#ffd700;color:#ffd700;}',
  '.cc-btn-red{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:10px;background:rgba(239,68,68,.08);border:1.5px solid rgba(239,68,68,.22);color:#ef4444;font-size:12px;font-weight:700;border-radius:11px;cursor:pointer;font-family:"Outfit",Arial,sans-serif;transition:.15s;}',
  '.cc-btn-red:hover{background:rgba(239,68,68,.15);}',

  /* ── cart-btn on product cards ── */
  '.cart-btn{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;padding:13px;background:rgba(255,215,0,.07);border:2px solid rgba(255,215,0,.28);color:#ffd700;font-size:13px;font-weight:800;border-radius:12px;cursor:pointer;font-family:"Outfit",Arial,sans-serif;transition:background .15s,border-color .15s,transform .1s;-webkit-tap-highlight-color:transparent;margin-bottom:6px;}',
  '.cart-btn:hover{background:rgba(255,215,0,.13);border-color:rgba(255,215,0,.55);}',
  '.cart-btn:active{transform:scale(.97);}',
  '.cart-btn.cc-added{background:rgba(34,197,94,.1);border-color:rgba(34,197,94,.5);color:#22c55e;}',

  /* ── Toast ── */
  '#cc-toast{position:fixed;bottom:76px;left:50%;transform:translateX(-50%);background:#0d1117;color:#fff;padding:10px 20px;border-radius:24px;font-size:12px;font-weight:700;font-family:"Outfit",Arial,sans-serif;z-index:9999;box-shadow:0 6px 24px rgba(0,0,0,.55);border:1px solid rgba(255,215,0,.3);display:none;white-space:nowrap;pointer-events:none;}',
  '#cc-toast.show{display:block;animation:ccToastIn .25s ease;}',
  '@keyframes ccToastIn{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}',

  ].join('');
  document.head.appendChild(s);
})();

// ══════════════════════════════════
//  BUILD DOM
// ══════════════════════════════════
function buildDOM() {

  // Overlay
  var ov = document.createElement('div');
  ov.id  = 'cc-cart-overlay';
  ov.onclick = closeCart;
  document.body.appendChild(ov);

  // Drawer
  var dr = document.createElement('div');
  dr.id  = 'cc-cart-drawer';
  dr.innerHTML =
    '<div class="cc-handle"></div>' +
    '<div class="cc-dheader">' +
      '<h3 id="cc-drawer-title">🛍️ Your Cart</h3>' +
      '<button class="cc-dclose" onclick="ccCloseCart()">✕</button>' +
    '</div>' +
    '<div class="cc-steps" id="cc-steps">' +
      stepDot(1,'Cart') + stepLine(false) +
      stepDot(2,'Delivery') + stepLine(false) +
      stepDot(3,'Review') +
    '</div>' +
    '<div class="cc-dbody" id="cc-dbody"></div>' +
    '<div class="cc-dfooter" id="cc-dfooter"></div>';
  document.body.appendChild(dr);

  // Toast
  var toast = document.createElement('div');
  toast.id  = 'cc-toast';
  document.body.appendChild(toast);

  // Patch header cart button
  var hBtn = document.querySelector('.header-icon-btn[title="Cart"]');
  if (hBtn) {
    hBtn.style.position = 'relative';
    hBtn.removeAttribute('href');
    hBtn.onclick = function(e){ e.preventDefault(); openCart(); };
    var badge = document.createElement('span');
    badge.id  = 'cc-cart-count';
    hBtn.style.display = 'inline-flex';
    hBtn.appendChild(badge);
  }

  renderStep(1);
}

function stepDot(n, label) {
  return '<div class="cc-step-item"><div style="display:flex;flex-direction:column;align-items:center">' +
    '<div class="cc-step-dot" id="cc-sd-'+n+'">'+n+'</div>' +
    '<div class="cc-step-label">'+label+'</div></div></div>';
}
function stepLine(done) {
  return '<div class="cc-step-item"><div class="cc-step-line'+(done?' done':'')+'"></div></div>';
}

// ══════════════════════════════════
//  OPEN / CLOSE
// ══════════════════════════════════
function openCart() {
  checkout.step = 1;
  renderStep(1);
  document.getElementById('cc-cart-overlay').style.display = 'block';
  setTimeout(function(){ document.getElementById('cc-cart-drawer').classList.add('open'); }, 10);
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cc-cart-drawer').classList.remove('open');
  setTimeout(function(){ document.getElementById('cc-cart-overlay').style.display = 'none'; }, 300);
  document.body.style.overflow = '';
}
window.ccCloseCart = closeCart;

// ══════════════════════════════════
//  STEP RENDERER
// ══════════════════════════════════
function renderStep(step) {
  checkout.step = step;
  updateStepUI(step);

  var title = ['','🛍️ Your Cart','🚚 Delivery Details','📋 Order Review'][step] || '🛍️ Cart';
  var titleEl = document.getElementById('cc-drawer-title');
  if (titleEl) titleEl.textContent = title;

  if (step === 1) renderCartStep();
  else if (step === 2) renderDeliveryStep();
  else if (step === 3) renderSummaryStep();
}

function updateStepUI(step) {
  for (var i = 1; i <= 3; i++) {
    var dot = document.getElementById('cc-sd-' + i);
    if (!dot) continue;
    dot.className = 'cc-step-dot' + (i < step ? ' done' : i === step ? ' active' : '');
    if (i < step) dot.textContent = '✓';
    else dot.textContent = i;
  }
  // Lines
  var lines = document.querySelectorAll('.cc-step-line');
  lines.forEach(function(l, li) {
    l.className = 'cc-step-line' + (step > li + 1 ? ' done' : '');
  });
}

// ══════════════════════════════════
//  STEP 1 — CART
// ══════════════════════════════════
function renderCartStep() {
  var body   = document.getElementById('cc-dbody');
  var footer = document.getElementById('cc-dfooter');

  if (cart.length === 0) {
    body.innerHTML =
      '<div class="cc-empty">' +
      '<div class="cc-empty-icon">🛒</div>' +
      '<p style="font-weight:700;color:#fff;margin-bottom:6px">Your cart is empty</p>' +
      '<p style="font-size:12px">Browse products and tap <b style="color:#ffd700">Add to Cart</b></p>' +
      '</div>';
    footer.innerHTML = '';
    return;
  }

  var html = '';
  cart.forEach(function(item, i) {
    var line = item.price * item.qty;
    html +=
      '<div class="cc-ci">' +
        '<img class="cc-ci-img" src="'+(item.image||'')+'" onerror="this.style.display=\'none\'" alt="">' +
        '<div class="cc-ci-info">' +
          '<div class="cc-ci-title">'+item.title+'</div>' +
          (item.variant ? '<div class="cc-ci-variant">✦ '+item.variant+'</div>' : '') +
          ((item.size&&item.size!=='N/A')||(item.color&&item.color!=='N/A')
            ? '<div class="cc-ci-opts">'+(item.size&&item.size!=='N/A'?'Size: '+item.size+'  ':'')+
              (item.color&&item.color!=='N/A'?'Colour: '+item.color:'')+'</div>' : '') +
          '<div class="cc-ci-price">KES '+line.toLocaleString()+'</div>' +
          '<div class="cc-qty">' +
            '<button class="cc-qb" onclick="ccQty('+i+',-1)">−</button>' +
            '<span class="cc-qn">'+item.qty+'</span>' +
            '<button class="cc-qb" onclick="ccQty('+i+',1)">+</button>' +
          '</div>' +
        '</div>' +
        '<button class="cc-rm" onclick="ccRemove('+i+')" title="Remove">✕</button>' +
      '</div>';
  });
  body.innerHTML = html;

  var total = cartTotal();
  var count = cartCount();
  footer.innerHTML =
    '<div class="cc-total-bar">' +
      '<div><div class="cc-total-label">Cart Total</div>' +
        '<div class="cc-total-count" id="cc-cart-count-label">'+count+' item'+(count!==1?'s':'')+'</div></div>' +
      '<div class="cc-total-val">KES '+total.toLocaleString()+'</div>' +
    '</div>' +
    '<button class="cc-btn-gold" onclick="ccGoStep(2)">Proceed to Delivery →</button>' +
    '<button class="cc-btn-red" onclick="ccClearCart()" style="margin-top:4px">🗑 Clear Cart</button>';
}

// ══════════════════════════════════
//  STEP 2 — DELIVERY FORM
// ══════════════════════════════════
function renderDeliveryStep() {
  var body   = document.getElementById('cc-dbody');
  var footer = document.getElementById('cc-dfooter');

  var countyOptions = '<option value="">Select County</option>';
  KENYA_COUNTIES.forEach(function(c){ countyOptions += '<option value="'+c+'"'+(checkout.county===c?' selected':'')+'>'+c+'</option>'; });

  body.innerHTML =
    // Delivery notice
    '<div class="cc-info-box">' +
      '<b>📦 Delivery Information</b>' +
      '<div class="cc-info-row"><span class="cc-info-check">✓</span><span><b style="color:#22c55e">Nairobi CBD:</b> FREE Delivery</span></div>' +
      '<div class="cc-info-row"><span class="cc-info-check">✓</span><span><b style="color:#ffd700">Bus Parcel:</b> KES 200 – KES 500</span></div>' +
      '<div style="font-size:10px;color:#475569;margin-top:6px;line-height:1.6">Delivery charges vary by product size, weight, destination and bus company rates. Final cost confirmed before dispatch.</div>' +
    '</div>' +

    // Customer info
    '<div class="cc-sec-label" style="margin-top:10px">Customer Details</div>' +
    field('Full Name','text','cc-f-name','Your full name',checkout.name) +
    field('Phone Number','tel','cc-f-phone','e.g. 0712345678',checkout.phone) +
    field('County','select','cc-f-county','',checkout.county, countyOptions) +
    field('Town / Delivery Location','text','cc-f-town','e.g. Westlands, Kisumu CBD',checkout.town) +

    // Delivery method
    '<div class="cc-sec-label" style="margin-top:4px">Delivery Method</div>' +
    '<div class="cc-dm-grid" id="cc-dm-grid">' +
      dmCard('nairobi','🏙️','Nairobi CBD Delivery','Available within Nairobi','FREE','free') +
      dmCard('bus','🚌','Bus Parcel Delivery','Countrywide via bus/courier','KES 200–500','paid') +
      dmCard('pickup','📍','Pickup','Collect from our location','Free','free') +
    '</div>' +

    // Bus details (shown when bus selected)
    '<div id="cc-bus-section" style="display:'+(checkout.deliveryMethod==='bus'?'block':'none')+'">' +
      '<div class="cc-sec-label">Bus Parcel Details</div>' +
      busCo() +
      '<div id="cc-bus-custom-wrap" style="display:'+(checkout.busCompany==='Other (specify)'?'block':'none')+'">' +
        field('Specify Bus Company','text','cc-f-bus-custom','Bus company name',checkout.busCustom) +
      '</div>' +
      field('Bus Stage / Branch','text','cc-f-bus-stage','e.g. Machakos Country Bus',checkout.busStage) +
      field('Receiver Name','text','cc-f-rec-name','Name of person collecting',checkout.receiverName) +
      field('Receiver Phone','tel','cc-f-rec-phone','Phone for bus notification',checkout.receiverPhone) +
    '</div>' +

    // Notes
    '<div class="cc-sec-label" style="margin-top:4px">Additional Notes</div>' +
    '<div class="cc-field"><textarea class="cc-inp" id="cc-f-notes" placeholder="Any special instructions, landmarks or notes...">' + (checkout.notes||'') + '</textarea></div>';

  footer.innerHTML =
    '<button class="cc-btn-gold" onclick="ccSubmitDelivery()">Review Order →</button>' +
    '<button class="cc-btn-outline" onclick="ccGoStep(1)">← Back to Cart</button>';

  // Wire delivery method selection
  setTimeout(function() {
    document.querySelectorAll('.cc-dm-card').forEach(function(card) {
      card.onclick = function() {
        var m = this.getAttribute('data-method');
        checkout.deliveryMethod = m;
        document.querySelectorAll('.cc-dm-card').forEach(function(c){ c.classList.remove('selected'); });
        this.classList.add('selected');
        checkout.deliveryFee = m === 'nairobi' ? 0 : m === 'pickup' ? 0 : 0; // confirmed on dispatch
        var busSection = document.getElementById('cc-bus-section');
        if (busSection) busSection.style.display = m === 'bus' ? 'block' : 'none';
      };
      if (this.getAttribute('data-method') === checkout.deliveryMethod) {
        card.classList.add('selected');
      }
    }.bind);

    // Re-wire bus company select
    var busCoEl = document.getElementById('cc-f-busco');
    if (busCoEl) {
      busCoEl.value = checkout.busCompany || '';
      busCoEl.onchange = function() {
        checkout.busCompany = this.value;
        var cw = document.getElementById('cc-bus-custom-wrap');
        if (cw) cw.style.display = this.value === 'Other (specify)' ? 'block' : 'none';
      };
    }

    // Re-set delivery method highlight
    document.querySelectorAll('.cc-dm-card').forEach(function(card) {
      card.onclick = function() {
        var m = card.getAttribute('data-method');
        checkout.deliveryMethod = m;
        document.querySelectorAll('.cc-dm-card').forEach(function(c){ c.classList.remove('selected'); });
        card.classList.add('selected');
        var busSection = document.getElementById('cc-bus-section');
        if (busSection) busSection.style.display = m === 'bus' ? 'block' : 'none';
      };
      if (card.getAttribute('data-method') === checkout.deliveryMethod) {
        card.classList.add('selected');
      }
    });
  }, 0);
}

function field(label, type, id, placeholder, value, options) {
  var input = type === 'select'
    ? '<select class="cc-inp" id="'+id+'">'+options+'</select>'
    : type === 'textarea'
    ? '<textarea class="cc-inp" id="'+id+'" placeholder="'+placeholder+'">'+(value||'')+'</textarea>'
    : '<input type="'+type+'" class="cc-inp" id="'+id+'" placeholder="'+placeholder+'" value="'+(value||'')+'">';
  return '<div class="cc-field"><label>'+label+'</label>'+input+'<div class="cc-field-err" id="'+id+'-err"></div></div>';
}

function dmCard(method, icon, title, sub, badge, badgeClass) {
  var sel = checkout.deliveryMethod === method ? ' selected' : '';
  return '<div class="cc-dm-card'+sel+'" data-method="'+method+'">' +
    '<span class="cc-dm-icon">'+icon+'</span>' +
    '<div class="cc-dm-info"><div class="cc-dm-title">'+title+'</div><div class="cc-dm-sub">'+sub+'</div></div>' +
    '<span class="cc-dm-badge '+badgeClass+'">'+badge+'</span>' +
  '</div>';
}

function busCo() {
  var opts = '<option value="">Select Bus Company</option>';
  BUS_COMPANIES.forEach(function(b){ opts += '<option value="'+b+'"'+(checkout.busCompany===b?' selected':'')+'>'+b+'</option>'; });
  return '<div class="cc-field"><label>Bus Company</label><select class="cc-inp" id="cc-f-busco">'+opts+'</select></div>';
}

// ══════════════════════════════════
//  VALIDATE & SAVE DELIVERY FORM
// ══════════════════════════════════
window.ccSubmitDelivery = function() {
  // Save values
  checkout.name    = (document.getElementById('cc-f-name')  && document.getElementById('cc-f-name').value.trim())   || '';
  checkout.phone   = (document.getElementById('cc-f-phone') && document.getElementById('cc-f-phone').value.trim())  || '';
  checkout.county  = (document.getElementById('cc-f-county')&& document.getElementById('cc-f-county').value.trim()) || '';
  checkout.town    = (document.getElementById('cc-f-town')  && document.getElementById('cc-f-town').value.trim())   || '';
  checkout.notes   = (document.getElementById('cc-f-notes') && document.getElementById('cc-f-notes').value.trim())  || '';
  if (checkout.deliveryMethod === 'bus') {
    checkout.busCompany   = (document.getElementById('cc-f-busco')     && document.getElementById('cc-f-busco').value)    || '';
    checkout.busCustom    = (document.getElementById('cc-f-bus-custom')&& document.getElementById('cc-f-bus-custom').value.trim()) || '';
    checkout.busStage     = (document.getElementById('cc-f-bus-stage') && document.getElementById('cc-f-bus-stage').value.trim()) || '';
    checkout.receiverName = (document.getElementById('cc-f-rec-name')  && document.getElementById('cc-f-rec-name').value.trim())  || '';
    checkout.receiverPhone= (document.getElementById('cc-f-rec-phone') && document.getElementById('cc-f-rec-phone').value.trim()) || '';
  }

  // Validate
  var errors = [];
  if (!checkout.name)           errors.push(['cc-f-name',  'Full name is required']);
  if (!checkout.phone)          errors.push(['cc-f-phone', 'Phone number is required']);
  if (!checkout.county)         errors.push(['cc-f-county','Please select your county']);
  if (!checkout.town)           errors.push(['cc-f-town',  'Please enter your town/location']);
  if (!checkout.deliveryMethod) errors.push([null,         'Please select a delivery method']);
  if (checkout.deliveryMethod === 'bus' && !checkout.busCompany)
                                errors.push(['cc-f-busco', 'Please select a bus company']);

  // Clear old errors
  document.querySelectorAll('.cc-field-err').forEach(function(e){ e.textContent=''; });
  document.querySelectorAll('.cc-inp').forEach(function(i){ i.classList.remove('cc-err'); });

  if (errors.length > 0) {
    errors.forEach(function(e) {
      if (e[0]) {
        var inp = document.getElementById(e[0]);
        var err = document.getElementById(e[0]+'-err');
        if (inp) inp.classList.add('cc-err');
        if (err) err.textContent = e[1];
      }
    });
    showToast('⚠️ Please fill in all required fields');
    // Scroll to first error
    var firstErr = document.querySelector('.cc-inp.cc-err');
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  renderStep(3);
};

// ══════════════════════════════════
//  STEP 3 — ORDER SUMMARY & PLACE
// ══════════════════════════════════
function renderSummaryStep() {
  var body   = document.getElementById('cc-dbody');
  var footer = document.getElementById('cc-dfooter');

  var productTotal = cartTotal();
  var deliveryLabel = checkout.deliveryMethod === 'nairobi' ? 'FREE'
                    : checkout.deliveryMethod === 'pickup'  ? 'FREE (Pickup)'
                    : 'KES 200–500 (Confirmed before dispatch)';
  var methodLabel   = checkout.deliveryMethod === 'nairobi' ? '🏙️ Nairobi CBD Delivery'
                    : checkout.deliveryMethod === 'bus'     ? '🚌 Bus Parcel Delivery'
                    : '📍 Pickup';

  var itemRows = '';
  cart.forEach(function(item) {
    itemRows +=
      '<div class="cc-sum-row">' +
        '<span class="cc-sum-label">'+(item.variant||item.title).substring(0,28)+'</span>' +
        '<span class="cc-sum-value">'+item.qty+' × KES '+item.price.toLocaleString()+' = KES '+(item.price*item.qty).toLocaleString()+'</span>' +
      '</div>';
  });

  body.innerHTML =
    '<div class="cc-summary-box">' +
      '<div class="cc-sec-label" style="margin-bottom:8px">🛍️ Items</div>' +
      itemRows +
    '</div>' +

    '<div class="cc-summary-box">' +
      '<div class="cc-sec-label" style="margin-bottom:8px">👤 Customer</div>' +
      sumRow('Name', checkout.name) +
      sumRow('Phone', checkout.phone) +
      sumRow('County', checkout.county) +
      sumRow('Town', checkout.town) +
    '</div>' +

    '<div class="cc-summary-box">' +
      '<div class="cc-sec-label" style="margin-bottom:8px">🚚 Delivery</div>' +
      sumRow('Method', methodLabel) +
      (checkout.deliveryMethod === 'bus'
        ? sumRow('Bus Company', checkout.busCompany === 'Other (specify)' ? checkout.busCustom : checkout.busCompany) +
          (checkout.busStage     ? sumRow('Bus Stage',    checkout.busStage)     : '') +
          (checkout.receiverName ? sumRow('Receiver',     checkout.receiverName) : '') +
          (checkout.receiverPhone? sumRow('Rcvr Phone',   checkout.receiverPhone): '')
        : '') +
      sumRow('Delivery Fee', deliveryLabel) +
      (checkout.notes ? sumRow('Notes', checkout.notes) : '') +
      '<div class="cc-sum-total-row">' +
        '<span class="cc-sum-total-label">Product Total</span>' +
        '<span class="cc-sum-total-value">KES '+productTotal.toLocaleString()+'</span>' +
      '</div>' +
    '</div>' +

    '<div class="cc-info-box" style="font-size:10px;margin-top:0">' +
      '📌 Final delivery cost will be confirmed via WhatsApp before dispatch. ' +
      'Your order will be processed after payment confirmation.' +
    '</div>';

  footer.innerHTML =
    '<button class="cc-btn-green" onclick="ccPlaceOrder()">💬 Place Order via WhatsApp</button>' +
    '<button class="cc-btn-outline" onclick="ccGoStep(2)">← Edit Delivery</button>';
}

function sumRow(label, value) {
  return '<div class="cc-sum-row"><span class="cc-sum-label">'+label+'</span><span class="cc-sum-value">'+value+'</span></div>';
}

// ══════════════════════════════════
//  PLACE ORDER — WhatsApp message
// ══════════════════════════════════
window.ccPlaceOrder = function() {
  if (cart.length === 0) { showToast('Cart is empty'); return; }

  var productTotal = cartTotal();
  var ref          = localStorage.getItem('referralCode') || '';
  var deliveryFeeStr = checkout.deliveryMethod === 'nairobi' ? 'FREE'
                     : checkout.deliveryMethod === 'pickup'  ? 'FREE (Pickup)'
                     : 'KES 200–500 (to be confirmed)';
  var methodStr    = checkout.deliveryMethod === 'nairobi' ? 'Nairobi CBD Delivery (FREE)'
                   : checkout.deliveryMethod === 'bus'     ? 'Bus Parcel Delivery'
                   : 'Pickup';

  var lines = [
    '🛒 *NEW COZYCABIN ORDER*',
    '━━━━━━━━━━━━━━━━━━━━',
    ''
  ];

  // Items
  lines.push('*PRODUCTS:*');
  cart.forEach(function(item, i) {
    lines.push((i+1)+'. '+item.title);
    if (item.variant) lines.push('   Variant: '+item.variant);
    if (item.size  && item.size  !== 'N/A') lines.push('   Size: '  +item.size);
    if (item.color && item.color !== 'N/A') lines.push('   Colour: '+item.color);
    lines.push('   Qty: '+item.qty+'  ×  KES '+item.price.toLocaleString());
    lines.push('   Subtotal: KES '+(item.price*item.qty).toLocaleString());
    if (i < cart.length - 1) lines.push('');
  });

  lines.push('');
  lines.push('*Product Total: KES '+productTotal.toLocaleString()+'*');
  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push('*CUSTOMER DETAILS:*');
  lines.push('👤 Name: '+checkout.name);
  lines.push('📞 Phone: '+checkout.phone);
  lines.push('📍 County: '+checkout.county);
  lines.push('🏘️ Town: '+checkout.town);
  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push('*DELIVERY:*');
  lines.push('Method: '+methodStr);

  if (checkout.deliveryMethod === 'bus') {
    var busCo2 = checkout.busCompany === 'Other (specify)' ? checkout.busCustom : checkout.busCompany;
    lines.push('Bus Company: '+busCo2);
    if (checkout.busStage)      lines.push('Bus Stage: '   +checkout.busStage);
    if (checkout.receiverName)  lines.push('Receiver: '   +checkout.receiverName);
    if (checkout.receiverPhone) lines.push('Rcvr Phone: ' +checkout.receiverPhone);
  }

  lines.push('Delivery Fee: '+deliveryFeeStr);
  if (checkout.notes) { lines.push(''); lines.push('📝 Notes: '+checkout.notes); }
  if (ref) lines.push('🔗 Ref: '+ref);

  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push('Please confirm my order and delivery. 🙏');

  var msg = encodeURIComponent(lines.join('\n'));
  window.open('https://wa.me/'+WA+'?text='+msg, '_blank');

  // Track for future affiliate/order system
  if (window._ccOnOrderPlaced) {
    window._ccOnOrderPlaced({
      cart:     cart.slice(),
      customer: { name: checkout.name, phone: checkout.phone, county: checkout.county, town: checkout.town },
      delivery: { method: checkout.deliveryMethod, busCompany: checkout.busCompany, busStage: checkout.busStage },
      total:    productTotal,
      ref:      ref,
      timestamp: Date.now()
    });
  }
};

// ══════════════════════════════════
//  STEP NAV
// ══════════════════════════════════
window.ccGoStep = function(n) { renderStep(n); };

// ══════════════════════════════════
//  CART OPERATIONS
// ══════════════════════════════════
window.ccQty = function(i, delta) {
  if (!cart[i]) return;
  cart[i].qty = Math.max(1, cart[i].qty + delta);
  renderStep(1);
  updateBadge();
};

window.ccRemove = function(i) {
  cart.splice(i, 1);
  renderStep(1);
  updateBadge();
  showToast('Item removed');
};

window.ccClearCart = function() {
  cart = [];
  renderStep(1);
  updateBadge();
  showToast('Cart cleared');
};

function cartTotal() { return cart.reduce(function(s,i){ return s + i.price * i.qty; }, 0); }
function cartCount() { return cart.reduce(function(s,i){ return s + i.qty; }, 0); }

// ══════════════════════════════════
//  BADGE
// ══════════════════════════════════
function updateBadge() {
  var b = document.getElementById('cc-cart-count');
  if (!b) return;
  var n = cartCount();
  b.textContent = n > 99 ? '99+' : n;
  if (n > 0) b.classList.add('visible'); else b.classList.remove('visible');
}

// ══════════════════════════════════
//  TOAST
// ══════════════════════════════════
var _tt;
function showToast(msg) {
  var t = document.getElementById('cc-toast');
  if (!t) return;
  t.textContent = msg;
  t.className   = 'show';
  clearTimeout(_tt);
  _tt = setTimeout(function(){ t.className = ''; }, 2400);
}

// ══════════════════════════════════
//  ADD TO CART — from product cards
// ══════════════════════════════════
function addToCart(btn) {
  var card = btn.closest('.product-card');
  if (!card) return;

  var isVariant = card.hasAttribute('data-variant-card');
  var pidx = isVariant
    ? parseInt(card.getAttribute('data-variant-card'))
    : parseInt((card.querySelector('[data-index]') || {getAttribute: function(){return 0;}}).getAttribute('data-index') || 0);

  var opts  = (window.selectedOptions  && window.selectedOptions[pidx])  ? window.selectedOptions[pidx]  : {};
  var size  = opts.size  || null;
  var color = opts.color || null;
  var hint  = document.getElementById('selection-hint-' + pidx);

  if (card.querySelector('.size-btn')  && !size)  { if(hint){hint.textContent='⚠️ Please select a size first';hint.style.color='#ef4444';}  showToast('⚠️ Select a size first');  return; }
  if (card.querySelector('.color-btn') && !color) { if(hint){hint.textContent='⚠️ Please select a colour first';hint.style.color='#ef4444';} showToast('⚠️ Select a colour first'); return; }

  var title='', price=0, image='', variant=null;

  if (isVariant) {
    var vi      = (window.selectedVariants && window.selectedVariants[pidx] !== undefined) ? window.selectedVariants[pidx] : 0;
    var nameEl  = document.getElementById('vc-selname-text-' + pidx);
    var priceEl = document.getElementById('vc-newp-' + pidx);
    var tEl     = card.querySelector('.product-title');
    title   = tEl ? tEl.textContent.trim() : '';
    variant = nameEl  ? nameEl.textContent.trim()  : '';
    price   = priceEl ? parseInt(priceEl.textContent.replace(/[^\d]/g,'')) : 0;
    var pbBtn = document.getElementById('vc-pb-' + pidx + '-' + vi);
    if (pbBtn) { var pImg = pbBtn.querySelector('img'); if (pImg) image = pImg.src; }
  } else {
    var buyBtn = card.querySelector('.buy-btn');
    var tEl2   = card.querySelector('.product-title');
    title = tEl2 ? tEl2.textContent.trim() : (buyBtn ? buyBtn.getAttribute('data-title') : '');
    price = buyBtn ? parseInt(buyBtn.getAttribute('data-price') || 0) : 0;
    var fImg = card.querySelector('.cc-slide img, .cc-gallery img');
    if (fImg) image = fImg.src;
  }

  if (!title || !price) { showToast('Could not add — try again'); return; }

  // Merge if duplicate
  var found = null;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].title===title && cart[i].variant===variant && cart[i].size===size && cart[i].color===color) { found=cart[i]; break; }
  }
  if (found) { found.qty++; showToast('✓ Qty updated: '+found.qty+' in cart'); }
  else { cart.push({ title:title, variant:variant, size:size, color:color, price:price, image:image, qty:1 }); showToast('✅ Added to cart!'); }

  updateBadge();

  btn.textContent = '✓ Added!';
  btn.classList.add('cc-added');
  setTimeout(function(){ btn.innerHTML='🛍️ Add to Cart'; btn.classList.remove('cc-added'); }, 1800);
}

// ══════════════════════════════════
//  DELEGATED CLICK
// ══════════════════════════════════
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('cart-btn')) {
    e.preventDefault(); e.stopPropagation();
    addToCart(e.target); return;
  }
}, true);

// ══════════════════════════════════
//  INIT
// ══════════════════════════════════
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', buildDOM);
} else { buildDOM(); }

})();
