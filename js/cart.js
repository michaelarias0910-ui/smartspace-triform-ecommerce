
/* ==========================================
   SMARTSPACE CREATION
   TRIFORM DESK SHOPPING CART ENGINE
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    "use strict";

    // SHARED CART STORAGE
    const CART_KEY = "smartspace_triform_cart";

    // ELEMENTS
    const cartItemsContainer =
        document.getElementById("cartItems");

    const emptyCart =
        document.getElementById("emptyCart");

    const clearCartButton =
        document.getElementById("clearCart");

    const checkoutButton =
        document.getElementById("checkoutButton");

    const cartItemCount =
        document.getElementById("cartItemCount");

    const headerCartCount =
        document.getElementById("headerCartCount");

    const summaryQuantity =
        document.getElementById("summaryQuantity");

    const summarySubtotal =
        document.getElementById("summarySubtotal");

    const estimatedTotal =
        document.getElementById("estimatedTotal");


    // CURRENCY FORMAT
    const formatter = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2
    });

    function money(value) {
        return formatter.format(value);
    }


    // READ CART
    function getCart() {

        try {

            const storedCart =
                localStorage.getItem(CART_KEY);

            if (!storedCart) {
                return [];
            }

            const parsedCart = JSON.parse(storedCart);

            if (!Array.isArray(parsedCart)) {
                return [];
            }

            // Validate each stored item.
            return parsedCart.filter(item => {

                return (
                    item &&
                    typeof item.variantSKU === "string" &&
                    typeof item.productName === "string" &&
                    Number.isFinite(Number(item.price)) &&
                    Number(item.price) > 0 &&
                    Number.isInteger(Number(item.quantity)) &&
                    Number(item.quantity) >= 1 &&
                    Number(item.quantity) <= 99
                );

            }).map(item => ({

                ...item,

                price: Number(item.price),

                quantity: Number(item.quantity),

                subtotal:
                    Number(item.price) * Number(item.quantity)

            }));

        } catch (error) {

            console.error("Cart reading error:", error);

            return [];

        }

    }


    // SAVE CART
    function saveCart(cart) {

        try {

            localStorage.setItem(
                CART_KEY,
                JSON.stringify(cart)
            );

            return true;

        } catch (error) {

            console.error("Cart saving error:", error);

            alert(
                "Unable to save your cart. " +
                "Please check your browser storage."
            );

            return false;

        }

    }


    // SAFE HTML TEXT
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


    // VALIDATE PRODUCT IMAGE PATH
    function getSafeImagePath(item) {

        const image = String(item.image || "");

        if (
            /^assets\/products\/[a-z0-9_-]+\.(jpg|jpeg|png|webp)$/i.test(image) ||
            image === "assets/logo/triform-desk-logo.png"
        ) {
            return image;
        }

        return "assets/logo/triform-desk-logo.png";

    }


    // CALCULATE TOTAL QUANTITY
    function calculateQuantity(cart) {

        return cart.reduce(
            (total, item) => total + item.quantity,
            0
        );

    }


    // CALCULATE SUBTOTAL
    function calculateSubtotal(cart) {

        return cart.reduce(
            (total, item) =>
                total + item.price * item.quantity,
            0
        );

    }


    // UPDATE CART DISPLAY
    function renderCart() {

        const cart = getCart();

        const totalQuantity = calculateQuantity(cart);

        const subtotal = calculateSubtotal(cart);

        const hasItems = cart.length > 0;


        // CART COUNTS

        cartItemCount.textContent =
            totalQuantity +
            (totalQuantity === 1 ? " item" : " items");

        headerCartCount.textContent = totalQuantity;

        summaryQuantity.textContent = totalQuantity;


        // ORDER TOTALS

        summarySubtotal.textContent = money(subtotal);

        // Shipping is calculated during checkout.
        estimatedTotal.textContent =
            money(subtotal) + " + Shipping";


        // BUTTON STATES

        checkoutButton.disabled = !hasItems;

        clearCartButton.disabled = !hasItems;

        clearCartButton.style.opacity =
            hasItems ? "1" : "0.45";


        // EMPTY CART

        emptyCart.hidden = hasItems;

        cartItemsContainer.hidden = !hasItems;


        if (!hasItems) {

            cartItemsContainer.innerHTML = "";

            return;

        }


        // GENERATE CART ITEMS

        cartItemsContainer.innerHTML = cart.map(
            (item, index) => {

                const image = getSafeImagePath(item);

                const itemSubtotal =
                    item.price * item.quantity;

                return `

                    <article class="cart-item">

                        <div class="cart-item-image">

                            <img
                                src="${escapeHTML(image)}"
                                alt="${escapeHTML(item.productName)}"
                                onerror="this.onerror=null;this.src='assets/logo/triform-desk-logo.png';">

                        </div>


                        <div class="cart-item-details">

                            <div class="cart-item-top">

                                <div>

                                    <h3 class="cart-item-name">
                                        ${escapeHTML(item.productName)}
                                    </h3>

                                    <p class="cart-item-sku">
                                        SKU: ${escapeHTML(item.variantSKU)}
                                    </p>

                                </div>

                                <strong class="cart-item-price">
                                    ${money(item.price)}
                                </strong>

                            </div>


                            <div class="cart-item-options">

                                <span>
                                    Size: ${escapeHTML(item.size)}
                                </span>

                                <span> | </span>

                                <span>
                                    Color: ${escapeHTML(item.color)}
                                </span>

                            </div>


                            <p class="cart-item-subtotal">

                                Item Subtotal:
                                <strong>${money(itemSubtotal)}</strong>

                            </p>


                            <div class="cart-item-actions">

                                <div class="cart-quantity">

                                    <button
                                        type="button"
                                        data-action="decrease"
                                        data-index="${index}"
                                        aria-label="Decrease quantity">
                                        −
                                    </button>

                                    <span>${item.quantity}</span>

                                    <button
                                        type="button"
                                        data-action="increase"
                                        data-index="${index}"
                                        aria-label="Increase quantity">
                                        +
                                    </button>

                                </div>


                                <button
                                    type="button"
                                    class="remove-item-button"
                                    data-action="remove"
                                    data-index="${index}">

                                    Remove Item

                                </button>

                            </div>

                        </div>

                    </article>

                `;

            }

        ).join("");

    }


    // CART ITEM ACTIONS
    cartItemsContainer.addEventListener(
        "click",
        function (event) {

            const button = event.target.closest(
                "button[data-action]"
            );

            if (!button) {
                return;
            }

            const action = button.dataset.action;

            const index = Number(button.dataset.index);

            const cart = getCart();

            if (
                !Number.isInteger(index) ||
                index < 0 ||
                index >= cart.length
            ) {
                return;
            }


            // INCREASE QUANTITY

            if (action === "increase") {

                if (cart[index].quantity >= 99) {

                    alert(
                        "Maximum quantity per variant is 99."
                    );

                    return;

                }

                cart[index].quantity++;

            }


            // DECREASE QUANTITY

            else if (action === "decrease") {

                if (cart[index].quantity > 1) {

                    cart[index].quantity--;

                } else {

                    const remove = confirm(
                        "This item has a quantity of 1. " +
                        "Would you like to remove it from your cart?"
                    );

                    if (!remove) {
                        return;
                    }

                    cart.splice(index, 1);

                }

            }


            // REMOVE ITEM

            else if (action === "remove") {

                const remove = confirm(
                    "Are you sure you want to remove " +
                    cart[index].productName +
                    " (" + cart[index].size +
                    " / " + cart[index].color +
                    ") from your cart?"
                );

                if (!remove) {
                    return;
                }

                cart.splice(index, 1);

            }


            // UPDATE ITEM SUBTOTALS

            cart.forEach(item => {

                item.subtotal =
                    item.price * item.quantity;

            });


            if (saveCart(cart)) {

                renderCart();

            }

        }

    );


    // CLEAR ENTIRE CART
    clearCartButton.addEventListener(
        "click",
        function () {

            const cart = getCart();

            if (cart.length === 0) {
                return;
            }

            const confirmed = confirm(
                "Are you sure you want to delete ALL " +
                "items from your shopping cart?"
            );

            if (!confirmed) {
                return;
            }

            if (saveCart([])) {

                renderCart();

            }

        }

    );


    // CHECKOUT BUTTON
    checkoutButton.addEventListener(
        "click",
        function () {

            const cart = getCart();

            if (cart.length === 0) {

                alert("Your shopping cart is empty.");

                return;

            }

            // Checkout will be implemented in Phase 5.
            alert(
    "Your cart is ready! Checkout and customer information " +
    "will be activated in Phase 5."
);

        }

    );


    // AUTOMATIC COPYRIGHT YEAR
    const currentYear =
        document.getElementById("currentYear");

    if (currentYear) {

        currentYear.textContent =
            new Date().getFullYear();

    }


    // INITIALIZE
    renderCart();

    console.log("--------------------------------");

    console.log("SMARTSPACE CREATION");

    console.log("TRIFORM DESK SHOPPING CART");

    console.log("Cart loaded successfully.");

    console.log("Current cart:", getCart());

    console.log("Total quantity:", calculateQuantity(getCart()));

    console.log("Total subtotal:", money(
        calculateSubtotal(getCart())
    ));

    console.log("--------------------------------");

});
