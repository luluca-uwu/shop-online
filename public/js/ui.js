import { getCart } from "./cart.js";

export function renderProducts(products) {
    let html = "";

    products.forEach(p => {
        html += `
      <div class="col-md-3">
        <div class="card mb-4">
          <img src="${p.image}" class="card-img-top" style="height:200px;object-fit:cover">
          <div class="card-body">
            <h5>${p.name}</h5>
            <p>${p.price} VND</p>
            <button onclick="window.addToCartUI(${p.id}, '${p.name}', ${p.price})">🛒</button>
            <button onclick="window.deleteProductUI(${p.id})">Xóa</button>
          </div>
        </div>
      </div>
    `;
    });

    document.getElementById("product-list").innerHTML = html;
}

export function renderCart() {
    const cart = getCart();

    let html = "";
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;

        html += `
      <div>
        ${item.name} (${item.quantity})
        <button onclick="window.removeFromCartUI(${item.id})">Xóa</button>
      </div>
    `;
    });

    html += `<h3>Tổng: ${total}</h3>`;

    document.getElementById("cart").innerHTML = html;
}