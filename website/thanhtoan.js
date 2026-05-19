const cartKey = "cart";
const FREE_SHIP_THRESHOLD = 500000; // >= 500k được freeship
const SHIPPING_FEE_DEFAULT = 30000; // nếu chưa đủ ngưỡng

function loadCart() {
    try { return JSON.parse(localStorage.getItem(cartKey)) || []; }
    catch { return []; }
}

function formatVND(n) { return (n || 0).toLocaleString("vi-VN") + "đ"; }
function getCouponFromSession() { return (sessionStorage.getItem("coupon") || "").toUpperCase().trim(); }
function calcDiscount(subtotal, code) {
    if (code === "GIAM10") {
        const d = Math.round(subtotal * 0.10);
        return Math.min(d, 200000);
    }
    return 0;
}

function renderCheckout() {
    const cart = loadCart();
    const wrap = document.getElementById("orderSummary");

    wrap.querySelectorAll(".order-item").forEach(el => el.remove());

    let subtotal = 0;

    if (!cart.length) {
        const empty = document.createElement("div");
        empty.className = "order-item";
        empty.innerHTML = "<p>Giỏ hàng trống.</p>";
        wrap.prepend(empty);
    } else {
        cart.forEach(item => {
            subtotal += item.price_promotion * item.quantity;
            const row = document.createElement("div");
            row.className = "order-item";
            row.innerHTML = `
                <img src="${item.image_url}" alt="Product Image">
                <div class="order-details">
                    <p>${item.product_name}</p>
                    <p class="variant">Size: ${item.size}</p>
                    <span class="quantity">x${item.quantity}</span>
                </div>
                <p class="price">
                    ${item.price === item.price_promotion
                        ? `<span class="price-promotion1">${formatVND(item.price)}</span>`
                        : `<span class="price-promotion1">${formatVND(item.price_promotion)}</span>
                           <span class="price-original1">${formatVND(item.price)}</span>`
                    }
                </p>`;
            const couponRow = wrap.querySelector(".summary-row");
            wrap.insertBefore(row, couponRow);
        });
    }

    document.getElementById("subtotalText").textContent = formatVND(subtotal);

    const code = getCouponFromSession();
    const discount = calcDiscount(subtotal, code);
    const discountRow = document.getElementById("discountRow");
    if (discount > 0) {
        discountRow.style.display = "";
        document.getElementById("discountText").textContent = "-" + formatVND(discount);
    } else {
        discountRow.style.display = "none";
    }

    let shippingFee = 0;
    if (subtotal - discount >= FREE_SHIP_THRESHOLD || subtotal === 0) {
        shippingFee = 0;
        document.getElementById("shippingText").textContent = "Miễn phí";
    } else {
        shippingFee = SHIPPING_FEE_DEFAULT;
        document.getElementById("shippingText").textContent = formatVND(shippingFee);
    }

    const total = Math.max(0, subtotal - discount) + shippingFee;
    document.getElementById("totalText").innerHTML = `${formatVND(total)} <span>VND</span>`;
}

// Áp mã giảm giá
document.getElementById("applyCouponBtn").addEventListener("click", () => {
    const code = (document.getElementById("couponInput").value || "").trim().toUpperCase();
    if (!code) {
        sessionStorage.removeItem("coupon");
        renderCheckout();
        return;
    }
    if (code === "GIAM10") {
        sessionStorage.setItem("coupon", code);
        alert("Áp dụng mã GIAM10 thành công (giảm 10%, tối đa 200.000đ).");
    } else {
        sessionStorage.removeItem("coupon");
        alert("Mã giảm giá không hợp lệ!");
    }
    renderCheckout();
});

/* ✅ tự đồng bộ khi giỏ ở tab khác thay đổi */
window.addEventListener("storage", (e) => {
    if (e.key === "cart" || e.key === "cart_updated_at") {
        renderCheckout();
    }
});

renderCheckout();

// Lấy form checkout
const checkoutForm = document.querySelector("form");

checkoutForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const cart = loadCart();
    if (!cart.length) {
        alert("Giỏ hàng đang trống!");
        return;
    }

    // Lấy thông tin từ form
    const name = checkoutForm.querySelector('input[placeholder="Họ và tên"]').value;
    const email = checkoutForm.querySelector('input[type="email"]').value;
    const phone = checkoutForm.querySelector('input[type="tel"]').value;
    const address = Array.from(checkoutForm.querySelectorAll(".address-group select")).map(sel => sel.value).join(", ");

    const subtotal = cart.reduce((sum, item) => sum + item.price_promotion * item.quantity, 0);
    const code = getCouponFromSession();
    const discount = calcDiscount(subtotal, code);
    const shippingFee = (subtotal - discount >= FREE_SHIP_THRESHOLD || subtotal === 0) ? 0 : SHIPPING_FEE_DEFAULT;
    const total = Math.max(0, subtotal - discount) + shippingFee;

    // Tạo object đơn hàng
    const orderData = {
        customer_name: name,
        email,
        phone,
        address,
        items: cart,
        subtotal,
        discount,
        shippingFee,
        total,
        coupon: code,
        order_date: new Date().toISOString(), // Thêm thời gian đặt hàng
        status: 1 // Trạng thái mặc định: Đang xử lý
    };

    try {
        const res = await fetch("http://localhost:3000/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData)
        });

        if (!res.ok) throw new Error("Lỗi khi gửi đơn hàng");

        alert("Đặt hàng thành công! Cảm ơn bạn đã mua sắm.");

        // Xóa giỏ hàng local
        localStorage.removeItem(cartKey);
        sessionStorage.removeItem("coupon");

        // Reset form
        checkoutForm.reset();

        // Render lại giỏ hàng trống
        renderCheckout();

        // Cập nhật overlay giỏ hàng nếu tồn tại
        const cartContent = document.getElementById("cartContent");
        if (cartContent) {
            cartContent.innerHTML = "<p>Giỏ hàng trống.</p>";
            const sum = document.getElementById("sum");
            if (sum) sum.textContent = "0đ";
        }

        // Trigger sự kiện storage để thông báo các tab khác
        localStorage.setItem("cart_updated_at", new Date().getTime());

    } catch (err) {
        console.error(err);
        alert("Có lỗi xảy ra, vui lòng thử lại.");
    }
});