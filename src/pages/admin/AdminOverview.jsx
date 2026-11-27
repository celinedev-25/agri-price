import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Database,
  Package,
  Users,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  UserPlus,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { isSupabaseConfigured } from "../../supabase.js";
import {
  fetchMarketData,
  groupLatestPrices,
  formatRwf,
} from "../../services/marketService.js";
import { fetchProducts, getProductsSync } from "../../services/productService.js";
import { fetchAdminTeam } from "../../services/adminService.js";
import {
  CropPriceBarChart,
  PriceTrendAreaChart,
  CategoryBreakdownChart,
} from "../../components/admin/AdminCharts.jsx";

function AdminOverview() {
  const { user, profile } = useAuth();
  const [prices, setPrices] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [products, setProducts] = useState(() => getProductsSync());
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadAll = async () => {
      try {
        const [prodList, adminList] = await Promise.all([
          fetchProducts(),
          fetchAdminTeam(user),
        ]);
        if (!active) return;
        setProducts(prodList);
        setAdmins(adminList);

        if (isSupabaseConfigured) {
          const { prices: pRows, districts: dRows } = await fetchMarketData();
          if (!active) return;
          setPrices(pRows);
          setDistricts(dRows);
        }
      } catch {
        // Keep partial data gracefully
      } finally {
        if (active) setLoading(false);
      }
    };
    loadAll();
    return () => {
      active = false;
    };
  }, [user]);

  const latestGrouped = useMemo(() => groupLatestPrices(prices), [prices]);

  const avgMarketPrice = useMemo(() => {
    if (latestGrouped.length > 0) {
      return Math.round(
        latestGrouped.reduce((sum, i) => sum + Number(i.price || 0), 0) /
          latestGrouped.length
      );
    }
    if (products.length > 0) {
      return Math.round(
        products.reduce((sum, p) => sum + Number(p.referencePrice || 0), 0) /
          products.length
      );
    }
    return 0;
  }, [latestGrouped, products]);

  // Bar Chart Data: combine catalog products with live averages
  const barChartData = useMemo(() => {
    const map = new Map();
    for (const p of products) {
      map.set(p.name, { label: p.name, price: Number(p.referencePrice || 0) });
    }
    for (const item of latestGrouped) {
      const key = (item.crop_name || "").trim();
      if (key) {
        map.set(key, { label: key, price: Number(item.price || 0) });
      }
    }
    return Array.from(map.values()).slice(0, 8);
  }, [products, latestGrouped]);

  // Area Chart Data: chronological live submissions (or catalog curve if < 2 live)
  const trendPoints = useMemo(() => {
    if (prices.length >= 2) {
      return [...prices]
        .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
        .slice(-8)
        .map((p) => ({
          label: p.crop_name || "Crop",
          price: Number(p.price || 0),
          shortDate: p.created_at
            ? new Date(p.created_at).toLocaleDateString("en-RW", {
                month: "short",
                day: "numeric",
              })
            : "—",
        }));
    }
    return products.slice(0, 6).map((p, i) => ({
      label: p.name,
      price: Number(p.referencePrice || 0),
      shortDate: `Item ${i + 1}`,
    }));
  }, [prices, products]);

  // Category breakdown
  const categoryItems = useMemo(() => {
    const counts = new Map();
    for (const p of products) {
      const cat = p.category || "Other";
      counts.set(cat, (counts.get(cat) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  return (
    <div className="space-y-8">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Analytics &amp; Control Center
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Welcome back, {profile.fullName}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor Rwanda crop price movements, manage products, and grow your
            admin team.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/admin/prices"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-900 text-white text-xs font-bold hover:bg-emerald-800 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add Price
          </Link>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 text-emerald-950 text-xs font-bold hover:bg-amber-300 transition-colors"
          >
            <Package className="w-4 h-4" />
            Add Product
          </Link>
        </div>
      </div>

      {/* KPI Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-emerald-900/10 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Market Records
            </p>
            <Database className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {loading ? "…" : prices.length}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {districts.length} districts loaded
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-900/10 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Products Catalog
            </p>
            <Package className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {products.length}
          </p>
          <Link
            to="/admin/products"
            className="text-xs font-semibold text-emerald-700 hover:underline mt-1 inline-block"
          >
            Manage products →
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-900/10 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Admin Team
            </p>
            <Users className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {admins.length || 1}
          </p>
          <Link
            to="/admin/team"
            className="text-xs font-semibold text-emerald-700 hover:underline mt-1 inline-block"
          >
            Add co-admin →
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-900/10 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Avg Price / kg
            </p>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-800 mt-2">
            {avgMarketPrice > 0 ? formatRwf(avgMarketPrice) : "—"}
          </p>
          <p className="text-xs text-slate-400 mt-1">Across tracked crops</p>
        </div>
      </section>

      {/* GRAPHS ROW */}
      <section className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-700" />
                Average Price by Crop (RWF/kg)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Live &amp; catalog pricing comparison across commodities
              </p>
            </div>
          </div>
          <CropPriceBarChart data={barChartData} />
        </div>

        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              Price Movement Curve
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Recent price trajectory across market updates
            </p>
          </div>
          <PriceTrendAreaChart points={trendPoints} />
        </div>
      </section>

      {/* BOTTOM ROW: CATEGORY BREAKDOWN + QUICK SHORTCUTS */}
      <section className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-900 mb-1">
            Catalog by Category
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            Distribution of active agricultural products
          </p>
          <CategoryBreakdownChart items={categoryItems} />
        </div>

        <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
          <Link
            to="/admin/products"
            className="group bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all flex flex-col justify-between"
          >
            <div>
              <span className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                <Package className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-emerald-800">
                Add &amp; Edit Products
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Create new agricultural products with images, Kinyarwanda names,
                harvest seasons, and edit existing catalog entries.
              </p>
            </div>
            <span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-emerald-800">
              Open Products Manager <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>

          <Link
            to="/admin/team"
            className="group bg-gradient-to-br from-emerald-950 to-emerald-800 text-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div>
              <span className="w-11 h-11 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center mb-4">
                <UserPlus className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-extrabold">Add a New Admin</h3>
              <p className="text-xs text-emerald-100/85 mt-1.5 leading-relaxed">
                Invite a collaborator or market officer with full Admin access
                to help manage prices and products.
              </p>
            </div>
            <span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-amber-300">
              Manage Admin Team <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default AdminOverview;
