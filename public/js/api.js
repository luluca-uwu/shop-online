const API = "http://localhost:3000";
// Lấy danh sách sản phẩm
export async function getProductsAPI() {
    const res = await fetch(API + "/products");
    return await res.json();
}
// Thêm sản phẩm
export async function addProductAPI(data) {
    await fetch(API + "/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}
// Xóa sản phẩm
export async function deleteProductAPI(id) {
    await fetch(API + "/products/" + id, {
        method: "DELETE"
    });
}
// Đặt hàng
export async function checkoutAPI(cart) {
    await fetch("http://localhost:3000/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": getToken()
        },
        body: JSON.stringify({ cart })
    });
}