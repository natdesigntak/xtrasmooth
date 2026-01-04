const CONFIG = {
    BRAND_NAME: "xtrasmooth",
    DOMAIN_BASE: "https://xtrasmooth.com",
    LINE_OA_URL: "https://lin.ee/jWmtvPJ",
    PRODUCT_NAME: "XtraSmooth",
    PRODUCT_SIZE: "1 ลิตร",
    PRICE_THB: 599
};

// State Management
let currentQty = parseInt(localStorage.getItem('xtra_qty')) || 1;

function updateQty(val) {
    currentQty = Math.max(1, Math.min(10, currentQty + val));
    localStorage.setItem('xtra_qty', currentQty);
    updateUI();
}

function updateUI() {
    const total = currentQty * CONFIG.PRICE_THB;
    
    // Update Landing Page
    const qtyInput = document.getElementById('main-qty');
    const totalDisplay = document.getElementById('total-price');
    if (qtyInput) qtyInput.value = currentQty;
    if (totalDisplay) totalDisplay.innerText = total.toLocaleString();

    // Update Checkout Page
    const checkoutQty = document.getElementById('checkout-qty');
    const checkoutTotal = document.getElementById('checkout-total');
    if (checkoutQty) checkoutQty.innerText = currentQty;
    if (checkoutTotal) checkoutTotal.innerText = total.toLocaleString();
}

function goToCheckout() {
    window.location.href = 'checkout.html';
}

function handlePaymentChange() {
    const stripeBox = document.getElementById('stripe-container');
    const slipBox = document.getElementById('slip-container');
    const method = document.querySelector('input[name="payment"]:checked').value;

    if (stripeBox) stripeBox.style.display = (method === 'stripe') ? 'block' : 'none';
    if (slipBox) slipBox.style.display = (method === 'transfer') ? 'block' : 'none';
    
    if (method === 'usdt') {
        const orderId = "XS-TEMP-" + Date.now();
        const msg = encodeURIComponent(`สวัสดีครับ ขอชำระด้วย USDT สำหรับออเดอร์ ${orderId} สินค้า XtraSmooth จำนวน ${currentQty} ขวด`);
        window.open(`${CONFIG.LINE_OA_URL}?text=${msg}`, '_blank');
    }
}

async function handleOrderSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const method = formData.get('payment');
    
    // Stripe handles its own logic via the buy-button component
    if (method === 'stripe') {
        alert('กรุณากดปุ่มชำระเงินของ Stripe ด้านล่างเพื่อดำเนินการต่อ');
        return;
    }

    const orderId = `XS-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const orderData = {
        orderId,
        qty: currentQty,
        total: currentQty * CONFIG.PRICE_THB,
        name: formData.get('name'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        note: formData.get('note'),
        paymentMethod: method,
        timestamp: new Date().getTime()
    };

    localStorage.setItem('last_order', JSON.stringify(orderData));
    window.location.href = `thankyou.html?order=${orderId}`;
}

// Initial Run
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    const orderForm = document.getElementById('checkout-form');
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmit);
    }
});