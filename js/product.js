
/* ==========================================
   SMARTSPACE CREATION
   TRIFORM DESK PRODUCT ENGINE
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    // PRODUCT INFORMATION

    const PRODUCT = {
        id: "TRIFORM-DESK",
        name: "TriForm Desk",
        currency: "PHP",

        sizes: {
            "4-seater": {
                name: "4-Seater",
                price: 4999
            },

            "2-seater": {
                name: "2-Seater",
                price: 2499
            },

            "single": {
                name: "Single (1-Seater)",
                price: 1499
            }
        },

        colors: {
            "brown": {
                name: "Brown",
                image: null
            },

            "natural-oak": {
                name: "Natural Oak",
                image: null
            },

            "dark-walnut": {
                name: "Dark Walnut",
                image: null
            },

            "cherry-red": {
                name: "Cherry Red",
                image: null
            },

            "black-version": {
                name: "Black Version",
                image: null
            },

            "deep-emerald": {
                name: "Deep Emerald",
                image: null
            },

            "navy-sailing": {
                name: "Navy Sailing",
                image: null
            },

            "petal-blush": {
                name: "Petal Blush",
                image: null
            }
        }
    };


    // INITIAL SELECTION

    let selectedSize = "4-seater";
    let selectedColor = "brown";

    const MAX_QUANTITY = 99;
    const CART_KEY = "smartspace_triform_cart";


    // HTML ELEMENTS

    const priceElement =
        document.getElementById("productPrice");

    const subtotalElement =
        document.getElementById("subtotal");

    const quantityInput =
        document.getElementById("quantity");

    const selectedSizeLabel =
        document.getElementById("selectedSizeLabel");

    const selectedColorLabel =
        document.getElementById("selectedColorLabel");

    const productImage =
        document.getElementById("productImage");

    const imageVariantLabel =
        document.getElementById("imageVariantLabel");

    const addToCartButton =
        document.getElementById("addToCart");

    const cartMessage =
        document.getElementById("cartMessage");

    const cartCount =
        document.getElementById("cartCount");


    // CURRENCY FORMATTER

    const formatter = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2
    });

    function money(amount) {
        return formatter.format(amount);
    }


    // QUANTITY VALIDATION

    function getQuantity() {

        let quantity = Number(quantityInput.value);

        if (!Number.isFinite(quantity)) {
            quantity = 1;
        }

        quantity = Math.floor(quantity);

        quantity = Math.max(
            1,
            Math.min(MAX_QUANTITY, quantity)
        );

        quantityInput.value = quantity;

        return quantity;
    }


    // GET CURRENT PRODUCT PRICE

    function getPrice() {
        return PRODUCT.sizes[selectedSize].price;
    }


    // GENERATE VARIANT SKU

    function getVariantSKU() {

        const sizeCodes = {
            "4-seater": "4S",
            "2-seater": "2S",
            "single": "1S"
        };

        const colorCodes = {
            "brown": "BR",
            "natural-oak": "NO",
            "dark-walnut": "DW",
            "cherry-red": "CR",
            "black-version": "BK",
            "deep-emerald": "DE",
            "navy-sailing": "NS",
            "petal-blush": "PB"
        };

        return "TF-" +
            sizeCodes[selectedSize] +
            "-" +
            colorCodes[selectedColor];
    }


    // READ CART SAFELY

    function getCart() {

        try {

            const savedCart = localStorage.getItem(CART_KEY);

            if (!savedCart) {
                return [];
            }

            const cart = JSON.parse(savedCart);

            return Array.isArray(cart) ? cart : [];

        } catch (error) {

            console.error("Unable to read cart:", error);

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

            console.error("Unable to save cart:", error);

            return false;

        }

    }


    // UPDATE CART COUNT

    function updateCartCount() {

        const cart = getCart();

        const totalItems = cart.reduce(
            (total, item) => total + Number(item.quantity || 0),
            0
        );

        if (cartCount) {
            cartCount.textContent = totalItems;
        }

    }


    // UPDATE PRODUCT IMAGE

    function updateProductImage() {

        const color = PRODUCT.colors[selectedColor];

        const imagePath = color.image ||
            "assets/logo/triform-desk-logo.png";

        productImage.src = imagePath;

        productImage.alt =
            PRODUCT.name + " - " + color.name;

        productImage.onerror = function () {

            this.onerror = null;

            this.src = "assets/logo/triform-desk-logo.png";

        };

        imageVariantLabel.textContent =
            color.name + " · " +
            PRODUCT.sizes[selectedSize].name;

    }


    // UPDATE PRODUCT DISPLAY

    function updateProduct() {

        const price = getPrice();
        const quantity = getQuantity();
        const subtotal = price * quantity;

        priceElement.textContent = money(price);

        subtotalElement.textContent = money(subtotal);

        selectedSizeLabel.textContent =
            PRODUCT.sizes[selectedSize].name;

        selectedColorLabel.textContent =
            PRODUCT.colors[selectedColor].name;

        updateProductImage();

    }


    // SIZE SELECTION

    document.querySelectorAll(".size-button").forEach(button => {

        button.addEventListener("click", function () {

            selectedSize = this.dataset.size;

            document.querySelectorAll(".size-button")
                .forEach(item => {
                    item.classList.remove("selected");
                });

            this.classList.add("selected");

            updateProduct();

            cartMessage.textContent = "";

        });

    });


    // COLOR SELECTION

    document.querySelectorAll(".color-button").forEach(button => {

        button.addEventListener("click", function () {

            selectedColor = this.dataset.color;

            document.querySelectorAll(".color-button")
                .forEach(item => {
                    item.classList.remove("selected");
                });

            this.classList.add("selected");

            updateProduct();

            cartMessage.textContent = "";

        });

    });


    // DECREASE QUANTITY

    document.getElementById("decreaseQuantity")
        .addEventListener("click", function () {

            const quantity = getQuantity();

            quantityInput.value = Math.max(1, quantity - 1);

            updateProduct();

        });


    // INCREASE QUANTITY

    document.getElementById("increaseQuantity")
        .addEventListener("click", function () {

            const quantity = getQuantity();

            quantityInput.value = Math.min(
                MAX_QUANTITY,
                quantity + 1
            );

            updateProduct();

        });


    // MANUAL QUANTITY INPUT

    quantityInput.addEventListener("change", updateProduct);

    quantityInput.addEventListener("input", function () {

        cartMessage.textContent = "";

        if (quantityInput.value === "") {
            return;
        }

        updateProduct();

    });


    // ADD TO CART

    addToCartButton.addEventListener("click", function () {

        const quantity = getQuantity();

        const price = getPrice();

        const color = PRODUCT.colors[selectedColor];

        const size = PRODUCT.sizes[selectedSize];

        const sku = getVariantSKU();

        const cart = getCart();

        const existingItem = cart.find(
            item => item.variantSKU === sku
        );


        if (existingItem) {

            const newQuantity =
                Number(existingItem.quantity) + quantity;

            if (newQuantity > MAX_QUANTITY) {

                cartMessage.textContent =
                    "Maximum quantity per variant is 99.";

                cartMessage.style.color = "#B42318";

                return;

            }

            existingItem.quantity = newQuantity;

            existingItem.price = price;

            existingItem.subtotal = price * newQuantity;

        } else {

            cart.push({

                productId: PRODUCT.id,

                productName: PRODUCT.name,

                variantSKU: sku,

                sizeId: selectedSize,

                size: size.name,

                colorId: selectedColor,

                color: color.name,

                price: price,

                quantity: quantity,

                subtotal: price * quantity,

                image: color.image ||
                    "assets/logo/triform-desk-logo.png"

            });

        }


        if (!saveCart(cart)) {

            cartMessage.textContent =
                "Unable to save cart. Please check browser storage.";

            cartMessage.style.color = "#B42318";

            return;

        }


        updateCartCount();

        cartMessage.textContent =
            "✓ Added " + quantity +
            " × " + size.name +
            " / " + color.name +
            " to your cart.";

        cartMessage.style.color = "#267346";

        console.log("Cart updated:", getCart());

    });


    // AUTOMATIC COPYRIGHT YEAR

    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }


    // INITIALIZE PRODUCT PAGE

    updateProduct();

    updateCartCount();

    console.log("--------------------------------");
    console.log("SMARTSPACE CREATION");
    console.log("TRIFORM DESK PRODUCT CATALOG");
    console.log("Product variants:", 24);
    console.log("Available sizes:", 3);
    console.log("Available colors:", 8);
    console.log("Product catalog loaded successfully.");
    console.log("--------------------------------");

});
