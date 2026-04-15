import { getProductsAPI, addProductAPI, deleteProductAPI, checkoutAPI } from "./api.js";
import { addToCart, removeFromCart, getCart } from "./cart.js";
import { renderProducts, renderCart } from "./ui.js";

let allProducts = [];

// Load sản phẩm
async function loadProducts() {
    const data = await getProductsAPI();

    allProducts = data; // lưu lại

    renderProducts(data);
}

// Áp dụng filter và search
function applyFilter() {
    const keyword = document.getElementById("search").value.toLowerCase();
    const type = document.getElementById("filterPrice").value;

    let filtered = [...allProducts];

    if (keyword) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(keyword)
        );
    }

    if (type === "low") {
        filtered = filtered.filter(p => p.price < 100);
    } else if (type === "mid") {
        filtered = filtered.filter(p => p.price >= 100 && p.price <= 500);
    } else if (type === "high") {
        filtered = filtered.filter(p => p.price > 500);
    }

    renderProducts(filtered);
}

window.applyFilter = applyFilter;

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
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Bạn phải login!");
        return;
    }

    const name = document.getElementById("name").value;
    const price = document.getElementById("price").value;
    const file = document.getElementById("image").files[0];

    if (!name || !price) {
        alert("Nhập đầy đủ thông tin!");
        return;
    }

    if (!file) {
        alert("Chưa chọn ảnh!");
        return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("image", file);

    await fetch("http://localhost:3000/products", {
        method: "POST",
        headers: {
            "Authorization": token
        },
        body: formData
    });

    alert("Upload thành công!");

    // reset form
    document.getElementById("name").value = "";
    document.getElementById("price").value = "";
    document.getElementById("image").value = "";

    loadProducts();
};

window.checkout = async () => {
    const cart = getCart();
    const token = getToken();

    if (!token) {
        alert("Bạn chưa login!");
        return;
    }

    if (cart.length === 0) {
        alert("Giỏ hàng trống!");
        return;
    }

    await checkoutAPI(cart, token);

    alert("Thanh toán thành công!");
    localStorage.removeItem("cart");
    renderCart();
};

// UI helpers
function saveToken(token) {
    localStorage.setItem("token", token);
}

function getToken() {
    return localStorage.getItem("token");
}

//register
window.register = async () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        alert("Nhập đầy đủ thông tin!");
        return;
    }

    const res = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    console.log(data);

    alert("Đăng ký thành công!");
};

// LOGIN
window.login = async function () {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.token) {
        localStorage.setItem("token", data.token);

        alert("Login thành công!");

        // 🔥 QUAN TRỌNG
        updateUI();       // hiện logout
        renderProducts(allProducts); // hiện nút Xóa NGAY
    } else {
        alert(data.message || "Login thất bại");
    }
};

//lấy thông tin user từ token
function parseJwt(token) {
    try {
        const base64 = token.split('.')[1];
        const json = atob(base64);
        return JSON.parse(json);
    } catch (e) {
        console.log("Token lỗi:", e);
        return null;
    }
}

// update UI theo trạng thái login
function updateUI() {
    const token = localStorage.getItem("token");

    const userInfo = document.getElementById("user-info");
    const logoutBtn = document.getElementById("logout-btn");
    const addProductBox = document.getElementById("add-product-box");

    console.log("logoutBtn:", logoutBtn);

    // ❗ tránh crash
    if (!userInfo || !logoutBtn) {
        console.log("Chưa load xong HTML");
        return;
    }

    if (token) {
        const user = parseJwt(token);

        if (user && user.username) {
            userInfo.innerText = "👋 " + user.username;
        }

        logoutBtn.classList.remove("d-none");

        if (addProductBox) addProductBox.style.display = "block";

    } else {
        userInfo.innerText = "";
        logoutBtn.classList.add("d-none");

        if (addProductBox) addProductBox.style.display = "none";
    }
}

// 🔥 QUAN TRỌNG
window.updateUI = updateUI;

// Gọi updateUI khi load trang 
window.logout = () => {
    localStorage.removeItem("token");

    alert("Đã logout!");

    updateUI();
    renderProducts(allProducts); // ẩn nút Xóa ngay
};

// =======================
// MAIN
// =======================
window.onload = () => {
    loadProducts();
    renderCart();
    updateUI();

    // 🔥 FIX logout button
    const logoutBtn = document.getElementById("logout-btn");

    if (logoutBtn) {
        logoutBtn.onclick = () => {
            localStorage.removeItem("token");
            alert("Đã logout!");
            updateUI();
            renderProducts(allProducts);
        };
    }
};