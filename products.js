/* =========================
   OPEN CATEGORY (POPUP PRODUCTS)
========================= */

function openCategory(category){

const container =
document.getElementById(
"products-container"
);

/* TOGGLE CLOSE IF SAME CATEGORY OPEN */

if(
container.style.display === "block" &&
container.dataset.active === category
){

container.style.display = "none";

container.innerHTML = "";

container.dataset.active = "";

return;

}

/* SHOW PRODUCTS */

container.style.display = "block";

container.dataset.active = category;

/* SCROLL TO PRODUCTS */

container.scrollIntoView({

behavior:"smooth",
block:"start"

});

/* LOAD PRODUCTS */

showProducts(category);

}
