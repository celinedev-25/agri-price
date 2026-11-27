import { createClient } from "@supabase/supabase-js";
import supabase, { isSupabaseConfigured } from "../supabase.js";

const ADMINS_STORAGE_KEY = "agriprice_admin_team_v1";

function readLocalAdmins() {
  try {
    const raw = localStorage.getItem(ADMINS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalAdmins(list) {
  try {
    localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Checks whether an email has been granted admin access via the Admin Team manager.
 */
export function isEmailInAdminTeam(email = "") {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return readLocalAdmins().some(
    (a) => (a.email || "").trim().toLowerCase() === normalized
  );
}

/**
 * Fetches the admin team roster (combines Supabase `admin_users` table if present
 * with local roster and always includes the currently signed-in admin).
 */
export async function fetchAdminTeam(currentUser = null) {
  let list = readLocalAdmins();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        list = data.map((row) => ({
          id: row.id,
          fullName: row.full_name || row.email,
          email: row.email,
          district: row.district || "Kigali",
          addedBy: row.added_by || "System",
          createdAt: row.created_at,
          status: row.status || "Active",
        }));
        writeLocalAdmins(list);
      }
    } catch {
      // Fall back to local list
    }
  }

  // Ensure current signed-in admin appears in the roster
  if (currentUser?.email) {
    const exists = list.some(
      (a) => a.email?.toLowerCase() === currentUser.email.toLowerCase()
    );
    if (!exists) {
      const selfRecord = {
        id: currentUser.id || `admin_${Date.now()}`,
        fullName:
          currentUser.user_metadata?.full_name ||
          currentUser.email.split("@")[0],
        email: currentUser.email,
        district: currentUser.user_metadata?.district || "Kigali",
        addedBy: "Primary Admin",
        createdAt: currentUser.created_at || new Date().toISOString(),
        status: "Active",
      };
      list = [selfRecord, ...list];
      writeLocalAdmins(list);
    }
  }

  return list;
}

/**
 * Creates a brand-new Admin account in Supabase Auth using an isolated
 * non-persisting client so the currently signed-in Admin stays logged in!
 */
export async function addNewAdmin({
  fullName,
  email,
  password,
  district = "Kigali",
  addedBy = "Admin",
}) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = fullName.trim();

  let authCreated = false;
  let authNote = "";

  if (isSupabaseConfigured && password) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

    // Isolated client with persistSession: false so current admin session is untouched
    const isolatedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const { data, error } = await isolatedClient.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
          district: district.trim(),
          role: "admin",
          added_by: addedBy,
          watchlist: ["Maize", "Irish Potatoes", "Beans"],
        },
      },
    });

    if (error) {
      // If user already exists, we still grant them admin access in the team roster
      if (!error.message?.toLowerCase().includes("already registered")) {
        throw error;
      }
      authNote =
        "Existing user granted Admin privileges. They can sign in with their password.";
    } else {
      authCreated = true;
      authNote = data?.session
        ? "New Admin account created and ready to sign in immediately."
        : "New Admin account created! They should confirm their email before signing in.";
    }
  }

  const newRecord = {
    id: `admin_${Date.now()}`,
    fullName: cleanName,
    email: cleanEmail,
    district: district.trim() || "Kigali",
    addedBy,
    createdAt: new Date().toISOString(),
    status: authCreated ? "Active" : "Authorized",
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("admin_users")
        .insert([
          {
            full_name: newRecord.fullName,
            email: newRecord.email,
            district: newRecord.district,
            added_by: newRecord.addedBy,
            status: newRecord.status,
          },
        ])
        .select()
        .single();

      if (!error && data?.id) {
        newRecord.id = data.id;
      }
    } catch {
      // Optional table; local roster already tracks it
    }
  }

  const current = readLocalAdmins();
  const deduped = current.filter(
    (a) => (a.email || "").toLowerCase() !== cleanEmail
  );
  writeLocalAdmins([newRecord, ...deduped]);

  return { admin: newRecord, note: authNote };
}

export async function removeAdminMember(email) {
  const cleanEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("admin_users").delete().eq("email", cleanEmail);
    } catch {
      // Ignore if table doesn't exist
    }
  }

  const current = readLocalAdmins();
  const next = current.filter(
    (a) => (a.email || "").toLowerCase() !== cleanEmail
  );
  writeLocalAdmins(next);
  return true;
}
