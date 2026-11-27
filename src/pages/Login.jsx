import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sprout,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setSubmitting(true);
      const data = await signIn({ email, password });
      const userRole = data?.user?.user_metadata?.role || "farmer";
      const fallback = userRole === "admin" ? "/admin" : "/dashboard";
      const target = location.state?.from || fallback;
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f8faf7] flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="max-w-5xl w-full bg-white rounded-3xl border border-emerald-900/10 shadow-xl overflow-hidden grid lg:grid-cols-12">
        {/* Left Visual Panel */}
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
              Welcome Back to Smarter Farming
            </h1>
            <p className="text-emerald-100/85 text-sm mt-3 leading-relaxed">
              Sign in to access your personalized crop watchlist, district
              alerts, harvest calculator, or the Admin Price Console.
            </p>
          </div>

          <div className="relative mt-10 space-y-3 text-sm text-emerald-100">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Real-time Rwanda crop market prices</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Personalized farmer &amp; buyer dashboard</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Direct Supabase-secured authentication</span>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Account Sign In
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Sign in to your account
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Don&apos;t have an account yet?{" "}
              <Link
                to="/register"
                className="font-bold text-emerald-800 hover:underline"
              >
                Create one free
              </Link>
            </p>

            {error && (
              <div className="mt-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
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
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                    required
                  />
                </div>
              </div>

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
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-bold text-sm shadow-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {submitting ? "Signing in..." : "Sign In"}
                {!submitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
