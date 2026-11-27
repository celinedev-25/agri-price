import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  ShieldCheck,
  Tractor,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  LogOut,
  LayoutDashboard,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { slugifyCrop } from "../data/featuredCrops.js";

function Profile() {
  const {
    profile,
    isAdmin,
    updateProfile,
    updatePassword,
    toggleWatchlistCrop,
    signOut,
  } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone);
  const [district, setDistrict] = useState(profile.district);
  const [organization, setOrganization] = useState(profile.organization);
  const [role, setRole] = useState(profile.role);

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileStatus, setProfileStatus] = useState({ type: "", text: "" });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState({ type: "", text: "" });

  const initials = (profile.fullName || "A")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileStatus({ type: "", text: "" });

    try {
      setSavingProfile(true);
      await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
        district: district.trim(),
        organization: organization.trim(),
        role,
      });
      setProfileStatus({
        type: "success",
        text: "Profile updated and synced with Supabase.",
      });
    } catch (err) {
      setProfileStatus({
        type: "error",
        text: err.message || "Could not update profile.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus({ type: "", text: "" });

    if (newPassword.length < 6) {
      setPasswordStatus({
        type: "error",
        text: "New password must be at least 6 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({
        type: "error",
        text: "Passwords do not match.",
      });
      return;
    }

    try {
      setSavingPassword(true);
      await updatePassword(newPassword);
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStatus({
        type: "success",
        text: "Password updated successfully.",
      });
    } catch (err) {
      setPasswordStatus({
        type: "error",
        text: err.message || "Could not update password.",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f8faf7] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header Card */}
        <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 text-emerald-950 font-extrabold text-2xl flex items-center justify-center shadow-md shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold">{profile.fullName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  {isAdmin ? "Market Admin" : "Farmer / Buyer"}
                </span>
              </div>
              <p className="text-sm text-emerald-200 mt-1">{profile.email}</p>
              {profile.district && (
                <p className="text-xs text-emerald-300/90 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {profile.district}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={isAdmin ? "/admin" : "/dashboard"}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-emerald-950 text-sm font-bold hover:bg-amber-300 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              {isAdmin ? "Admin Console" : "My Dashboard"}
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </section>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Personal Information Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900">
              Personal Information
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your profile details, preferred district, and workspace role
            </p>

            {profileStatus.text && (
              <div
                className={`mt-5 p-3.5 rounded-2xl border text-sm flex items-center gap-2.5 ${
                  profileStatus.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                {profileStatus.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{profileStatus.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="mt-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+250 788 000 000"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Preferred District
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Musanze, Kigali"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Farm / Cooperative Name (optional)
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Koperative Abahinzi ba Musanze"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Role Switcher */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Workspace Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("farmer")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      role === "farmer"
                        ? "border-emerald-700 bg-emerald-50 ring-2 ring-emerald-600/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                      <Tractor className="w-4 h-4 text-emerald-700" />
                      Farmer / Buyer
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      role === "admin"
                        ? "border-emerald-700 bg-emerald-50 ring-2 ring-emerald-600/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      Market Admin
                    </div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-bold text-sm transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {savingProfile ? "Saving Changes..." : "Save Profile"}
              </button>
            </form>
          </div>

          {/* Right Column: Security & Watchlist */}
          <div className="lg:col-span-5 space-y-6">
            {/* Password Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-900/10 shadow-sm">
              <div className="flex items-center gap-2.5 mb-1">
                <Lock className="w-5 h-5 text-emerald-800" />
                <h2 className="text-lg font-extrabold text-slate-900">
                  Security &amp; Password
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Change your account password anytime
              </p>

              {passwordStatus.text && (
                <div
                  className={`mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    passwordStatus.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}
                >
                  {passwordStatus.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{passwordStatus.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold text-sm transition-colors cursor-pointer"
                >
                  {savingPassword ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>

            {/* Saved Watchlist Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-900/10 shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900">
                Saved Crop Watchlist
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Crops pinned to your personal dashboard
              </p>

              {profile.watchlist.length === 0 ? (
                <p className="text-xs text-slate-400 mt-4">
                  No crops saved yet. Add crops from your Dashboard.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 mt-4">
                  {profile.watchlist.map((crop) => (
                    <span
                      key={crop}
                      className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold"
                    >
                      <Link
                        to={`/product/${slugifyCrop(crop)}`}
                        className="hover:underline"
                      >
                        {crop}
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleWatchlistCrop(crop)}
                        className="p-0.5 rounded-full hover:bg-emerald-200/70 cursor-pointer"
                        aria-label={`Remove ${crop} from watchlist`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
