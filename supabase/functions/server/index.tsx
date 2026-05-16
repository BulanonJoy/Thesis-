import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";

const app = new Hono();

// ── Supabase admin client (service role — bypasses RLS) ──────────────────────
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// ── Storage bucket setup ──────────────────────────────────────────────────────
const THESIS_BUCKET = "make-08a29098-theses";
(async () => {
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === THESIS_BUCKET);
    if (!exists) {
      await supabaseAdmin.storage.createBucket(THESIS_BUCKET, { public: false });
      console.log("Created storage bucket:", THESIS_BUCKET);
    }
  } catch (e) {
    console.log("Bucket init error:", e);
  }
})();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use("*", logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization", "X-User-Token"],
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Decode a JWT payload without verifying the signature.
 *  We trust Supabase already validated the token when it was issued.
 *  We still check the expiry claim. */
function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // Base64url → Base64 (add padding, swap chars)
    const b64url = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const b64 = b64url + "=".repeat((4 - b64url.length % 4) % 4);
    const json = atob(b64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

async function getCallerUser(authHeader: string | null): Promise<{ user: { id: string; email: string } | null; error: string | null }> {
  // Accept token from either X-User-Token (preferred) or Authorization header
  if (!authHeader) return { user: null, error: "No Authorization header provided." };
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return { user: null, error: "Empty token in Authorization header." };

  const payload = decodeJwt(token);
  if (!payload) return { user: null, error: "Could not decode JWT — token is malformed." };

  const userId = payload.sub as string | undefined;
  if (!userId) return { user: null, error: "JWT has no 'sub' (user id) claim." };

  // Check expiry
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === "number" && payload.exp < now) {
    return { user: null, error: "Token has expired." };
  }

  return { user: { id: userId, email: (payload.email as string) ?? "" }, error: null };
}

/** Read caller identity from the X-User-Token header (user's Supabase access token).
 *  The Authorization header carries the anon key for the platform; we use this
 *  custom header so the edge-function gateway doesn't reject the user JWT. */
async function getCallerUserFromRequest(c: { req: { header: (h: string) => string | undefined } }): Promise<{ user: { id: string; email: string } | null; error: string | null }> {
  const userToken = c.req.header("X-User-Token");
  if (!userToken) return { user: null, error: "No X-User-Token header provided." };
  return getCallerUser(`Bearer ${userToken}`);
}

async function getCallerProfile(userId: string) {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/make-server-08a29098/health", (c) => c.json({ status: "ok" }));

// ── SETUP: Check status ───────────────────────────────────────────────────────
app.get("/make-server-08a29098/setup/status", async (c) => {
  try {
    // Check if profiles table exists
    const { error: profilesError } = await supabaseAdmin
      .from("profiles").select("id").limit(1);
    const tablesReady = !profilesError;

    // Check if admin auth user exists
    let adminAuthExists = false;
    let adminProfileExists = false;

    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    adminAuthExists = users?.some((u) => u.email === "admin@thesis.com") ?? false;

    if (tablesReady) {
      const { data } = await supabaseAdmin
        .from("profiles").select("id").eq("role", "admin").limit(1);
      adminProfileExists = (data?.length ?? 0) > 0;
    }

    return c.json({
      tablesReady,
      adminAuthExists,
      adminProfileExists,
      adminExists: adminAuthExists && adminProfileExists,
      profilesError: profilesError?.message ?? null,
    });
  } catch (err) {
    console.log("setup/status error:", err);
    return c.json({ tablesReady: false, adminAuthExists: false, adminProfileExists: false, adminExists: false, profilesError: String(err) });
  }
});

// ── ONE-TIME SETUP: create admin@thesis.com ───────────────────────────────────
app.post("/make-server-08a29098/setup/init-admin", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const email    = body.email    ?? "admin@thesis.com";
    const password = body.password ?? "AdminPass123!";
    const name     = body.name     ?? "System Administrator";

    // Find or create auth user
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const existing = users.find((u) => u.email === email);

    let userId: string;
    if (existing) {
      userId = existing.id;
    } else {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { name, role: "admin" },
      });
      if (error) return c.json({ error: `Auth creation failed: ${error.message}` }, 400);
      userId = data.user.id;
    }

    // Delete any existing (possibly corrupt) profile row first, then insert fresh
    await supabaseAdmin.from("profiles").delete().eq("id", userId);

    const { error: pe } = await supabaseAdmin.from("profiles").insert({
      id: userId, name, email,
      role: "admin", department: "Administration",
      is_approved: true, is_active: true,
    });

    if (pe) return c.json({ error: `Profile insert failed: ${pe.message}` }, 400);

    // Verify it's actually there now
    const { data: verify, error: ve } = await supabaseAdmin
      .from("profiles").select("id, role, is_approved").eq("id", userId).single();
    if (ve || !verify) return c.json({ error: `Profile verification failed: ${ve?.message ?? "not found after insert"}` }, 500);

    return c.json({ success: true, message: existing ? "Admin profile repaired." : `Admin account created: ${email}`, profile: verify });
  } catch (err) {
    console.log("init-admin error:", err);
    return c.json({ error: String(err) }, 500);
  }
});

// ── SETUP: Debug — show raw admin data ────────────────────────────────────────
app.get("/make-server-08a29098/setup/debug", async (c) => {
  try {
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const adminUser = users.find((u) => u.email === "admin@thesis.com") ?? null;

    let profileRow = null;
    let profileError = null;
    if (adminUser) {
      const { data, error } = await supabaseAdmin
        .from("profiles").select("*").eq("id", adminUser.id).single();
      profileRow = data;
      profileError = error?.message ?? null;
    }

    const { data: allProfiles, error: allErr } = await supabaseAdmin
      .from("profiles").select("id, email, role, is_approved, is_active");

    return c.json({
      adminAuthUser: adminUser ? { id: adminUser.id, email: adminUser.email } : null,
      adminProfileRow: profileRow,
      profileError,
      allProfiles: allProfiles ?? [],
      allProfilesError: allErr?.message ?? null,
    });
  } catch (err) {
    return c.json({ error: String(err) }, 500);
  }
});

// ── AUTH: Register new user ───────────────────────────────────────────────────
// POST /auth/signup  { email, password, name, role, department }
app.post("/make-server-08a29098/auth/signup", async (c) => {
  try {
    const { email, password, name, role, department } = await c.req.json();
    if (!email || !password || !name || !role) {
      return c.json({ error: "Missing required fields." }, 400);
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { name, role, department },
    });
    if (error) return c.json({ error: error.message }, 400);

    const { error: pe } = await supabaseAdmin.from("profiles").insert({
      id: data.user.id, name, email,
      role, department: department ?? "",
      is_approved: false, is_active: true,
    });
    if (pe) {
      await supabaseAdmin.auth.admin.deleteUser(data.user.id);
      return c.json({ error: pe.message }, 400);
    }

    return c.json({ success: true });
  } catch (err) {
    console.log("signup error:", err);
    return c.json({ error: String(err) }, 500);
  }
});

// ── AUTH: Check if email exists ───────────────────────────────────────────────
// POST /auth/check-email  { email }
app.post("/make-server-08a29098/auth/check-email", async (c) => {
  try {
    const { email } = await c.req.json();
    if (!email) return c.json({ error: "email is required." }, 400);

    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) return c.json({ error: error.message }, 400);

    const exists = users.some((u) => u.email?.toLowerCase() === email.toLowerCase());
    return c.json({ exists });
  } catch (err) {
    console.log("check-email error:", err);
    return c.json({ error: String(err) }, 500);
  }
});

// ── AUTH: Direct password reset (no OTP) ─────────────────────────────────────
// POST /auth/reset-password  { email, new_password }
app.post("/make-server-08a29098/auth/reset-password", async (c) => {
  try {
    const { email, new_password } = await c.req.json();
    if (!email || !new_password) return c.json({ error: "email and new_password required." }, 400);
    if (new_password.length < 8) return c.json({ error: "Password must be at least 8 characters." }, 400);

    const { data: { users }, error: le } = await supabaseAdmin.auth.admin.listUsers();
    if (le) return c.json({ error: le.message }, 400);

    const target = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!target) return c.json({ error: "No account found with that email." }, 404);

    const { error } = await supabaseAdmin.auth.admin.updateUserById(target.id, { password: new_password });
    if (error) return c.json({ error: error.message }, 400);

    return c.json({ success: true });
  } catch (err) {
    console.log("reset-password error:", err);
    return c.json({ error: String(err) }, 500);
  }
});

// ── PROFILES: Get my own profile (any authenticated user) ─────────────────────
// GET /profiles/me
app.get("/make-server-08a29098/profiles/me", async (c) => {
  try {
    const { user, error: authErr } = await getCallerUserFromRequest(c);
    if (!user) return c.json({ error: `Unauthorized: ${authErr}` }, 401);

    const { data, error: dbErr } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", (user as { id: string }).id)
      .single();

    if (dbErr || !data) {
      console.log("profiles/me — DB error for user id", (user as { id: string }).id, dbErr?.message);
      return c.json({ error: `Profile not found for id ${(user as { id: string }).id}: ${dbErr?.message ?? "no row"}` }, 404);
    }
    return c.json({ profile: data });
  } catch (err) {
    console.log("profiles/me GET error:", err);
    return c.json({ error: String(err) }, 500);
  }
});

// ── PROFILES: List all (admin only) ──────────────────────────────────────────
app.get("/make-server-08a29098/profiles", async (c) => {
  try {
    const caller = await getCallerUserFromRequest(c);
    if (!caller.user) return c.json({ error: "Unauthorized." }, 401);

    const profile = await getCallerProfile(caller.user.id);
    if (!profile || profile.role !== "admin") return c.json({ error: "Admin access required." }, 403);

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return c.json({ error: error.message }, 400);

    return c.json({ profiles: data ?? [] });
  } catch (err) {
    console.log("profiles GET error:", err);
    return c.json({ error: String(err) }, 500);
  }
});

// ── PROFILES: Approve / deactivate (admin only) ───────────────────────────────
// PATCH /profiles/:id  { is_approved?, is_active? }
app.patch("/make-server-08a29098/profiles/:id", async (c) => {
  try {
    const caller = await getCallerUserFromRequest(c);
    if (!caller.user) return c.json({ error: "Unauthorized." }, 401);

    const callerProfile = await getCallerProfile(caller.user.id);
    if (!callerProfile || callerProfile.role !== "admin") return c.json({ error: "Admin access required." }, 403);

    const targetId = c.req.param("id");
    const body = await c.req.json();
    const allowed: Record<string, boolean> = {};
    if (typeof body.is_approved === "boolean") allowed.is_approved = body.is_approved;
    if (typeof body.is_active   === "boolean") allowed.is_active   = body.is_active;

    if (Object.keys(allowed).length === 0) return c.json({ error: "No valid fields." }, 400);

    const { error } = await supabaseAdmin.from("profiles").update(allowed).eq("id", targetId);
    if (error) return c.json({ error: error.message }, 400);

    return c.json({ success: true });
  } catch (err) {
    console.log("profiles PATCH error:", err);
    return c.json({ error: String(err) }, 500);
  }
});

// ── THESES: Public browse (approved only, limited fields) ─────────────────────
// GET /theses/public?search=&program=&year=
app.get("/make-server-08a29098/theses/public", async (c) => {
  try {
    const search  = c.req.query("search")  ?? "";
    const program = c.req.query("program") ?? "";
    const year    = c.req.query("year")    ?? "";

    let query = supabaseAdmin
      .from("theses")
      .select("id, title, authors, adviser, program, research_field, year, abstract, keywords, uploaded_at")
      .eq("status", "approved")
      .order("uploaded_at", { ascending: false });

    if (program && program !== "all") query = query.eq("program", program);
    if (year    && year    !== "all") query = query.eq("year", parseInt(year));
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,authors.ilike.%${search}%,keywords.ilike.%${search}%,abstract.ilike.%${search}%`
      );
    }

    const { data, error } = await query;
    if (error) return c.json({ error: error.message }, 400);

    return c.json({ theses: data ?? [] });
  } catch (err) {
    console.log("theses/public error:", err);
    return c.json({ error: String(err) }, 500);
  }
});

// ── THESES: Authenticated browse (approved, full fields) ──────────────────────
// GET /theses?search=&program=&year=&status=
app.get("/make-server-08a29098/theses", async (c) => {
  try {
    const caller = await getCallerUserFromRequest(c);
    if (!caller.user) return c.json({ error: "Unauthorized." }, 401);

    const search  = c.req.query("search")  ?? "";
    const program = c.req.query("program") ?? "";
    const year    = c.req.query("year")    ?? "";
    const status  = c.req.query("status")  ?? "approved";

    let query = supabaseAdmin
      .from("theses")
      .select("*")
      .eq("status", status)
      .order("uploaded_at", { ascending: false });

    if (program && program !== "all") query = query.eq("program", program);
    if (year    && year    !== "all") query = query.eq("year", parseInt(year));
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,authors.ilike.%${search}%,keywords.ilike.%${search}%`
      );
    }

    const { data, error } = await query;
    if (error) return c.json({ error: error.message }, 400);

    return c.json({ theses: data ?? [] });
  } catch (err) {
    console.log("theses GET error:", err);
    return c.json({ error: String(err) }, 500);
  }
});

// ── THESES: Review queue (approver only — all non-approved) ───────────────────
// GET /theses/review
app.get("/make-server-08a29098/theses/review", async (c) => {
  try {
    const caller = await getCallerUserFromRequest(c);
    if (!caller.user) return c.json({ error: "Unauthorized." }, 401);

    const profile = await getCallerProfile(caller.user.id);
    if (!profile || profile.role !== "approver") return c.json({ error: "Approver access required." }, 403);

    const { data, error } = await supabaseAdmin
      .from("theses")
      .select("*")
      .order("uploaded_at", { ascending: false });
    if (error) return c.json({ error: error.message }, 400);

    return c.json({ theses: data ?? [] });
  } catch (err) {
    console.log("theses/review GET error:", err);
    return c.json({ error: String(err) }, 500);
  }
});

// ── THESES: Uploader's own theses ─────────────────────────────────────────────
// GET /theses/mine
app.get("/make-server-08a29098/theses/mine", async (c) => {
  try {
    const caller = await getCallerUserFromRequest(c);
    if (!caller.user) return c.json({ error: "Unauthorized." }, 401);

    const { data, error } = await supabaseAdmin
      .from("theses")
      .select("*")
      .eq("author_id", caller.user.id)
      .order("uploaded_at", { ascending: false });
    if (error) return c.json({ error: error.message }, 400);

    return c.json({ theses: data ?? [] });
  } catch (err) {
    console.log("theses/mine GET error:", err);
    return c.json({ error: String(err) }, 500);
  }
});

// ── THESES: Submit new thesis (uploader only) ─────────────────────────────────
// POST /theses
app.post("/make-server-08a29098/theses", async (c) => {
  try {
    const caller = await getCallerUserFromRequest(c);
    if (!caller.user) return c.json({ error: "Unauthorized." }, 401);

    const profile = await getCallerProfile(caller.user.id);
    if (!profile || profile.role !== "uploader") return c.json({ error: "Uploader access required." }, 403);

    const { title, authors, adviser, program, research_field, year, abstract, keywords } = await c.req.json();
    if (!title || !authors || !program) return c.json({ error: "title, authors, and program are required." }, 400);

    const { data, error } = await supabaseAdmin
      .from("theses")
      .insert({
        title, authors, adviser: adviser ?? "",
        program, research_field: research_field ?? "",
        year: year ?? null, abstract: abstract ?? "",
        keywords: keywords ?? "", status: "pending",
        author_id: caller.user.id, uploaded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return c.json({ error: error.message }, 400);
    return c.json({ thesis: data }, 201);
  } catch (err) {
    console.log("theses POST error:", err);
    return c.json({ error: String(err) }, 500);
  }
});

// ── THESES: Get single thesis by ID (authenticated) ───────────────────────────
// GET /theses/:id
app.get("/make-server-08a29098/theses/:id", async (c) => {
  try {
    const caller = await getCallerUserFromRequest(c);
    if (!caller.user) return c.json({ error: "Unauthorized." }, 401);

    const thesisId = c.req.param("id");
    const { data, error } = await supabaseAdmin
      .from("theses")
      .select("*")
      .eq("id", thesisId)
      .single();

    if (error || !data) return c.json({ error: error?.message ?? "Thesis not found." }, 404);
    return c.json({ thesis: data });
  } catch (err) {
    console.log("theses/:id GET error:", err);
    return c.json({ error: String(err) }, 500);
  }
});

// ── THESES: Approve or reject (approver only) ─────────────────────────────────
// PATCH /theses/:id/review  { action: "approve"|"reject", feedback? }
app.patch("/make-server-08a29098/theses/:id/review", async (c) => {
  try {
    const caller = await getCallerUserFromRequest(c);
    if (!caller.user) return c.json({ error: "Unauthorized." }, 401);

    const profile = await getCallerProfile(caller.user.id);
    if (!profile || profile.role !== "approver") return c.json({ error: "Approver access required." }, 403);

    const thesisId = c.req.param("id");
    const { action, feedback } = await c.req.json();
    if (action !== "approve" && action !== "reject") return c.json({ error: "action must be 'approve' or 'reject'." }, 400);

    const { error } = await supabaseAdmin
      .from("theses")
      .update({
        status:      action === "approve" ? "approved" : "rejected",
        feedback:    feedback ?? "",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", thesisId);

    if (error) return c.json({ error: error.message }, 400);
    return c.json({ success: true });
  } catch (err) {
    console.log("theses review PATCH error:", err);
    return c.json({ error: String(err) }, 500);
  }
});

// ── THESES: Upload PDF ────────────────────────────────────────────────────────
// POST /theses/:id/pdf   multipart/form-data  field: "pdf"
app.post("/make-server-08a29098/theses/:id/pdf", async (c) => {
  try {
    const caller = await getCallerUserFromRequest(c);
    if (!caller.user) return c.json({ error: "Unauthorized." }, 401);

    const thesisId = c.req.param("id");

    // Caller must own the thesis or be admin
    const { data: thesis } = await supabaseAdmin
      .from("theses").select("author_id").eq("id", thesisId).single();
    if (!thesis) return c.json({ error: "Thesis not found." }, 404);

    const callerProfile = await getCallerProfile(caller.user.id);
    if (thesis.author_id !== caller.user.id && callerProfile?.role !== "admin") {
      return c.json({ error: "Forbidden." }, 403);
    }

    const formData = await c.req.formData();
    const file = formData.get("pdf") as File | null;
    if (!file) return c.json({ error: "No file provided. Include a 'pdf' field." }, 400);
    if (file.type !== "application/pdf") return c.json({ error: "File must be a PDF (application/pdf)." }, 400);

    const filePath = `${thesisId}/thesis.pdf`;
    const bytes = await file.arrayBuffer();

    const { error: uploadErr } = await supabaseAdmin.storage
      .from(THESIS_BUCKET)
      .upload(filePath, bytes, { contentType: "application/pdf", upsert: true });

    if (uploadErr) return c.json({ error: `Storage upload failed: ${uploadErr.message}` }, 400);

    return c.json({ success: true, pdf_path: filePath });
  } catch (err) {
    console.log("theses/:id/pdf POST error:", err);
    return c.json({ error: String(err) }, 500);
  }
});

// ── THESES: Get signed PDF URL ────────────────────────────────────────────────
// GET /theses/:id/pdf
app.get("/make-server-08a29098/theses/:id/pdf", async (c) => {
  try {
    const caller = await getCallerUserFromRequest(c);
    if (!caller.user) return c.json({ error: "Unauthorized." }, 401);

    const thesisId = c.req.param("id");
    const filePath = `${thesisId}/thesis.pdf`;

    const { data, error } = await supabaseAdmin.storage
      .from(THESIS_BUCKET)
      .createSignedUrl(filePath, 3600); // valid for 1 hour

    if (error) return c.json({ error: `Could not create signed URL: ${error.message}` }, 404);

    return c.json({ url: data.signedUrl });
  } catch (err) {
    console.log("theses/:id/pdf GET error:", err);
    return c.json({ error: String(err) }, 500);
  }
});

Deno.serve(app.fetch);