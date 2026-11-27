import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Sprout,
  LayoutDashboard,
  TrendingUp,
  Package,
  UserPlus,
  User,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const sidebarLinks = [
  { to: "/admin", label: "Overview & Graphs", icon: LayoutDashboard, end: true },
  { to: "/admin/prices", label: "Market Prices", icon: TrendingUp },
  { to: "/admin/products", label: "Products Catalog", icon: Package },
  { to: "/admin/team", label: "Admin Team", icon: UserPlus },
];

function AdminLayout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = (profile.fullName || "A")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
      isActive
        ? "bg-amber-400 text-emerald-950 shadow-sm font-bold"
        : "text-emerald-100/85 hover:bg-emerald-900/80 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-[#f4f7f3] flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-68 bg-emerald-950 text-white flex flex-col justify-between border-r border-emerald-900 transform transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-emerald-900">
            <Link to="/admin" className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center shadow-sm">
                <Sprout className="w-5 h-5" />
              </span>
              <div className="leading-tight">
                <span className="text-base font-extrabold tracking-tight block">
                  Agri<span className="text-amber-400">Price</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-emerald-300 font-bold block">
                  Admin Console
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-emerald-200 hover:bg-emerald-900"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Identity Pill */}
          <div className="p-4">
            <div className="rounded-2xl bg-emerald-900/70 border border-emerald-800/80 p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 font-extrabold text-sm flex items-center justify-center shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {profile.fullName}
                </p>
                <p className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Administrator
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 space-y-1.5">
            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-emerald-400/80 mb-2">
              Management
            </p>
            {sidebarLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={navLinkClass}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            <div className="pt-4 mt-4 border-t border-emerald-900">
              <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-emerald-400/80 mb-2">
                Account
              </p>
              <NavLink
                to="/profile"
                onClick={() => setSidebarOpen(false)}
                className={navLinkClass}
              >
                <User className="w-4 h-4 shrink-0" />
                <span>My Profile</span>
              </NavLink>
              <Link
                to="/"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-emerald-100/85 hover:bg-emerald-900/80 hover:text-white transition-all"
              >
                <ExternalLink className="w-4 h-4 shrink-0" />
                <span>Public Website</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* Bottom Sign Out */}
        <div className="p-4 border-t border-emerald-900">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-900/80 hover:bg-rose-600 text-emerald-100 hover:text-white text-sm font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-emerald-900/10 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                AgriPrice Rwanda
              </p>
              <p className="text-sm font-extrabold text-slate-900 leading-tight">
                Admin Workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Supabase Live
            </span>
            <Link
              to="/crops"
              className="px-3.5 py-2 rounded-xl bg-emerald-900 text-white text-xs font-bold hover:bg-emerald-800 transition-colors"
            >
              Live Board
            </Link>
          </div>
        </header>

        {/* Outlet Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
