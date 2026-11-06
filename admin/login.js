
/* ==========================================
   SMARTSPACE CREATION
   ADMINISTRATOR LOGIN
========================================== */

document.addEventListener("DOMContentLoaded", async () => {

    const form = document.getElementById("adminLoginForm");
    const emailInput = document.getElementById("adminEmail");
    const passwordInput = document.getElementById("adminPassword");
    const button = document.getElementById("adminLoginButton");
    const message = document.getElementById("adminLoginMessage");

    function showMessage(text, success = false) {
        message.textContent = text;
        message.style.color = success ? "#267346" : "#B42318";
    }

    // Wait until the shared client has initialized.
    if (!window.supabaseClient) {
        showMessage("Database connection is not ready. Refresh the page.");
        return;
    }

    const client = window.supabaseClient;

    // Verify an existing session.
    async function verifyAdmin() {

        const { data, error } = await client.auth.getUser();

        if (error || !data.user) {
            return false;
        }

        const { data: admin, error: adminError } = await client
            .from("admin_users")
            .select("user_id")
            .eq("user_id", data.user.id)
            .maybeSingle();

        if (adminError || !admin) {
            return false;
        }

        return true;
    }

    // Redirect an already authenticated administrator.
    const alreadyAdmin = await verifyAdmin();

    if (alreadyAdmin) {
        window.location.href = "dashboard.html";
        return;
    }

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        button.disabled = true;
        button.textContent = "AUTHENTICATING...";

        showMessage("");

        try {

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            const { data, error } = await client.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                throw error;
            }

            // Check administrator registration.
            const { data: admin, error: adminError } = await client
                .from("admin_users")
                .select("user_id")
                .eq("user_id", data.user.id)
                .maybeSingle();

            if (adminError || !admin) {

                await client.auth.signOut();

                throw new Error(
                    "This account is not authorized as a store administrator."
                );

            }

            showMessage("Login successful. Opening dashboard...", true);

            window.location.replace("dashboard.html");

        } catch (error) {

            console.error("Admin login error:", error);

            showMessage(error.message || "Unable to sign in.");

            button.disabled = false;
            button.textContent = "SIGN IN";

        }

    });

});
