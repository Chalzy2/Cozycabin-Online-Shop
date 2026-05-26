const products = {

shoes: [

{
title: "Classic Black Sneakers",

price: 1999,

sizes: [41,42,43,44],

description:
"Comfortable lightweight sneakers for daily wear.",

images: [
"images/fashion/shoes/black-shoe.webp",
"images/fashion/shoes/gray-shoe.webp",
"images/fashion/shoes/gold-shoe.webp"
]
},

{
title: "Ladies Fashion Sneakers",

price: 1999,

sizes: [41,42,43,44],

description:
"Stylish ladies sneakers with soft inner comfort.",

images: [
"images/fashion/shoes/ladies-white.webp",
"images/fashion/shoes/ladies-black.webp"
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
