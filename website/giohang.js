// Lấy giỏ hàng từ localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Cập nhật giỏ hàng overlay
function updateCart() {
    const cartContent = document.getElementById('cartContent');
    cartContent.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image_url || 'placeholder.jpg'}" alt="${item.product_name}">
            <div class="item-details">
                <p>${item.product_name} - ${Number(item.price_promotion).toLocaleString('vi-VN')}đ</p>
                <p>Size: ${item.size || 'M'}, Số lượng: ${item.quantity}</p>
            </div>
            <button class="remove-btn" style="float: right;" onclick="removeFromCart(${cart.indexOf(item)}, event)">×</button>
        </div>
    `).join('');
    document.getElementById('sum').textContent = cart.reduce((sum, item) => sum + item.price_promotion * item.quantity, 0).toLocaleString('vi-VN') + 'đ';
}

// Xóa sản phẩm khỏi giỏ hàng
function removeFromCart(index, event) {
    event.stopPropagation();
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
}

// Toggle giỏ hàng overlay
function toggleCart() {
    const overlay = document.getElementById('cartOverlay');
    overlay.classList.toggle('active');
    updateCart();
}

// Thêm sản phẩm vào giỏ hàng
function addToCart(product) {
    const size = document.querySelector('input[name="size"]:checked')?.value;
    if (!size) {
        alert('Vui lòng chọn size trước khi thêm vào giỏ!');
        return;
    }
    const quantity = parseInt(document.getElementById('qtyInput').value) || 1;
    const item = { ...product, quantity, size };
    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Đã thêm vào giỏ hàng!');
    updateCart();
}

// Mua ngay (chuyển đến trang thanh toán)
function buyNow(product) {
    const size = document.querySelector('input[name="size"]:checked')?.value;
    if (!size) {
        alert('Vui lòng chọn size trước khi mua!');
        return;
    }
    const quantity = parseInt(document.getElementById('qtyInput').value) || 1;
    const item = { ...product, quantity, size };
    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
    window.location.href = 'thanhtoan.html';
}

// Khởi tạo giỏ hàng khi tải trang
window.addEventListener('load', updateCart);

