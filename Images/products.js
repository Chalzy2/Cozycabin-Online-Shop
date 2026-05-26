const products = {

shoes: [

{
title: "Classic Black Sneakers",

price: 1999,

sizes: [41,42,43,44],

description:
"Comfortable lightweight sneakers for daily wear.",

images: [
"Image/black shoes.webp",
"Image/Greyshoes.webp",
"Image/gold shoes.webp",
},

{
title: "Ladies Fashion Sneakers",

price: 1999,

sizes: [41,42,43,44],

description:
"Stylish ladies sneakers with soft inner comfort.",

images: [
"Image/women Wshoe.webp",
"Image/women Bshoes.webp"
]
}

]

};
function showCategory(category){

const container =
document.getElementById("products-container");

container.innerHTML = "";

products[category].forEach((product,index)=>{

container.innerHTML += `

<div class="product-card">

<img
id="product-image-${index}"
src="${product.images[0]}"
>

<h2>${product.title}</h2>

<p>${product.description}</p>

<h3 class="price">
KES ${product.price}
</h3>

<p><b>Available Sizes:</b></p>

<div class="sizes">

${product.sizes.map(size => `
<button>${size}</button>
`).join("")}

</div>

<p><b>Colors:</b></p>

<div class="color-options">

${product.images.map((image,imgIndex)=>`

<button
class="color-btn"
onclick="changeImage(${index}, '${image}')">
</button>

`).join("")}

</div>

<details>

<summary>More Details</summary>

<p>
Premium quality fashion sneakers.
Durable sole, breathable fabric,
comfortable for long wear.
</p>

</details>

</div>

`;

});

}
function changeImage(index,image){

document.getElementById(
`product-image-${index}`
).src = image;

}

const products = {

shoes: [

{
title: "Adidas Casual",
price: 3200,
sizes: [40,41,42,43,44,45],
images: [
"images/fashion/shoes/adidas-black.webp"
]
},

{
title: "Calvin Klein Casual",
price: 3200,
sizes: [40,41,42,43,44,45],
images: [
"images/fashion/shoes/calvin-brown.webp"
]
}
  {
title: "Lacoste Casual",

price: 3200,

sizes: [40,41,42,43,44,45],

description:
"Stylish Lacoste casual shoes suitable for both casual and smart outfits.",

images: [

"images/fashion/shoes/lacoste-blue.webp"

]

},
 {
title: "Timberland Casual",

price: 3200,

sizes: [40,41,42,43,44,45],

description:
"Elegant Timberland casual shoes designed for smart everyday fashion.",

images: [

"images/fashion/shoes/timber-black.webp",

"images/fashion/shoes/timber-white.webp"

]

},
   

]

};
showCategory('shoes');

