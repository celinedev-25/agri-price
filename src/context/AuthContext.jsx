import { createContext, useContext, useEffect, useState } from "react";
import supabase, { isSupabaseConfigured } from "../supabase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data?.session || null);
        setUser(data?.session?.user || null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null);
      setUser(nextSession?.user || null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async ({ email, password }) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
    return data;
  };

  const signUp = async ({
    email,
    password,
    fullName,
    phone = "",
    district = "",
    role = "farmer",
  }) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          district: district.trim(),
          role,
          watchlist: ["Maize", "Irish Potatoes", "Beans"],
        },
      },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase.auth.updateUser({
      data: {
        ...(user?.user_metadata || {}),
        ...updates,
      },
    });
    if (error) throw error;
    setUser(data.user);
    return data.user;
  };

  const updatePassword = async (newPassword) => {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data.user;
  };

  const toggleWatchlistCrop = async (cropName) => {
    if (!user) return;
    const current = Array.isArray(user.user_metadata?.watchlist)
      ? user.user_metadata.watchlist
      : [];
    const exists = current.some(
      (c) => c.toLowerCase() === cropName.toLowerCase()
    );
    const next = exists
      ? current.filter((c) => c.toLowerCase() !== cropName.toLowerCase())
      : [...current, cropName];
    return updateProfile({ watchlist: next });
  };

  const role = user?.user_metadata?.role || "farmer";
  const isAdmin = role === "admin";
  const profile = {
    fullName:
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "AgriPrice User",
    email: user?.email || "",
    phone: user?.user_metadata?.phone || "",
    district: user?.user_metadata?.district || "",
    organization: user?.user_metadata?.organization || "",
    role,
    watchlist: Array.isArray(user?.user_metadata?.watchlist)
      ? user.user_metadata.watchlist
      : [],
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        role,
        isAdmin,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        updatePassword,
        toggleWatchlistCrop,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return ctx;
}
