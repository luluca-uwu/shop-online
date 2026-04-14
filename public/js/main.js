import { getProductsAPI, addProductAPI, deleteProductAPI, checkoutAPI } from "./api.js";
import { addToCart, removeFromCart, getCart } from "./cart.js";
import { renderProducts, renderCart } from "./ui.js";

// Load sản phẩm
async function loadProducts() {
    const data = await getProductsAPI();
    renderProducts(data);
}

// UI handlers (gắn vào window để HTML gọi được)
window.addToCartUI = (id, name, price) => {
    addToCart({ id, name, price });
    renderCart();
};

window.removeFromCartUI = (id) => {
    removeFromCart(id);
    renderCart();
};

window.deleteProductUI = async (id) => {
    await deleteProductAPI(id);
    loadProducts();
};

window.addProduct = async () => {
    const name = document.getElementById("name").value;
    const price = document.getElementById("price").value;
    const image = document.getElementById("image").value;

    await addProductAPI({ name, price, image });
    loadProducts();
};

window.checkout = async () => {
    const cart = getCart();

    if (cart.length === 0) {
        alert("Giỏ hàng trống!");
        return;
    }

    await checkoutAPI(cart);
    alert("Thanh toán thành công!");

    localStorage.removeItem("cart");
    renderCart();
};

// init
loadProducts();
renderCart();