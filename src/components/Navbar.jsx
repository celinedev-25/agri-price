import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Sprout,
  ShieldCheck,
  LayoutDashboard,
  User,
  LogOut,
  LogIn,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/crops", label: "Live Prices" },
  { to: "/prices", label: "Calculator" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

function Navbar() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  const initials = (profile.fullName || "A")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    closeMenu();
    await signOut();
    navigate("/", { replace: true });
  };

  const linkClass = ({ isActive }) =>
    `px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
      isActive
        ? "bg-emerald-800 text-amber-300"
        : "text-emerald-100 hover:bg-emerald-800/60 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-emerald-950/95 backdrop-blur-md border-b border-emerald-800/60 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Brand */}
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-2.5 group"
          >
            <span className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5" />
            </span>
            <div className="leading-tight">
              <span className="text-lg font-extrabold tracking-tight block">
                Agri<span className="text-amber-400">Price</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-emerald-300 font-semibold block">
                Rwanda Markets
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={linkClass}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Auth / Dashboard Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <>
                <NavLink
                  to={isAdmin ? "/admin" : "/dashboard"}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? "bg-amber-400 text-emerald-950 shadow-sm"
                        : "bg-emerald-800/80 text-white hover:bg-amber-400 hover:text-emerald-950 border border-emerald-700"
                    }`
                  }
                >
                  {isAdmin ? (
                    <ShieldCheck className="w-4 h-4" />
                  ) : (
                    <LayoutDashboard className="w-4 h-4" />
                  )}
                  {isAdmin ? "Admin" : "Dashboard"}
                </NavLink>

                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl text-xs font-bold transition-colors border ${
                      isActive
                        ? "bg-white text-emerald-950 border-white"
                        : "bg-emerald-900/80 text-emerald-100 border-emerald-700/80 hover:bg-emerald-800"
                    }`
                  }
                  title="Profile Settings"
                >
                  <span className="w-6 h-6 rounded-lg bg-amber-400 text-emerald-950 flex items-center justify-center text-[11px] font-extrabold">
                    {initials}
                  </span>
                  <span className="max-w-[96px] truncate">
                    {profile.fullName.split(" ")[0]}
                  </span>
                </NavLink>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="p-2 rounded-xl text-emerald-200 hover:bg-emerald-800 hover:text-white transition-colors cursor-pointer"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-emerald-100 hover:bg-emerald-800/70 hover:text-white transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-amber-400 text-emerald-950 hover:bg-amber-300 shadow-sm transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-lg text-emerald-100 hover:bg-emerald-800 transition-colors"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden bg-emerald-950 border-t border-emerald-800/70 px-4 pt-3 pb-5 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeMenu}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-emerald-800 text-amber-300"
                    : "text-emerald-100 hover:bg-emerald-900"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}

          <div className="pt-3 mt-2 border-t border-emerald-800/70 space-y-2">
            {user ? (
              <>
                <NavLink
                  to={isAdmin ? "/admin" : "/dashboard"}
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-bold bg-amber-400 text-emerald-950 hover:bg-amber-300 transition-colors"
                >
                  {isAdmin ? (
                    <ShieldCheck className="w-4 h-4" />
                  ) : (
                    <LayoutDashboard className="w-4 h-4" />
                  )}
                  {isAdmin ? "Admin Dashboard" : "My Dashboard"}
                </NavLink>
                <NavLink
                  to="/profile"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-900 text-emerald-100 hover:bg-emerald-800 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile ({profile.fullName})
                </NavLink>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-300 hover:bg-emerald-900 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-900 text-white hover:bg-emerald-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold bg-amber-400 text-emerald-950 hover:bg-amber-300"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
