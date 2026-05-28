alert("products.js loaded");
/* =========================
   REFERRAL SYSTEM
========================= */

const urlParams =
new URLSearchParams(
window.location.search
);

const referralCode =
urlParams.get("ref");

if(referralCode){

localStorage.setItem(
"referralCode",
referralCode
);

}

/* =========================
   PRODUCTS DATABASE
========================= */

const products = {

/* =========================
   FASHION
========================= */

shoes: [

{

title: "Classic Black Sneakers",

company: "Fashion",

price: 1999,

oldPrice: 2500,

sizes: [41,42,43,44],

colors: ["Black","Gray","Gold"],

description:
"Comfortable lightweight sneakers for daily wear.",

images: [

"Images/black-shoes.webp",

"Images/greyshoes.webp",

"Images/gold-shoes.webp"

]

},

{

title: "Ladies Fashion Sneakers",

company: "Fashion",

price: 1999,

oldPrice: 2500,

sizes: [41,42,43,44],

colors: ["White","Black"],

description:
"Stylish ladies sneakers with soft inner comfort.",

images: [

"Images/women-wshoe.webp",

"Images/women-bshoes.webp"

]

},

{

title: "Calvin Klein Casual",

company: "Calvin Klein",

price: 3200,

oldPrice: 4000,

sizes: [40,41,42,43,44,45],

colors: ["Brown","Blue","Tan"],

description:
"Premium Calvin Klein casual sneakers.",

images: [

"Images/calvin-brown.webp",

"Images/calvin-blue.webp",

"Images/calvin-tan.webp"

]

},

{

title: "Timberland Casual",

company: "Timberland",

price: 3200,

oldPrice: 4000,

sizes: [40,41,42,43,44,45],

colors: ["Black","White"],

description:
"Elegant Timberland casual shoes.",

images: [

"Images/timber-black.webp",

"Images/timber-white.webp"

]

}

],

shirts: [],
hoodies: [],
watches: [],
bags: [],
caps: [],
jeans: [],
jackets: []

};

/* =========================
   SHOW PRODUCTS
========================= */

window.showProducts = function(category){

const container =
document.getElementById("products-container");

if(!container){

alert("products-container missing");

return;

}

/* SHOW CONTAINER */

container.style.display = "grid";

/* CLEAR OLD */

container.innerHTML = "";

/* CHECK PRODUCTS */

if(
!products[category] ||
products[category].length === 0
){

container.innerHTML = `

<div class="empty-products">

<h2>No Products Yet</h2>

<p>Products coming soon.</p>

</div>

`;

return;

}

/* BUILD PRODUCTS */

products[category].forEach((product,index)=>{

container.innerHTML += `

<div class="product-card">

<div class="product-gallery">

<img
src="${product.images[0]}"
class="main-product-image"
id="mainImage-${index}"
>

</div>

<div class="thumbnail-row">

${product.images.map(img => `

<img
src="${img}"
class="thumb-image"
onclick="changeImage(${index}, '${img}')"
>

`).join("")}

</div>

<h2 class="product-title">
${product.title}
</h2>

<p class="company-name">
${product.company}
</p>

<p class="product-description">
${product.description}
</p>

<div class="price-box">

<span class="new-price">
KES ${product.price}
</span>

<span class="old-price">
KES ${product.oldPrice}
</span>

</div>

<button
class="buy-btn"
onclick="buyNow('${product.title}')">

Buy Now

</button>

</div>

`;

});

/* SCROLL */

container.scrollIntoView({
behavior:"smooth"
});

};
/* =========================
   CHANGE IMAGE
========================= */

window.changeImage =
function(index,image){

document.getElementById(
`mainImage-${index}`
).src = image;

};

/* =========================
   BUY NOW
========================= */

window.buyNow =
function(productName){

const referral =
localStorage.getItem(
"referralCode"
);

if(referral){

alert(
`Buying: ${productName}
Referral: ${referral}`
);

}else{

alert(
`Buying: ${productName}`
);

}

};

/* =========================
   CLOSE SUBMENUS
========================= */

window.closeAllSubmenus =
function(){

const menus =
document.querySelectorAll(
'.minor-menu'
);

menus.forEach(menu => {

menu.style.display = 'none';

});

};
