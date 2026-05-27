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
"Premium Calvin Klein casual sneakers with durable sole and soft inner comfort.",

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
"Elegant Timberland casual shoes designed for smart everyday fashion.",

images: [

"Images/timber-black.webp",

"Images/timber-white.webp"

]

},

{

title: "Adidas Casual",

company: "Adidas",

price: 3200,

oldPrice: 4000,

sizes: [40,41,42,43,44,45],

colors: ["Black","Gray"],

description:
"Modern Adidas casual sneakers with lightweight comfort and premium finishing.",

images: [

"Images/adidas-black.webp",

"Images/adidas-gray.webp"

]

},

{

title: "Lacoste Casual",

company: "Lacoste",

price: 3200,

oldPrice: 4000,

sizes: [40,41,42,43,44,45],

colors: ["Blue"],

description:
"Stylish Lacoste casual shoes suitable for both casual and official outfits.",

images: [

"Images/lacoste-blue.webp"

]

},

{

title: "Tommy Casual",

company: "Tommy",

price: 3200,

oldPrice: 4000,

sizes: [40,41,42,43,44,45],

colors: ["Brown"],

description:
"Stylish Tommy casual shoes suitable for both casual and official outfits.",

images: [

"Images/tommy-brown.webp"

]

}

],

shirts: [],
hoodies: [],
watches: [],
bags: [],
caps: [],
jeans: [],
jackets: [],

/* =========================
   KITCHEN
========================= */

cutlery: [],
dispenser: [],
hotpots: [],
racks: [],
flasks: [],
bottles: [],
cookers: [],
blenders: [],

/* =========================
   SOLAR
========================= */

solarlights: [],
panels: [],
inverters: [],
batteries: [],
streetlights: [],
floodlights: [],
chargers: [],
fans: [],

/* =========================
   DECOR
========================= */

wallart: [],
mirrors: [],
flowers: [],
lamps: [],
carpets: [],
curtains: [],
frames: [],
vases: [],

/* =========================
   BEDDINGS
========================= */

duvets: [],
bedsheets: [],
blankets: [],
pillows: [],
mattress: [],
covers: [],
nets: [],
towels: [],

/* =========================
   SECURITY
========================= */

cameras: [],
alarms: [],
locks: [],
doorbells: [],
trackers: [],
sensors: [],
safes: [],
recorders: [],

/* =========================
   ELECTRONICS
========================= */

speakers: [],
radios: [],
earbuds: [],
tvbox: [],
powerbanks: [],
flashdisks: [],
smartwatch: [],
gaming: [],

/* =========================
   SMARTTECH
========================= */

phones: [],
laptops: [],
tablets: [],
routers: [],
keyboards: [],
mouse: [],
printers: [],
storage: [],

/* =========================
   APPLIANCES
========================= */

fridges: [],
microwaves: [],
washing: [],
cookersapp: [],
kettles: [],
irons: [],
heaters: [],
fansapp: []

};



/* =========================
   SHOW PRODUCTS
========================= */

function showProducts(category){

closeAllSubmenus();

const container =
document.getElementById(
"products-container"
);

if(!container) return;
 // Reset content and ensure it's visible
    container.innerHTML = "";
    container.style.display = "grid"; // Explicitly set to grid to force visibility


if(
!products[category] ||
products[category].length === 0
){

container.innerHTML = `

<div class="empty-products">

<h2>No Products Yet</h2>

<p>
Products for this category
will appear here soon.
</p>

</div>

`;

container.scrollIntoView({

behavior:"smooth"

});

return;

}

products[category].forEach((product,index)=>{

container.innerHTML += `

<div class="product-card">

<div class="product-gallery">

<img
id="mainImage-${index}"
src="${product.images[0]}"
class="main-product-image"
loading="lazy"
>

</div>

<div class="thumbnail-row">

${product.images.map((img)=>`

<img
src="${img}"
class="thumb-image"
onclick="changeImage(${index}, '${img}')"
loading="lazy"
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

<div class="sizes-box">

<h4>Available Sizes</h4>

<div class="sizes-row">

${product.sizes.map(size => `

<button class="size-btn">

${size}

</button>

`).join("")}

</div>

</div>

<div class="colors-box">

<h4>Colors</h4>

<div class="colors-row">

${product.colors.map(color => `

<button class="color-btn">

${color}

</button>

`).join("")}

</div>

</div>

<button
class="buy-btn"
onclick="buyNow('${product.title}')">

Buy Now

</button>

<button class="cart-btn">

Add to Cart

</button>

<details class="details-box">

<summary>

More Details

</summary>

<p>

Premium quality product.
Comfortable, durable,
stylish and suitable for
daily use.

</p>

</details>

<div class="similar-products">

<h4>Find Similar</h4>

<p>

More related products
coming soon.

</p>

</div>

</div>

`;

});

container.scrollIntoView({

behavior:"smooth"

});

}



/* =========================
   CHANGE PRODUCT IMAGE
========================= */

function changeImage(index,image){

document.getElementById(
`mainImage-${index}`
).src = image;

}



/* =========================
   BUY NOW
========================= */

function buyNow(productName){

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

}



/* =========================
   CLOSE ALL SUBMENUS
========================= */

function closeAllSubmenus() {
    const menus = document.querySelectorAll('.minor-menu');
    menus.forEach(menu => {
        menu.style.display = 'none';
    });

    // Hide the products container when closing the menu
    const container = document.getElementById("products-container");
    if (container) {
        container.style.display = 'none';
    }
}


/* =========================
   BACK BUTTON
========================= */

function goBack(){

closeAllSubmenus();

document.getElementById(
"products-container"
).innerHTML = "";

window.scrollTo({

top:0,

behavior:"smooth"

});

   }
