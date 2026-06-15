import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface UpdatePasswordRequest {
  userId: string;
  newPassword: string;
}

interface ResetPasswordRequest {
  userId: string;
  newPassword: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRole) {
      throw new Error("Missing Supabase configuration");
    }

    const jwtResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!jwtResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const currentUser = await jwtResponse.json();

    const { method } = req;

    if (method === "POST") {
      const body: UpdatePasswordRequest = await req.json();
      const { userId, newPassword } = body;

      const profileResponse = await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${currentUser.id}&select=role`,
        {
          headers: {
            Authorization: `Bearer ${supabaseServiceRole}`,
            "Content-Type": "application/json",
            "Prefer": "return=representation",
          },
        }
      );

      const profiles = await profileResponse.json();
      const isCEO = profiles.length > 0 && profiles[0].role === "CEO";
      const isSameUser = userId === currentUser.id;

      if (!isCEO && !isSameUser) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const updateResponse = await fetch(
        `${supabaseUrl}/auth/v1/admin/users/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${supabaseServiceRole}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: newPassword,
          }),
        }
      );

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        return new Response(
          JSON.stringify({ error: error.message || "Failed to update password" }),
          {
            status: updateResponse.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "Senha alterada com sucesso" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (method === "DELETE") {
      const { userId } = await req.json();

      const profileResponse = await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${currentUser.id}&select=role`,
        {
          headers: {
            Authorization: `Bearer ${supabaseServiceRole}`,
            "Content-Type": "application/json",
          },
        }
      );

      const profiles = await profileResponse.json();
      const isCEO = profiles.length > 0 && profiles[0].role === "CEO";

      if (!isCEO) {
        return new Response(
          JSON.stringify({ error: "Only CEO can delete users" }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const deleteResponse = await fetch(
        `${supabaseUrl}/auth/v1/admin/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${supabaseServiceRole}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!deleteResponse.ok) {
        const error = await deleteResponse.json();
        return new Response(
          JSON.stringify({ error: error.message || "Failed to delete user" }),
          {
            status: deleteResponse.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${supabaseServiceRole}`,
            "Content-Type": "application/json",
          },
        }
      );

      return new Response(
        JSON.stringify({ success: true, message: "Usuário deletado com sucesso" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
