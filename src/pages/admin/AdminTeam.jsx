import { useEffect, useState } from "react";
import {
  UserPlus,
  ShieldCheck,
  Mail,
  User,
  Lock,
  MapPin,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  fetchAdminTeam,
  addNewAdmin,
  removeAdminMember,
} from "../../services/adminService.js";

function AdminTeam() {
  const { user, profile } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [district, setDistrict] = useState("Kigali");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  useEffect(() => {
    let active = true;
    fetchAdminTeam(user)
      .then((list) => {
        if (active) setAdmins(list);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setStatus({ type: "", text: "" });

    if (!fullName.trim() || !email.trim() || password.length < 6) {
      setStatus({
        type: "error",
        text: "Please enter a name, valid email, and password (min 6 characters).",
      });
      return;
    }

    try {
      setSaving(true);
      const { admin, note } = await addNewAdmin({
        fullName,
        email,
        password,
        district,
        addedBy: profile.fullName,
      });

      setAdmins((prev) => [
        admin,
        ...prev.filter((a) => a.email?.toLowerCase() !== admin.email),
      ]);
      setFullName("");
      setEmail("");
      setPassword("");
      setStatus({
        type: "success",
        text:
          note ||
          `${admin.fullName} has been added with full Administrator access.`,
      });
    } catch (err) {
      setStatus({
        type: "error",
        text: err.message || "Could not create new Admin account.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (member) => {
    if (member.email?.toLowerCase() === user?.email?.toLowerCase()) return;
    if (!window.confirm(`Remove ${member.fullName} from the Admin Team?`))
      return;

    await removeAdminMember(member.email);
    setAdmins((prev) =>
      prev.filter((a) => a.email?.toLowerCase() !== member.email?.toLowerCase())
    );
    setStatus({
      type: "success",
      text: `Removed ${member.fullName} from the Admin Team.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
          Access &amp; Collaborators
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Admin Team Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Add new administrators to help manage prices, products, and market
          analytics with full Admin Console access.
        </p>
      </div>

      {status.text && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm ${
            status.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {status.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{status.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatus({ type: "", text: "" })}
            className="p-1 rounded-lg hover:bg-black/5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* ADD NEW ADMIN FORM */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-sm">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Add New Admin
              </h2>
              <p className="text-xs text-slate-500">
                Creates an Admin account without signing you out
              </p>
            </div>
          </div>

          <form onSubmit={handleAddAdmin} className="space-y-4">
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
                  placeholder="e.g. Celine Uwase"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="co-admin@agriprice.rw"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Assigned District
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Kigali, Musanze"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Temporary Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                The new admin can change their password anytime from Profile.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-bold text-sm transition-colors cursor-pointer"
            >
              {saving ? "Creating Admin..." : "Grant Admin Access"}
            </button>
          </form>
        </div>

        {/* ADMIN ROSTER */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-emerald-900/10 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Authorized Administrators ({admins.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every admin listed here has full access to the Admin Console
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-sm text-slate-400">
                Loading admin team...
              </div>
            ) : (
              admins.map((member) => {
                const isSelf =
                  member.email?.toLowerCase() === user?.email?.toLowerCase();
                return (
                  <div
                    key={member.email}
                    className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 font-extrabold text-sm flex items-center justify-center shrink-0">
                        {(member.fullName || "A").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 truncate">
                            {member.fullName}
                          </p>
                          {isSelf && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {member.email} • {member.district || "Kigali"}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Added by {member.addedBy || "Admin"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Admin
                      </span>
                      {!isSelf && (
                        <button
                          type="button"
                          onClick={() => handleRemove(member)}
                          className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                          title="Revoke admin access"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminTeam;
