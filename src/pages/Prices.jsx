import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Calculator,
  Scale,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  AlertCircle,
  ArrowRight,
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

const SAMPLE_DISTRICTS = [
  { id: 1, market: "Kigali (Nyabugogo)", province: "Kigali City" },
  { id: 2, market: "Musanze", province: "Northern" },
  { id: 3, market: "Huye", province: "Southern" },
  { id: 4, market: "Rubavu", province: "Western" },
];

const SAMPLE_PRICES = [
  { id: "s1", crop_name: "Maize (Ibigori)", district_id: 1, price: 520, created_at: new Date().toISOString() },
  { id: "s2", crop_name: "Maize (Ibigori)", district_id: 2, price: 480, created_at: new Date().toISOString() },
  { id: "s3", crop_name: "Irish Potatoes (Ibirayi)", district_id: 1, price: 1100, created_at: new Date().toISOString() },
  { id: "s4", crop_name: "Irish Potatoes (Ibirayi)", district_id: 2, price: 950, created_at: new Date().toISOString() },
  { id: "s5", crop_name: "Beans (Ibishyimbo)", district_id: 3, price: 1850, created_at: new Date().toISOString() },
  { id: "s6", crop_name: "Rice (Umuceri)", district_id: 4, price: 1700, created_at: new Date().toISOString() },
];

const QUANTITY_PRESETS = [50, 100, 250, 500, 1000];

function Prices() {
  const [searchParams] = useSearchParams();
  const [prices, setPrices] = useState(() =>
    isSupabaseConfigured ? [] : SAMPLE_PRICES
  );
  const [districts, setDistricts] = useState(() =>
    isSupabaseConfigured ? [] : SAMPLE_DISTRICTS
  );
  const usingSample = !isSupabaseConfigured;
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState("");

  // Calculator state
  const [selectedCrop, setSelectedCrop] = useState(searchParams.get("crop") || "");
  const [selectedDistrictId, setSelectedDistrictId] = useState(
    searchParams.get("district") || ""
  );
  const [quantityKg, setQuantityKg] = useState("100");
  const [customUnitPrice, setCustomUnitPrice] = useState("");

  // Table filter
  const [tableCropFilter, setTableCropFilter] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let active = true;
    fetchMarketData()
      .then(({ prices: raw, districts: dists }) => {
        if (!active) return;
        setPrices(raw);
        setDistricts(dists);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Could not load live market prices.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const latestPrices = useMemo(() => groupLatestPrices(prices), [prices]);

  const uniqueCrops = useMemo(() => {
    const names = new Map();
    for (const item of latestPrices) {
      const key = (item.crop_name || "").trim().toLowerCase();
      if (key && !names.has(key)) {
        names.set(key, item.crop_name.trim());
      }
    }
    return Array.from(names.values()).sort((a, b) => a.localeCompare(b));
  }, [latestPrices]);

  const effectiveCrop = selectedCrop || uniqueCrops[0] || "";

  // All district entries for the selected crop
  const cropDistrictEntries = useMemo(() => {
    if (!effectiveCrop) return [];
    return latestPrices
      .filter(
        (item) =>
          item.crop_name?.trim().toLowerCase() ===
          effectiveCrop.trim().toLowerCase()
      )
      .sort((a, b) => Number(b.price) - Number(a.price));
  }, [latestPrices, effectiveCrop]);

  const effectiveDistrictId = useMemo(() => {
    if (cropDistrictEntries.length === 0) return "";
    const exists = cropDistrictEntries.some(
      (e) => String(e.district_id) === String(selectedDistrictId)
    );
    return exists
      ? String(selectedDistrictId)
      : String(cropDistrictEntries[0].district_id);
  }, [cropDistrictEntries, selectedDistrictId]);

  const activeEntry = useMemo(
    () =>
      cropDistrictEntries.find(
        (e) => String(e.district_id) === String(effectiveDistrictId)
      ) || null,
    [cropDistrictEntries, effectiveDistrictId]
  );

  const unitPrice =
    customUnitPrice !== ""
      ? Number(customUnitPrice)
      : activeEntry
      ? Number(activeEntry.price)
      : 0;

  const qty = Math.max(0, Number(quantityKg) || 0);
  const estimatedTotal = unitPrice * qty;

  const bestMarketEntry =
    cropDistrictEntries.length > 1 ? cropDistrictEntries[0] : null;
  const bestMarketGain =
    bestMarketEntry &&
    activeEntry &&
    String(bestMarketEntry.district_id) !== String(activeEntry.district_id)
      ? (Number(bestMarketEntry.price) - unitPrice) * qty
      : 0;

  const filteredTableRows = useMemo(() => {
    if (!tableCropFilter) return latestPrices;
    return latestPrices.filter(
      (item) =>
        item.crop_name?.trim().toLowerCase() ===
        tableCropFilter.trim().toLowerCase()
    );
  }, [latestPrices, tableCropFilter]);

  return (
    <div className="min-h-screen bg-[#f8faf7] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Smart Planning Tools
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
            Harvest Calculator &amp; Market Comparison
          </h1>
          <p className="text-slate-600 mt-2 max-w-2xl">
            Estimate the value of your harvest in Rwandan Francs and compare
            current crop prices across districts side-by-side.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* CALCULATOR SECTION */}
        <section className="grid lg:grid-cols-12 gap-6 mb-12">
          {/* Inputs */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Harvest Value Estimator
                </h2>
                <p className="text-xs text-slate-500">
                  Select a crop, district market, and harvest weight
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Select Crop
                  </label>
                  <select
                    value={effectiveCrop}
                    onChange={(e) => {
                      setSelectedCrop(e.target.value);
                      setCustomUnitPrice("");
                    }}
                    disabled={loading || uniqueCrops.length === 0}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                  >
                    {uniqueCrops.length === 0 ? (
                      <option value="">No crops available</option>
                    ) : (
                      uniqueCrops.map((crop) => (
                        <option key={crop} value={crop}>
                          {crop}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    District Market
                  </label>
                  <select
                    value={effectiveDistrictId}
                    onChange={(e) => {
                      setSelectedDistrictId(e.target.value);
                      setCustomUnitPrice("");
                    }}
                    disabled={cropDistrictEntries.length === 0}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                  >
                    {cropDistrictEntries.length === 0 ? (
                      <option value="">No district price</option>
                    ) : (
                      cropDistrictEntries.map((entry) => (
                        <option key={entry.id} value={entry.district_id}>
                          {getDistrictName(districts, entry.district_id)} —{" "}
                          {formatRwf(entry.price)}/kg
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    Harvest Quantity (kg)
                  </label>
                  <span className="text-xs text-slate-400">
                    {(qty / 1000).toFixed(2)} metric tons
                  </span>
                </div>
                <div className="relative">
                  <Scale className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(e.target.value)}
                    placeholder="Enter weight in kg"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {QUANTITY_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setQuantityKg(String(preset))}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        Number(quantityKg) === preset
                          ? "bg-emerald-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800"
                      }`}
                    >
                      {preset.toLocaleString()} kg
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Custom Price Override */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Custom Price Override (optional, RWF/kg)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={customUnitPrice}
                  onChange={(e) => setCustomUnitPrice(e.target.value)}
                  placeholder={
                    activeEntry
                      ? `Using live market rate: ${activeEntry.price} RWF/kg`
                      : "Enter custom price per kg"
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Output Summary Card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
                Estimated Harvest Revenue
              </p>
              <p className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-3 text-white">
                {formatRwf(Math.round(estimatedTotal))}
              </p>
              <p className="text-sm text-emerald-200 mt-2">
                {qty.toLocaleString()} kg × {formatRwf(unitPrice)} / kg
              </p>

              <div className="mt-6 pt-6 border-t border-white/15 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-200">Selected Crop</span>
                  <span className="font-bold">{effectiveCrop || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-200">Market</span>
                  <span className="font-bold">
                    {activeEntry
                      ? getDistrictName(districts, activeEntry.district_id)
                      : "Custom"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-emerald-200">Price Source</span>
                  <span className="font-semibold text-amber-300">
                    {customUnitPrice !== ""
                      ? "Custom Rate"
                      : usingSample
                      ? "Sample Preview"
                      : "Live Supabase"}
                  </span>
                </div>
              </div>

              {bestMarketGain > 0 && bestMarketEntry && (
                <div className="mt-6 p-4 rounded-2xl bg-amber-400/15 border border-amber-300/30">
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                    <Award className="w-4 h-4" />
                    Higher Market Opportunity
                  </div>
                  <p className="text-sm text-emerald-50 mt-1.5 leading-relaxed">
                    Selling in{" "}
                    <strong>
                      {getDistrictName(districts, bestMarketEntry.district_id)}
                    </strong>{" "}
                    ({formatRwf(bestMarketEntry.price)}/kg) could earn{" "}
                    <strong className="text-amber-300">
                      +{formatRwf(Math.round(bestMarketGain))}
                    </strong>{" "}
                    more for this harvest.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-white/15">
              <Link
                to="/crops"
                className="inline-flex items-center gap-2 text-sm font-bold text-amber-300 hover:text-amber-200"
              >
                Explore full live price board
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* MARKET COMPARISON TABLE */}
        <section className="bg-white rounded-3xl border border-emerald-900/10 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Cross-District Price Comparison
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Compare latest prices per kilogram across all recorded markets
              </p>
            </div>

            <select
              value={tableCropFilter}
              onChange={(e) => setTableCropFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
            >
              <option value="">All Crops ({latestPrices.length})</option>
              {uniqueCrops.map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <th className="py-3.5 px-6">Crop</th>
                  <th className="py-3.5 px-6">District / Market</th>
                  <th className="py-3.5 px-6">Price / kg</th>
                  <th className="py-3.5 px-6">Trend</th>
                  <th className="py-3.5 px-6">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      Loading market table...
                    </td>
                  </tr>
                ) : filteredTableRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      No market prices recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredTableRows.map((row) => {
                    const province = getDistrictProvince(
                      districts,
                      row.district_id
                    );
                    return (
                      <tr
                        key={row.id}
                        className="hover:bg-emerald-50/40 transition-colors"
                      >
                        <td className="py-4 px-6 font-bold text-slate-900">
                          {row.crop_name}
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                            {getDistrictName(districts, row.district_id)}
                            {province ? (
                              <span className="text-xs text-slate-400">
                                ({province})
                              </span>
                            ) : null}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-extrabold text-emerald-800">
                          {formatRwf(row.price)}
                        </td>
                        <td className="py-4 px-6">
                          {row.trend === "up" && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                              <TrendingUp className="w-3.5 h-3.5" />
                              Up
                            </span>
                          )}
                          {row.trend === "down" && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                              <TrendingDown className="w-3.5 h-3.5" />
                              Down
                            </span>
                          )}
                          {(row.trend === "same" || row.trend === "new") && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                              <Minus className="w-3.5 h-3.5" />
                              {row.trend === "new" ? "New" : "Steady"}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-400">
                          {formatRelativeDate(row.created_at)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Prices;
