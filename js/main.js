
/* =========================================
   SMARTSPACE CREATION
   TRIFORM DESK - MAIN JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    // MOBILE NAVIGATION

    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");

    if (menuToggle && navLinks) {

        menuToggle.addEventListener("click", function () {

            const isOpen = navLinks.classList.toggle("active");

            menuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            menuToggle.textContent = isOpen ? "✕" : "☰";

        });

        // Close navigation after clicking a link

        navLinks.querySelectorAll("a").forEach(function (link) {

            link.addEventListener("click", function () {

                navLinks.classList.remove("active");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

                menuToggle.textContent = "☰";

            });

        });

    }


    // AUTOMATIC COPYRIGHT YEAR

    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }


    // WEBSITE INITIALIZATION

    console.log("--------------------------------");
    console.log("SMARTSPACE CREATION");
    console.log("TRIFORM DESK WEBSITE");
    console.log("Website loaded successfully.");
    console.log("--------------------------------");

});
