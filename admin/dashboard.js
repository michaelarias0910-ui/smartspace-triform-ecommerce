
/* ==========================================
   SMARTSPACE CREATION
   ADMINISTRATOR DASHBOARD ENGINE
========================================== */

document.addEventListener("DOMContentLoaded", async () => {

    const client = window.supabaseClient;

    const message = document.getElementById("dashboardMessage");
    const logoutButton = document.getElementById("logoutButton");
    const refreshButton = document.getElementById("refreshOrders");

    const tableBody = document.getElementById("ordersTableBody");

    const totalOrders = document.getElementById("totalOrders");
    const pendingOrders = document.getElementById("pendingOrders");
    const processingOrders = document.getElementById("processingOrders");
    const completedOrders = document.getElementById("completedOrders");

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }

    function peso(value) {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP"
        }).format(Number(value) || 0);
    }

    if (!client) {
        message.textContent = "Supabase connection is unavailable.";
        return;
    }

    // Authenticate user.
    const { data: userData, error: userError } =
        await client.auth.getUser();

    if (userError || !userData.user) {
        window.location.replace("login.html");
        return;
    }

    // Verify administrator authorization.
    const { data: admin, error: adminError } = await client
        .from("admin_users")
        .select("user_id")
        .eq("user_id", userData.user.id)
        .maybeSingle();

    if (adminError || !admin) {
        await client.auth.signOut();
        window.location.replace("login.html");
        return;
    }

    document.getElementById("adminWelcome").textContent =
        "Signed in as " + userData.user.email;

    // Load orders.
    async function loadOrders() {

        tableBody.innerHTML = `
            <tr><td colspan="6">Loading orders...</td></tr>
        `;

        message.textContent = "";

        const { data: orders, error } = await client
            .from("orders")
            .select(`
                id,
                order_number,
                customer_id,
                payment_method,
                payment_status,
                order_status,
                subtotal,
                shipping_fee,
                total_amount,
                created_at
            `)
            .order("created_at", { ascending: false })
            .limit(100);

        if (error) {

            console.error(error);

            message.textContent =
                "Unable to load orders. Check database permissions.";

            tableBody.innerHTML = `
                <tr><td colspan="6">Order loading failed.</td></tr>
            `;

            return;
        }

        const allOrders = orders || [];

        totalOrders.textContent = allOrders.length;

        pendingOrders.textContent = allOrders.filter(order =>
            order.order_status === "Pending Review"
        ).length;

        processingOrders.textContent = allOrders.filter(order =>
            order.order_status === "Processing"
        ).length;

        completedOrders.textContent = allOrders.filter(order =>
            order.order_status === "Completed"
        ).length;

        if (allOrders.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        No customer orders have been recorded.
                    </td>
                </tr>
            `;

            return;
        }

        tableBody.innerHTML = allOrders.map(order => {

            const amount = order.total_amount === null
                ? "Awaiting shipping fee"
                : peso(order.total_amount);

            return `
                <tr>
                    <td>${escapeHTML(order.order_number)}</td>
                    <td>${escapeHTML(order.customer_id)}</td>
                    <td>${escapeHTML(order.payment_method)}</td>
                    <td>${escapeHTML(order.order_status)}</td>
                    <td>${amount}</td>
                    <td>
                        ${new Date(order.created_at).toLocaleDateString("en-PH")}
                    </td>
                </tr>
            `;

        }).join("");

    }

    refreshButton.addEventListener("click", loadOrders);

    logoutButton.addEventListener("click", async () => {

        logoutButton.disabled = true;

        const { error } = await client.auth.signOut();

        if (error) {
            message.textContent = "Unable to sign out. Please try again.";
            logoutButton.disabled = false;
            return;
        }

        window.location.replace("login.html");

    });

    await loadOrders();

    console.log("SMARTSPACE ADMIN DASHBOARD LOADED");

});
