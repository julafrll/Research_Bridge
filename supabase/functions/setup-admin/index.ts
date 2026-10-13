import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SetupRequest {
  email: string;
  password: string;
  fullName: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if any admin already exists
    const { data: existingUsers, error: listError } = await adminClient.auth.admin.listUsers();

    if (listError) {
      return new Response(
        JSON.stringify({ error: "Failed to check existing users." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const hasAdmin = existingUsers.users.some(
      (u) => u.app_metadata?.role === "admin"
    );

    if (hasAdmin) {
      return new Response(
        JSON.stringify({
          error:
            "An admin account already exists. Admin bootstrap is disabled for security. If you need to reset, remove the admin role from existing users first.",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed. Use POST." }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, password, fullName } = (await req.json()) as SetupRequest;

    if (!email || !password || !fullName) {
      return new Response(
        JSON.stringify({ error: "Email, password, and full name are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 8 characters long." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user with this email already exists
    const existingUser = existingUsers.users.find(
      (u) => u.email === email
    );

    let userId: string;

    if (existingUser) {
      // Update existing user to admin
      const { data: updated, error: updateError } = await adminClient.auth.admin.updateUserById(
        existingUser.id,
        {
          password,
          email_confirm: true,
          app_metadata: { role: "admin" },
          user_metadata: { full_name: fullName },
        }
      );

      if (updateError) {
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userId = updated.user.id;
    } else {
      // Create new admin user
      const { data: created, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        app_metadata: { role: "admin" },
        user_metadata: { full_name: fullName },
      });

      if (createError) {
        return new Response(
          JSON.stringify({ error: createError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userId = created.user.id;
    }

    // Ensure profile exists and has the correct name
    await adminClient.from("profiles").upsert({
      id: userId,
      full_name: fullName,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message:
          "Admin account created successfully. You can now sign in with your email and password.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "An unexpected error occurred." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
