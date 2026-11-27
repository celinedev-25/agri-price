import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bookmark,
  BookmarkCheck,
  Calculator,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  User,
  Sprout,
  Clock,
  Plus,
  X,
  Scale,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { isSupabaseConfigured } from "../supabase.js";
import {
  fetchMarketData,
  groupLatestPrices,
  getDistrictName,
  formatRwf,
  formatRelativeDate,
} from "../services/marketService.js";
import {
  POPULAR_CROPS,
  findCropMeta,
  slugifyCrop,
} from "../data/featuredCrops.js";

function UserDashboard() {
  const { profile, toggleWatchlistCrop } = useAuth();
  const [prices, setPrices] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [updatingCrop, setUpdatingCrop] = useState("");

  // Quick estimator state
  const [estCrop, setEstCrop] = useState("Maize");
  const [estKg, setEstKg] = useState("200");

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let active = true;
    fetchMarketData()
      .then(({ prices: raw, districts: dists }) => {
        if (!active) return;
        setPrices(raw);
        setDistricts(dists);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const latestPrices = useMemo(() => groupLatestPrices(prices), [prices]);

  const getCropSummary = (cropName) => {
    const meta = findCropMeta(cropName);
    const needle = cropName.toLowerCase();
    const matches = latestPrices.filter((item) => {
      const n = (item.crop_name || "").toLowerCase();
      return (
        n.includes(needle) ||
        needle.includes(n) ||
        (meta?.kinya && n.includes(meta.kinya.toLowerCase()))
      );
    });

    if (matches.length === 0) {
      return {
        name: meta?.name || cropName,
        kinya: meta?.kinya || "",
        image: meta?.image,
        slug: meta?.slug || slugifyCrop(cropName),
        price: meta?.referencePrice || 0,
        trend: "same",
        isLive: false,
      };
    }

    const avg = Math.round(
      matches.reduce((sum, m) => sum + Number(m.price || 0), 0) / matches.length
    );

    return {
      name: meta?.name || matches[0].crop_name,
      kinya: meta?.kinya || "",
      image: meta?.image,
      slug: meta?.slug || slugifyCrop(cropName),
      price: avg,
      trend: matches[0].trend,
      isLive: true,
    };
  };

  const handleToggleWatch = async (cropName) => {
    try {
      setUpdatingCrop(cropName);
      await toggleWatchlistCrop(cropName);
    } finally {
      setUpdatingCrop("");
    }
  };

  const unwatchedPopular = POPULAR_CROPS.filter(
    (c) =>
      !profile.watchlist.some(
        (w) =>
          w.toLowerCase() === c.name.toLowerCase() ||
          w.toLowerCase() === c.slug.toLowerCase()
      )
  );

  const highestListing = useMemo(() => {
    if (latestPrices.length === 0) return null;
    return [...latestPrices].sort(
      (a, b) => Number(b.price) - Number(a.price)
    )[0];
  }, [latestPrices]);

  const estSummary = getCropSummary(estCrop);
  const estTotal = Math.round(
    estSummary.price * Math.max(0, Number(estKg) || 0)
  );

  return (
    <div className="min-h-screen bg-[#f8faf7] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Banner */}
        <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
              Farmer &amp; Buyer Workspace
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
              Welcome back, {profile.fullName}
            </h1>
            <p className="text-sm text-emerald-100/85 mt-1.5 flex flex-wrap items-center gap-3">
              {profile.district && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {profile.district}
                </span>
              )}
              {profile.organization && <span>• {profile.organization}</span>}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/crops"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-emerald-950 text-sm font-bold hover:bg-amber-300 transition-colors"
            >
              <Sprout className="w-4 h-4" />
              Live Market Board
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
            >
              <User className="w-4 h-4" />
              Edit Profile
            </Link>
          </div>
        </section>

        {/* KPI Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-emerald-900/10 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Watched Crops
            </p>
            <p className="text-2xl font-extrabold text-emerald-900 mt-1">
              {profile.watchlist.length}
            </p>
            <p className="text-xs text-slate-400 mt-1">Pinned to dashboard</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-emerald-900/10 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Live Market Listings
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {loading ? "…" : latestPrices.length}
            </p>
            <p className="text-xs text-slate-400 mt-1">Updated via Supabase</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-emerald-900/10 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Top Priced Crop
            </p>
            <p className="text-2xl font-extrabold text-amber-700 mt-1 truncate">
              {highestListing ? formatRwf(highestListing.price) : "—"}
            </p>
            <p className="text-xs text-slate-400 mt-1 truncate">
              {highestListing ? highestListing.crop_name : "No live data yet"}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-emerald-900/10 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              My District
            </p>
            <p className="text-xl font-extrabold text-slate-900 mt-1 truncate">
              {profile.district || "Not set"}
            </p>
            <Link
              to="/profile"
              className="text-xs font-semibold text-emerald-700 hover:underline mt-1 inline-block"
            >
              Change location
            </Link>
          </div>
        </section>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: MY CROP WATCHLIST + LIVE UPDATES */}
          <div className="lg:col-span-8 space-y-8">
            {/* Watchlist */}
            <section className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <BookmarkCheck className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      My Crop Watchlist
                    </h2>
                    <p className="text-xs text-slate-500">
                      Track your priority crops at a glance
                    </p>
                  </div>
                </div>
              </div>

              {profile.watchlist.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  Add crops below to start tracking their prices here.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {profile.watchlist.map((cropName) => {
                    const summary = getCropSummary(cropName);
                    return (
                      <div
                        key={cropName}
                        className="rounded-2xl border border-slate-200/80 p-4 hover:border-emerald-500/40 hover:shadow-sm transition-all flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {summary.image ? (
                            <img
                              src={summary.image}
                              alt={summary.name}
                              className="w-12 h-12 rounded-xl object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                              <Sprout className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <Link
                              to={`/product/${summary.slug}`}
                              className="font-extrabold text-slate-900 hover:text-emerald-800 truncate block"
                            >
                              {summary.name}
                            </Link>
                            <p className="text-sm font-bold text-emerald-800">
                              {formatRwf(summary.price)}
                              <span className="text-xs font-normal text-slate-400">
                                /kg
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Link
                            to={`/product/${summary.slug}`}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100"
                          >
                            View
                          </Link>
                          <button
                            type="button"
                            disabled={updatingCrop === cropName}
                            onClick={() => handleToggleWatch(cropName)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                            aria-label={`Remove ${cropName}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quick Add Pills */}
              {unwatchedPopular.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-2.5">
                    Quick add to watchlist:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {unwatchedPopular.map((crop) => (
                      <button
                        key={crop.slug}
                        type="button"
                        disabled={updatingCrop === crop.name}
                        onClick={() => handleToggleWatch(crop.name)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-900 hover:text-white text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {crop.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Recent Live Market Feed */}
            <section className="bg-white rounded-3xl border border-emerald-900/10 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Latest Live Market Prices
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fresh price submissions from across Rwanda
                  </p>
                </div>
                <Link
                  to="/crops"
                  className="text-xs font-bold text-emerald-800 hover:underline inline-flex items-center gap-1"
                >
                  See all
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="p-8 text-center text-sm text-slate-400">
                  Syncing live market feed...
                </div>
              ) : latestPrices.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No live price entries recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {latestPrices.slice(0, 6).map((item) => (
                    <Link
                      key={item.id}
                      to={`/product/${slugifyCrop(item.crop_name)}`}
                      className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-emerald-50/40 transition-colors"
                    >
                      <div>
                        <p className="font-bold text-slate-900">
                          {item.crop_name}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            {getDistrictName(districts, item.district_id)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-slate-400">
                            <Clock className="w-3 h-3" />
                            {formatRelativeDate(item.created_at)}
                          </span>
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-extrabold text-emerald-800">
                          {formatRwf(item.price)}
                          <span className="text-xs font-normal text-slate-400">
                            /kg
                          </span>
                        </p>
                        {item.trend === "up" && (
                          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-rose-600">
                            <TrendingUp className="w-3 h-3" /> Up
                          </span>
                        )}
                        {item.trend === "down" && (
                          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-700">
                            <TrendingDown className="w-3 h-3" /> Down
                          </span>
                        )}
                        {(item.trend === "same" || item.trend === "new") && (
                          <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-400">
                            <Minus className="w-3 h-3" /> Steady
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT: QUICK HARVEST ESTIMATOR */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Calculator className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Quick Estimator
                  </h2>
                  <p className="text-xs text-slate-500">
                    Instant harvest value check
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Crop
                  </label>
                  <select
                    value={estCrop}
                    onChange={(e) => setEstCrop(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  >
                    {POPULAR_CROPS.map((c) => (
                      <option key={c.slug} value={c.name}>
                        {c.name} ({c.kinya})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Weight (kg)
                  </label>
                  <div className="relative">
                    <Scale className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="0"
                      value={estKg}
                      onChange={(e) => setEstKg(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-emerald-950 text-white p-5">
                  <p className="text-[11px] uppercase tracking-wider text-emerald-300 font-bold">
                    Estimated Revenue
                  </p>
                  <p className="text-2xl font-extrabold text-amber-300 mt-1">
                    {formatRwf(estTotal)}
                  </p>
                  <p className="text-xs text-emerald-200 mt-1">
                    at {formatRwf(estSummary.price)}/kg
                  </p>
                </div>

                <Link
                  to={`/prices?crop=${encodeURIComponent(estCrop)}`}
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-900 font-bold text-sm hover:bg-emerald-100 transition-colors"
                >
                  Compare Across Districts
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
