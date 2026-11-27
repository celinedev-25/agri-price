import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  History,
  Calculator,
  X,
  SlidersHorizontal,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { isSupabaseConfigured } from "../supabase.js";
import {
  fetchMarketData,
  groupLatestPrices,
  getDistrictName,
  getDistrictProvince,
  formatRwf,
  formatRelativeDate,
} from "../services/marketService.js";
import { slugifyCrop } from "../data/featuredCrops.js";
import { findProductBySlugOrName } from "../services/productService.js";

function Crops() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [rawPrices, setRawPrices] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("latest"); // "latest" | "all"
  const [historyItem, setHistoryItem] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const handleRefresh = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    try {
      setError("");
      setRefreshing(true);
      const { prices, districts: dists } = await fetchMarketData();
      setRawPrices(prices);
      setDistricts(dists);
    } catch (err) {
      setError(err.message || "Failed to load market prices.");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let active = true;
    fetchMarketData()
      .then(({ prices, districts: dists }) => {
        if (!active) return;
        setRawPrices(prices);
        setDistricts(dists);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Failed to load market prices.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const latestGrouped = useMemo(
    () => groupLatestPrices(rawPrices),
    [rawPrices]
  );

  const displayList = useMemo(() => {
    const base =
      viewMode === "latest"
        ? latestGrouped
        : rawPrices.map((item) => ({
            ...item,
            trend: "record",
            history: [],
          }));

    const query = search.trim().toLowerCase();

    const filtered = base.filter((item) => {
      const districtLabel = getDistrictName(
        districts,
        item.district_id
      ).toLowerCase();
      const matchesSearch =
        !query ||
        item.crop_name?.toLowerCase().includes(query) ||
        districtLabel.includes(query);

      const matchesDistrict =
        !selectedDistrict || String(item.district_id) === selectedDistrict;

      return matchesSearch && matchesDistrict;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "price-asc") return Number(a.price) - Number(b.price);
      if (sortBy === "price-desc") return Number(b.price) - Number(a.price);
      if (sortBy === "name")
        return (a.crop_name || "").localeCompare(b.crop_name || "");
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
  }, [latestGrouped, rawPrices, viewMode, search, selectedDistrict, sortBy, districts]);

  const stats = useMemo(() => {
    const uniqueCrops = new Set(
      latestGrouped.map((i) => (i.crop_name || "").trim().toLowerCase())
    ).size;
    const avgPrice =
      displayList.length > 0
        ? Math.round(
            displayList.reduce((sum, i) => sum + Number(i.price || 0), 0) /
              displayList.length
          )
        : 0;
    const risingCount = latestGrouped.filter((i) => i.trend === "up").length;
    return { uniqueCrops, avgPrice, risingCount };
  }, [latestGrouped, displayList]);

  const handleClearFilters = () => {
    setSearch("");
    setSelectedDistrict("");
    setSortBy("newest");
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-[#f8faf7] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Live Market Board
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
              Rwanda Crop Prices
            </h1>
            <p className="text-slate-600 mt-2 max-w-2xl">
              Compare up-to-date agricultural prices across districts, monitor
              price changes, and inspect historical trends.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing || !isSupabaseConfigured}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-emerald-900/15 text-sm font-semibold text-slate-700 hover:bg-emerald-50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <Link
              to="/prices"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-900 text-white text-sm font-bold hover:bg-emerald-800 transition-colors"
            >
              <Calculator className="w-4 h-4" />
              Calculator
            </Link>
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-emerald-900/10 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Tracked Crops
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {stats.uniqueCrops}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-emerald-900/10 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Districts Loaded
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {districts.length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-emerald-900/10 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Filtered Avg Price
            </p>
            <p className="text-2xl font-extrabold text-emerald-800 mt-1">
              {stats.avgPrice > 0 ? formatRwf(stats.avgPrice) : "—"}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-emerald-900/10 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Price Increases
            </p>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">
              {stats.risingCount}
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-900/10 shadow-sm mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search crop or district (e.g., Ibirayi, Maize)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
              />
            </div>

            {/* District filter */}
            <div className="md:col-span-4 relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
              >
                <option value="">All Districts</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.market || district.name}
                    {district.province ? ` (${district.province})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="md:col-span-3 relative">
              <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
              >
                <option value="newest">Newest Updated</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Crop Name (A–Z)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            {/* View Mode Toggle */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode("latest")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "latest"
                    ? "bg-white text-emerald-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Latest per District ({latestGrouped.length})
              </button>
              <button
                type="button"
                onClick={() => setViewMode("all")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "all"
                    ? "bg-white text-emerald-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Entries ({rawPrices.length})
              </button>
            </div>

            {(search || selectedDistrict || sortBy !== "newest") && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-semibold text-emerald-800 hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-emerald-900/10 animate-pulse"
              >
                <div className="h-6 bg-slate-200 rounded w-1/2 mb-3" />
                <div className="h-4 bg-slate-100 rounded w-1/3 mb-6" />
                <div className="h-9 bg-emerald-100/70 rounded w-2/3 mb-4" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : displayList.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-emerald-900/10 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              No crop prices found
            </h2>
            <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm">
              Try clearing your search filters or add new market prices from the
              Admin dashboard.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              {(search || selectedDistrict) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
              <Link
                to="/admin"
                className="px-5 py-2.5 rounded-xl bg-emerald-900 text-white text-sm font-bold hover:bg-emerald-800"
              >
                Open Admin Portal
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayList.map((item) => {
              const districtName = getDistrictName(districts, item.district_id);
              const province = getDistrictProvince(districts, item.district_id);
              const meta = findProductBySlugOrName(item.crop_name);
              const productSlug = meta?.slug || slugifyCrop(item.crop_name);

              return (
                <article
                  key={item.id}
                  className="group bg-white rounded-3xl overflow-hidden border border-emerald-900/10 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col justify-between"
                >
                  <div>
                    {meta?.image && (
                      <Link
                        to={`/product/${productSlug}`}
                        className="relative h-40 block overflow-hidden"
                      >
                        <img
                          src={meta.image}
                          alt={item.crop_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 via-transparent to-transparent" />
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 text-emerald-900 text-[11px] font-bold">
                          {meta.category}
                        </span>
                      </Link>
                    )}

                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link to={`/product/${productSlug}`}>
                            <h2 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors">
                              {item.crop_name}
                            </h2>
                          </Link>
                          <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>
                              {districtName}
                              {province ? ` • ${province}` : ""}
                            </span>
                          </p>
                        </div>

                        {/* Trend Badge */}
                        {item.trend === "up" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold shrink-0">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {item.percentChange !== null
                              ? `+${item.percentChange.toFixed(1)}%`
                              : "Up"}
                          </span>
                        )}
                        {item.trend === "down" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold shrink-0">
                            <TrendingDown className="w-3.5 h-3.5" />
                            {item.percentChange !== null
                              ? `${item.percentChange.toFixed(1)}%`
                              : "Down"}
                          </span>
                        )}
                        {item.trend === "same" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold shrink-0">
                            <Minus className="w-3.5 h-3.5" />
                            Steady
                          </span>
                        )}
                        {item.trend === "new" && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold shrink-0">
                            First Entry
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="mt-5 pt-4 border-t border-slate-100">
                        <p className="text-3xl font-extrabold text-emerald-800 tracking-tight">
                          {formatRwf(item.price)}
                          <span className="text-sm font-medium text-slate-400">
                            {" "}
                            / kg
                          </span>
                        </p>
                        {item.previousPrice !== null &&
                          item.previousPrice !== undefined && (
                            <p className="text-xs text-slate-500 mt-1">
                              Previous: {formatRwf(item.previousPrice)} (
                              {item.diff > 0 ? "+" : ""}
                              {formatRwf(item.diff)})
                            </p>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-400">
                      {formatRelativeDate(item.created_at)}
                    </span>

                    <div className="flex items-center gap-2">
                      {viewMode === "latest" && item.history?.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setHistoryItem(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5" />
                          History ({item.history.length})
                        </button>
                      )}
                      <Link
                        to={`/product/${productSlug}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-900 text-white font-semibold hover:bg-emerald-800 transition-colors"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Price History Modal */}
      {historyItem && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setHistoryItem(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-emerald-900/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Price History
                </p>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {historyItem.crop_name}
                </h3>
                <p className="text-sm text-slate-500">
                  {getDistrictName(districts, historyItem.district_id)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryItem(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                aria-label="Close history modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 max-h-80 overflow-y-auto divide-y divide-slate-100">
              {historyItem.history.map((entry, index) => {
                const prev = historyItem.history[index + 1];
                const delta = prev
                  ? Number(entry.price) - Number(prev.price)
                  : null;
                return (
                  <div
                    key={entry.id}
                    className="py-3 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-bold text-slate-900">
                        {formatRwf(entry.price)}
                        {index === 0 && (
                          <span className="ml-2 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Latest
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {entry.created_at
                          ? new Date(entry.created_at).toLocaleString("en-RW")
                          : "Date unavailable"}
                      </p>
                    </div>
                    {delta !== null && (
                      <span
                        className={`text-xs font-bold ${
                          delta > 0
                            ? "text-rose-600"
                            : delta < 0
                            ? "text-emerald-700"
                            : "text-slate-400"
                        }`}
                      >
                        {delta > 0 ? `+${formatRwf(delta)}` : formatRwf(delta)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Crops;
