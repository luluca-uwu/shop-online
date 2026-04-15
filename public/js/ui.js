  import { getCart } from "./cart.js";

  // =======================
  // RENDER PRODUCTS
  // =======================
export function renderProducts(products) {
  const token = localStorage.getItem("token");

  let html = "";

  products.forEach(p => {
    html += `
      <div class="col-md-3">
        <div class="card product-card mb-4 p-3 shadow-sm">

          <img src="http://localhost:3000${p.image}" class="img-fluid mb-2">

          <h5>${p.name}</h5>
          <p class="text-danger fw-bold">${p.price} VND</p>

          <button class="btn btn-primary w-100 mb-2"
            onclick="addToCartUI(${p.id}, '${p.name}', ${p.price})">
            🛒 Thêm vào giỏ
          </button>

          ${token && token !== "null" && token !== "undefined"
        ? `<button class="btn btn-danger w-100"
                  onclick="deleteProductUI(${p.id})">
                  Xóa
                </button>`
        : ""
      }

        </div>
      </div>
    `;
  });

  document.getElementById("product-list").innerHTML = html;
}

  // =======================
  // RENDER CART
  // =======================
  export function renderCart() {
    const cart = getCart();

    let html = "";
    let total = 0;

    cart.forEach(item => {
      total += item.price * item.quantity;

      html += `
          <div class="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">

              <div>
                  <b>${item.name}</b><br>
                  ${item.price} x ${item.quantity}
              </div>

              <button class="btn btn-sm btn-danger"
                  onclick="removeFromCartUI(${item.id})">
                  X
              </button>

          </div>
          `;
    });

    html += `
          <h5 class="mt-3 text-end">
              Tổng: <span class="text-danger">${total} VND</span>
          </h5>
      `;

    document.getElementById("cart").innerHTML = html;

    // =======================
    // BADGE SỐ LƯỢNG
    // =======================
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    const badge = document.getElementById("cart-count");
    if (badge) {
      badge.innerText = count;
    }
  }