import { Navigate, useLocation, Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#f8faf7]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-800 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">
            Checking session...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#f8faf7] px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-emerald-900/10 shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Admin Access Required
          </h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Your account is currently set to the <strong>Farmer / Buyer</strong>{" "}
            role. Switch to an Admin account or update your role in Profile
            settings to access the Admin Console.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-900 text-white text-sm font-bold hover:bg-emerald-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              User Dashboard
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Go to Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
