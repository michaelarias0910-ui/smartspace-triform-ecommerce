
/* ==========================================
   SMARTSPACE CREATION
   TRIFORM DESK CHECKOUT ENGINE
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    "use strict";

    const CART_KEY = "smartspace_triform_cart";
    const ORDER_KEY = "smartspace_triform_orders";
    const MAX_QUANTITY = 99;

    const form = document.getElementById("checkoutForm");
    const checkoutEmpty = document.getElementById("checkoutEmpty");
    const checkoutItems = document.getElementById("checkoutItems");

    const checkoutQuantity = document.getElementById("checkoutQuantity");
    const checkoutSubtotal = document.getElementById("checkoutSubtotal");
    const checkoutShipping = document.getElementById("checkoutShipping");
    const checkoutTotal = document.getElementById("checkoutTotal");

    const checkoutMessage = document.getElementById("checkoutMessage");
    const placeOrderButton = document.getElementById("placeOrderButton");

    const currency = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2
    });

    function money(amount) {
        return currency.format(amount);
    }

    function readJSON(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            console.error("Storage read error:", error);
            return fallback;
        }
    }

    function getCart() {
        const cart = readJSON(CART_KEY, []);

        if (!Array.isArray(cart)) {
            return [];
        }

        return cart.filter(item => {
            return item &&
                typeof item.variantSKU === "string" &&
                Number.isFinite(Number(item.price)) &&
                Number(item.price) > 0 &&
                Number.isInteger(Number(item.quantity)) &&
                Number(item.quantity) >= 1 &&
                Number(item.quantity) <= MAX_QUANTITY;
        }).map(item => ({
            ...item,
            price: Number(item.price),
            quantity: Number(item.quantity),
            subtotal: Number(item.price) * Number(item.quantity)
        }));
    }

    function getTotals(cart) {
        return {
            quantity: cart.reduce(
                (total, item) => total + item.quantity, 0
            ),
            subtotal: cart.reduce(
                (total, item) => total + item.price * item.quantity, 0
            )
        };
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(
            /[&<>"']/g,
            character => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            })[character]
        );
    }

    function renderCheckout() {

        const cart = getCart();
        const totals = getTotals(cart);
        const hasItems = cart.length > 0;

        checkoutEmpty.hidden = hasItems;
        form.hidden = !hasItems;

        if (!hasItems) {
            return;
        }

        checkoutQuantity.textContent = totals.quantity;
        checkoutSubtotal.textContent = money(totals.subtotal);

        // Shipping is not yet configured.
        checkoutShipping.textContent = "Pending";
        checkoutTotal.textContent =
            money(totals.subtotal) + " + Shipping";

        checkoutItems.innerHTML = cart.map(item => `
            <div class="checkout-item">

                <div>
                    <div class="checkout-item-name">
                        ${escapeHTML(item.productName)}
                    </div>

                    <div class="checkout-item-detail">
                        ${escapeHTML(item.size)} /
                        ${escapeHTML(item.color)} /
                        Qty: ${item.quantity}
                    </div>
                </div>

                <strong class="checkout-item-price">
                    ${money(item.price * item.quantity)}
                </strong>

            </div>
        `).join("");

    }

    // PHONE INPUT: Philippine mobile number format.
    const phoneInput = document.getElementById("customerPhone");

    phoneInput.addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, "").slice(0, 11);
    });

    // POSTAL CODE: Four digits.
    const postalInput = document.getElementById("postalCode");

    postalInput.addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, "").slice(0, 4);
    });

    // SUBMIT ORDER REQUEST.
    form.addEventListener("submit", function (event) {

        event.preventDefault();

        checkoutMessage.textContent = "";

        if (!form.reportValidity()) {
            return;
        }

        const cart = getCart();

        if (cart.length === 0) {
            alert("Your shopping cart is empty.");
            renderCheckout();
            return;
        }

        const totals = getTotals(cart);

        const paymentMethod = form.querySelector(
            'input[name="paymentMethod"]:checked'
        );

        if (!paymentMethod) {
            alert("Please select a payment method.");
            return;
        }

        // Ensure required policies are accepted.
        if (
            !document.getElementById("agreeShipping").checked ||
            !document.getElementById("agreeReturn").checked ||
            !document.getElementById("agreePrivacy").checked
        ) {
            alert("Please review and accept all required policies.");
            return;
        }

        const orderId = "SSC-" +
            Date.now().toString().slice(-10);

        const selectedPayment = paymentMethod.value;

        const isCOD = selectedPayment === "Cash on Delivery";

        const order = {

            orderId: orderId,

            company: "Smartspace Creation",

            product: "TriForm Desk",

            customer: {
                name: document.getElementById("customerName").value.trim(),
                phone: phoneInput.value.trim(),
                email: document.getElementById("customerEmail").value.trim()
            },

            deliveryAddress: {
                region: document.getElementById("region").value,
                province: document.getElementById("province").value.trim(),
                city: document.getElementById("city").value.trim(),
                barangay: document.getElementById("barangay").value.trim(),
                postalCode: postalInput.value.trim(),
                streetAddress: document.getElementById("streetAddress").value.trim(),
                instructions: document.getElementById("deliveryInstructions").value.trim()
            },

            items: cart,

            totalQuantity: totals.quantity,

            subtotal: totals.subtotal,

            shippingFee: null,

            totalAmount: null,

            payment: {
                method: selectedPayment,
                status: isCOD ? "Pending COD" : "Awaiting Payment Gateway",
                verified: false
            },

            orderStatus: "Checkout Request - Pending Review",

            deliveryStatus: "Not Yet Dispatched",

            trackingNumber: null,

            policiesAccepted: {
                shipping: true,
                returns: true,
                privacy: true
            },

            createdAt: new Date().toISOString(),

            storageType: "Local browser - temporary development record"

        };

        // Prevent duplicate submissions while saving.
        placeOrderButton.disabled = true;
        placeOrderButton.textContent = "SAVING REQUEST...";

        try {

            const existingOrders = readJSON(ORDER_KEY, []);

            if (!Array.isArray(existingOrders)) {
                throw new Error("Invalid order storage.");
            }

            existingOrders.push(order);

            localStorage.setItem(
                ORDER_KEY,
                JSON.stringify(existingOrders)
            );

            // Preserve cart until the confirmation/database phase.
            checkoutMessage.style.color = "#267346";

            checkoutMessage.textContent =
                "Checkout request saved locally. Reference: " +
                orderId +
                ". This is not yet a confirmed or paid order.";

            console.log("Checkout request:", order);

            alert(
                "Checkout request saved locally.\n\n" +
                "Reference: " + orderId + "\n\n" +
                "Order status: Pending Review\n" +
                "Payment status: " + order.payment.status +
                "\n\nThis is a development record only. " +
                "It has not yet been transmitted to Smartspace Creation."
            );

            placeOrderButton.textContent = "REQUEST SAVED";

        } catch (error) {

            console.error("Order saving error:", error);

            checkoutMessage.style.color = "#B42318";

            checkoutMessage.textContent =
                "Unable to save your request. Please check browser storage.";

            placeOrderButton.disabled = false;

            placeOrderButton.textContent = "SUBMIT ORDER REQUEST";

        }

    });

    // COPYRIGHT YEAR.
    const year = document.getElementById("currentYear");

    if (year) {
        year.textContent = new Date().getFullYear();
    }

    // INITIALIZE.
    renderCheckout();

    console.log("--------------------------------");
    console.log("SMARTSPACE CREATION");
    console.log("TRIFORM DESK CHECKOUT");
    console.log("Checkout page initialized.");
    console.log("Order storage:", ORDER_KEY);
    console.log("Shipping: Pending configuration");
    console.log("Payment gateway: Not yet connected");
    console.log("--------------------------------");

});
