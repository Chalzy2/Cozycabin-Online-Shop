const urlParams =
new URLSearchParams(
window.location.search
);

const referralCode =
urlParams.get("ref");

const category =
urlParams.get("category");

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

"Image/black shoes.webp",

"Image/Greyshoes.webp",

"Image/gold shoes.webp"

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

"Image/women Wshoe.webp",

"Image/women Bshoes.webp"

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

"images/fashion/shoes/calvin-brown.webp",

"images/fashion/shoes/calvin-blue.webp",

"images/fashion/shoes/calvin-tan.webp"

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

"images/fashion/shoes/timber-black.webp",

"images/fashion/shoes/timber-white.webp"

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

"images/fashion/shoes/adidas-black.webp",

"images/fashion/shoes/adidas-gray.webp"

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

"images/fashion/shoes/lacoste-blue.webp"

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
   TECH
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
   SHOW PRODUCTS (FIXED)
========================= */

function showProducts(category){

    const container = document.getElementById("products-container");

    // FIX: Stop the function if the container is missing from the current page
    if (!container) {
        console.warn("Product container not found on this page. Navigation mode active.");
        return; 
    }

    container.innerHTML = "";

    // Check if the category exists in your products object
    if(!products[category] || products[category].length === 0){
        container.innerHTML = `
            <div class="empty-products" style="text-align: center; padding: 50px 20px;">
                <h2 style="color: #ffcc00;">No Products Yet</h2>
                <p style="color: #cbd5e1;">Products for this category will appear here soon.</p>
            </div>
        `;
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
>

</div>



<div class="thumbnail-row">

${product.images.map((img)=>`

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

More related products coming soon.

</p>

</div>



</div>

`;

});

}





/* =========================
   CHANGE IMAGE
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
   OPEN CATEGORY
========================= */

function openCategory(category){

localStorage.setItem(
"selectedCategory",
category
);

const referral =
localStorage.getItem(
"referralCode"
);

if(referral){

window.location.href =
`product.html?category=${category}&ref=${referral}`;

}else{

window.location.href =
`product.html?category=${category}`;

}

}





/* =========================
   CLOSE SUBMENUS
========================= */

function closeAllSubmenus(){

const menus =
document.querySelectorAll(
'.minor-menu'
);

menus.forEach(menu => {

menu.style.display = 'none';

});

}





/* =========================
   AUTO LOAD PRODUCTS (FIXED)
========================= */
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get("category");

    if (categoryFromUrl) {
        showProducts(categoryFromUrl);
    }
});
