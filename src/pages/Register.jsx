import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sprout,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  ShieldCheck,
  Tractor,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const RWANDA_DISTRICTS = [
  "Kigali (Gasabo)",
  "Kigali (Kicukiro)",
  "Kigali (Nyarugenge)",
  "Musanze",
  "Rubavu",
  "Huye",
  "Muhanga",
  "Nyagatare",
  "Rwamagana",
  "Bugesera",
  "Kayonza",
  "Kirehe",
  "Gatsibo",
  "Ngoma",
  "Gicumbi",
  "Burera",
  "Nyabihu",
  "Rusizi",
  "Karongi",
  "Nyanza",
  "Ruhango",
  "Kamonyi",
];

function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("Kigali (Nyarugenge)");
  const [role, setRole] = useState("farmer"); // "farmer" | "admin"
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      const data = await signUp({
        email,
        password,
        fullName,
        phone,
        district,
        role,
      });

      if (data?.session) {
        navigate(role === "admin" ? "/admin" : "/dashboard", { replace: true });
      } else {
        setNeedsConfirmation(true);
      }
    } catch (err) {
      setError(err.message || "Could not create account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f8faf7] flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="max-w-5xl w-full bg-white rounded-3xl border border-emerald-900/10 shadow-xl overflow-hidden grid lg:grid-cols-12">
        {/* Left Brand Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center">
                <Sprout className="w-5 h-5" />
              </span>
              <span className="text-xl font-extrabold tracking-tight">
                Agri<span className="text-amber-400">Price</span>
              </span>
            </Link>

            <h1 className="text-3xl font-extrabold mt-8 leading-tight">
              Join Rwanda&apos;s Agricultural Price Network
            </h1>
            <p className="text-emerald-100/85 text-sm mt-3 leading-relaxed">
              Create your free account to track your favorite crops, compare
              district markets, or manage official price listings as an admin.
            </p>
          </div>

          <div className="relative mt-10 p-5 rounded-2xl bg-white/10 border border-white/15 text-xs text-emerald-100 space-y-2">
            <p className="font-bold text-amber-300 uppercase tracking-wider">
              Two Dedicated Workspaces
            </p>
            <p>
              <strong>Farmer / Buyer:</strong> Personal crop watchlist, local
              district feed, and harvest value estimator.
            </p>
            <p>
              <strong>Market Admin:</strong> Full CRUD price console, district
              analytics, and market oversight.
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          <div className="max-w-lg w-full mx-auto">
            {needsConfirmation ? (
              <div className="py-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Check Your Email
                </h2>
                <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                  We&apos;ve sent a confirmation link to{" "}
                  <strong>{email}</strong>. Click the link in your inbox to
                  activate your account, then sign in.
                </p>
                <Link
                  to="/login"
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-900 text-white text-sm font-bold hover:bg-emerald-800"
                >
                  Go to Sign In
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                  Create Account
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  Get started with AgriPrice
                </h2>
                <p className="text-sm text-slate-500 mt-1.5">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-emerald-800 hover:underline"
                  >
                    Sign in
                  </Link>
                </p>

                {error && (
                  <div className="mt-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {/* Account Role Picker */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Account Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole("farmer")}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          role === "farmer"
                            ? "border-emerald-700 bg-emerald-50/80 ring-2 ring-emerald-600/20"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                          <Tractor className="w-4 h-4 text-emerald-700" />
                          Farmer / Buyer
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Watchlist &amp; price tracker
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole("admin")}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          role === "admin"
                            ? "border-emerald-700 bg-emerald-50/80 ring-2 ring-emerald-600/20"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          Market Admin
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Manage &amp; publish prices
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Full Name & Email */}
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
                          placeholder="Jean Bosco"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
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
                          placeholder="you@example.com"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone & District */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Phone (optional)
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
                        Your District
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                        >
                          {RWANDA_DISTRICTS.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Password & Confirm */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min. 6 characters"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-bold text-sm shadow-sm transition-colors cursor-pointer disabled:cursor-not-allowed mt-2"
                  >
                    {submitting ? "Creating account..." : "Create Account"}
                    {!submitting && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
