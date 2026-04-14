export function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

export function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

export function addToCart(item) {
    let cart = getCart();

    const index = cart.findIndex(p => p.id === item.id);

    if (index >= 0) {
        cart[index].quantity++;
    } else {
        cart.push({ ...item, quantity: 1 });
    }

    saveCart(cart);
}

export function removeFromCart(id) {
    let cart = getCart().filter(item => item.id !== id);
    saveCart(cart);
}