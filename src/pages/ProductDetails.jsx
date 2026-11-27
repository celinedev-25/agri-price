import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Calendar,
  ShieldCheck,
  Calculator,
  TrendingUp,
  TrendingDown,
  Minus,
  Scale,
  Sprout,
  Clock,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { isSupabaseConfigured } from "../supabase.js";
import {
  fetchMarketData,
  groupLatestPrices,
  getDistrictName,
  getDistrictProvince,
  formatRwf,
  formatRelativeDate,
} from "../services/marketService.js";
import {
  fetchProducts,
  getProductsSync,
  findProductBySlugOrName,
} from "../services/productService.js";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&auto=format&fit=crop&q=85";

function ProductDetails() {
  const { slug } = useParams();
  const { user, profile, toggleWatchlistCrop } = useAuth();
  const decodedSlug = decodeURIComponent(slug || "");
  const [catalog, setCatalog] = useState(() => getProductsSync());
  const meta = findProductBySlugOrName(decodedSlug, catalog);

  const [prices, setPrices] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [quantityKg, setQuantityKg] = useState("100");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [togglingWatch, setTogglingWatch] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  useEffect(() => {
    let active = true;
    fetchProducts().then((list) => {
      if (active) setCatalog(list);
    });

    if (!isSupabaseConfigured) return () => { active = false; };
    fetchMarketData()
      .then(({ prices: raw, districts: dists }) => {
        if (!active) return;
        setPrices(raw);
        setDistricts(dists);
      })
      .catch(() => {
        // Gracefully fall back to catalog metadata
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const displayName =
    meta?.name ||
    decodedSlug
      .split("-")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") ||
    "Agricultural Product";

  const latestMatching = useMemo(() => {
    const grouped = groupLatestPrices(prices);
    const terms = [
      decodedSlug.toLowerCase(),
      displayName.toLowerCase(),
      meta?.kinya?.toLowerCase(),
      meta?.slug?.toLowerCase(),
    ].filter(Boolean);

    return grouped
      .filter((item) => {
        const name = (item.crop_name || "").toLowerCase();
        return terms.some((t) => name.includes(t) || t.includes(name));
      })
      .sort((a, b) => Number(b.price) - Number(a.price));
  }, [prices, decodedSlug, displayName, meta]);

  // Compute summary stats
  const priceStats = useMemo(() => {
    if (latestMatching.length === 0) {
      const ref = meta?.referencePrice || 0;
      return { avg: ref, min: ref, max: ref, isLive: false };
    }
    const values = latestMatching.map((i) => Number(i.price || 0));
    const sum = values.reduce((a, b) => a + b, 0);
    return {
      avg: Math.round(sum / values.length),
      min: Math.min(...values),
      max: Math.max(...values),
      isLive: true,
    };
  }, [latestMatching, meta]);

  const effectiveDistrictId = useMemo(() => {
    if (latestMatching.length === 0) return "";
    const exists = latestMatching.some(
      (i) => String(i.district_id) === String(selectedDistrictId)
    );
    return exists
      ? String(selectedDistrictId)
      : String(latestMatching[0].district_id);
  }, [latestMatching, selectedDistrictId]);

  const activeDistrictEntry =
    latestMatching.find(
      (i) => String(i.district_id) === String(effectiveDistrictId)
    ) || null;

  const estimatorUnitPrice = activeDistrictEntry
    ? Number(activeDistrictEntry.price)
    : priceStats.avg;

  const qty = Math.max(0, Number(quantityKg) || 0);
  const estimatedValue = Math.round(estimatorUnitPrice * qty);

  const relatedCrops = catalog
    .filter((c) => c.slug !== meta?.slug)
    .slice(0, 3);

  const isWatched = profile.watchlist.some(
    (w) => w.toLowerCase() === displayName.toLowerCase()
  );

  const handleToggleWatch = async () => {
    if (!user) return;
    try {
      setTogglingWatch(true);
      await toggleWatchlistCrop(displayName);
    } finally {
      setTogglingWatch(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf7] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            to="/crops"
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-900 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Crops
          </Link>
          <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
            Home / Products / {displayName}
          </span>
        </div>

        {/* MAIN PRODUCT HERO CARD */}
        <section className="bg-white rounded-3xl border border-emerald-900/10 shadow-sm overflow-hidden mb-10">
          <div className="grid lg:grid-cols-12">
            {/* Image Column */}
            <div className="lg:col-span-5 relative min-h-[300px] sm:min-h-[380px]">
              <img
                src={meta?.image || DEFAULT_IMAGE}
                alt={displayName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-white/95 text-emerald-900 text-xs font-bold shadow-sm">
                  {meta?.category || "Agricultural Crop"}
                </span>
                {meta?.qualityGrade && (
                  <span className="px-3 py-1 rounded-full bg-emerald-950/80 text-amber-300 text-xs font-bold">
                    {meta.qualityGrade}
                  </span>
                )}
              </div>
            </div>

            {/* Info Column */}
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                      {displayName}
                    </h1>
                    {meta?.kinya && (
                      <span className="text-lg font-bold text-emerald-700">
                        ({meta.kinya})
                      </span>
                    )}
                  </div>

                  {user && (
                    <button
                      type="button"
                      disabled={togglingWatch}
                      onClick={handleToggleWatch}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        isWatched
                          ? "bg-emerald-900 text-white border-emerald-900"
                          : "bg-white text-emerald-900 border-emerald-200 hover:bg-emerald-50"
                      }`}
                    >
                      {isWatched ? (
                        <>
                          <BookmarkCheck className="w-4 h-4 text-amber-300" />
                          Saved in Watchlist
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4" />
                          Save to Watchlist
                        </>
                      )}
                    </button>
                  )}
                </div>

                <p className="text-slate-600 mt-4 leading-relaxed">
                  {meta?.description ||
                    `${displayName} market pricing and regional trade insights across districts in Rwanda.`}
                </p>

                {/* Price KPI Row */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-7">
                  <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200/70 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                      {priceStats.isLive ? "Avg Price" : "Reference"}
                    </p>
                    <p className="text-xl sm:text-2xl font-extrabold text-emerald-900 mt-1">
                      {priceStats.avg > 0 ? formatRwf(priceStats.avg) : "—"}
                    </p>
                    <p className="text-[11px] text-emerald-700/80">per kg</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-200/70 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Lowest Market
                    </p>
                    <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                      {priceStats.min > 0 ? formatRwf(priceStats.min) : "—"}
                    </p>
                    <p className="text-[11px] text-slate-500">per kg</p>
                  </div>

                  <div className="rounded-2xl bg-amber-50/80 border border-amber-200/70 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                      Highest Market
                    </p>
                    <p className="text-xl sm:text-2xl font-extrabold text-amber-900 mt-1">
                      {priceStats.max > 0 ? formatRwf(priceStats.max) : "—"}
                    </p>
                    <p className="text-[11px] text-amber-800/80">per kg</p>
                  </div>
                </div>

                {/* Agronomic Details */}
                <div className="grid sm:grid-cols-2 gap-4 mt-6 text-sm">
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/80">
                    <Calendar className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Harvest Season
                      </p>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {meta?.season || "Seasonal & Year-round supply"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/80">
                    <MapPin className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Top Producing Districts
                      </p>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {meta?.topRegions?.join(", ") || "Nationwide Markets"}
                      </p>
                    </div>
                  </div>
                </div>

                {meta?.storageTip && (
                  <div className="mt-5 p-4 rounded-2xl bg-emerald-950/5 border border-emerald-900/10 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-bold text-emerald-950">
                        Post-Harvest Handling Tip
                      </p>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">
                        {meta.storageTip}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* DISTRICT PRICES + QUICK ESTIMATOR */}
        <section className="grid lg:grid-cols-12 gap-8 mb-14 items-start">
          {/* District Breakdown */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-emerald-900/10 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  District Market Prices
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Latest recorded prices for {displayName} across Rwanda
                </p>
              </div>
              <Link
                to="/admin"
                className="text-xs font-bold text-emerald-800 hover:underline"
              >
                + Update Price
              </Link>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm text-slate-400">
                Loading district prices...
              </div>
            ) : latestMatching.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {latestMatching.map((item, idx) => {
                  const province = getDistrictProvince(
                    districts,
                    item.district_id
                  );
                  return (
                    <div
                      key={item.id}
                      className="p-5 flex items-center justify-between gap-4 hover:bg-emerald-50/40 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {getDistrictName(districts, item.district_id)}
                          </span>
                          {idx === 0 && latestMatching.length > 1 && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                              Best Price
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                          {province && <span>{province}</span>}
                          <span className="inline-flex items-center gap-1 text-slate-400">
                            <Clock className="w-3 h-3" />
                            {formatRelativeDate(item.created_at)}
                          </span>
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-extrabold text-emerald-800">
                          {formatRwf(item.price)}
                          <span className="text-xs font-normal text-slate-400">
                            /kg
                          </span>
                        </p>
                        <div className="mt-0.5 flex justify-end">
                          {item.trend === "up" && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                              <TrendingUp className="w-3 h-3" />
                              {item.percentChange !== null
                                ? `+${item.percentChange.toFixed(1)}%`
                                : "Up"}
                            </span>
                          )}
                          {item.trend === "down" && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                              <TrendingDown className="w-3 h-3" />
                              {item.percentChange !== null
                                ? `${item.percentChange.toFixed(1)}%`
                                : "Down"}
                            </span>
                          )}
                          {(item.trend === "same" || item.trend === "new") && (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                              <Minus className="w-3 h-3" />
                              Steady
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                  <Sprout className="w-5 h-5" />
                </div>
                <p className="font-bold text-slate-800">
                  Reference Price: {formatRwf(priceStats.avg)} / kg
                </p>
                <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto">
                  Live district-by-district entries for {displayName} will
                  appear here automatically as soon as market officers record
                  them.
                </p>
              </div>
            )}
          </div>

          {/* Inline Harvest Estimator */}
          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-2.5 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              Quick Harvest Estimator
            </div>
            <h2 className="text-2xl font-extrabold mt-2">
              Estimate Your {displayName} Value
            </h2>

            <div className="mt-6 space-y-4">
              {latestMatching.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                    Choose Market
                  </label>
                  <select
                    value={effectiveDistrictId}
                    onChange={(e) => setSelectedDistrictId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {latestMatching.map((entry) => (
                      <option
                        key={entry.id}
                        value={entry.district_id}
                        className="text-slate-900"
                      >
                        {getDistrictName(districts, entry.district_id)} —{" "}
                        {formatRwf(entry.price)}/kg
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-emerald-200 mb-1.5">
                  Harvest Weight (kg)
                </label>
                <div className="relative">
                  <Scale className="w-4 h-4 text-emerald-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {[50, 100, 500, 1000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setQuantityKg(String(preset))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        Number(quantityKg) === preset
                          ? "bg-amber-400 text-emerald-950"
                          : "bg-white/10 text-emerald-100 hover:bg-white/20"
                      }`}
                    >
                      {preset} kg
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/15">
              <p className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">
                Estimated Total Revenue
              </p>
              <p className="text-3xl sm:text-4xl font-extrabold text-amber-300 mt-1">
                {formatRwf(estimatedValue)}
              </p>
              <p className="text-xs text-emerald-200 mt-1">
                {qty.toLocaleString()} kg × {formatRwf(estimatorUnitPrice)}/kg
              </p>

              <Link
                to={`/prices?crop=${encodeURIComponent(displayName)}`}
                className="mt-6 inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-sm transition-colors"
              >
                Open Full Market Comparator
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* RELATED PRODUCTS */}
        <section>
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                More Agricultural Products
              </p>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                Explore Related Crops
              </h2>
            </div>
            <Link
              to="/"
              className="text-sm font-bold text-emerald-800 hover:text-emerald-600"
            >
              View all →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedCrops.map((crop) => (
              <Link
                key={crop.slug}
                to={`/product/${crop.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-emerald-900/10 shadow-sm hover:shadow-lg transition-all flex items-center gap-4 p-3.5"
              >
                <img
                  src={crop.image}
                  alt={crop.name}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                    {crop.category}
                  </span>
                  <h3 className="font-extrabold text-slate-900 group-hover:text-emerald-800 truncate">
                    {crop.name}{" "}
                    <span className="text-xs font-semibold text-slate-400">
                      ({crop.kinya})
                    </span>
                  </h3>
                  <p className="text-sm font-bold text-emerald-800 mt-1">
                    {formatRwf(crop.referencePrice)}/kg
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-800 shrink-0 mr-1" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProductDetails;
