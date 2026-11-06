
/* ==========================================
   SMARTSPACE CREATION
   SUPABASE DATABASE CONNECTION
========================================== */

// REPLACE THESE TWO VALUES WITH YOUR OWN.

const SUPABASE_URL = "https://ucfydarzzilntubbiiqh.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable__6THo-NaXUKZGoQQlrgeQg_RMbkecIy";

// Create Supabase client.
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
);

// Test database connection.
async function testSupabaseConnection() {

    try {

        const { data, error } = await supabaseClient
            .from("products")
            .select("id, name, description")
            .eq("active", true);

        if (error) {
            throw error;
        }

        console.log("SMARTSPACE SUPABASE CONNECTED");
        console.log("Available products:", data);

        return data;

    } catch (error) {

        console.error("SUPABASE CONNECTION ERROR:", error);

        return null;

    }

}

// Make client available to other classic JavaScript files.
window.supabaseClient = supabaseClient;
window.testSupabaseConnection = testSupabaseConnection;
