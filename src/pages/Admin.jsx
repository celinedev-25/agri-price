import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Database,
  BarChart3,
  MapPin,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { isSupabaseConfigured } from "../supabase.js";
import {
  fetchMarketData,
  addMarketPrice,
  updateMarketPrice,
  deleteMarketPrice,
  groupLatestPrices,
  getDistrictName,
  formatRwf,
  formatRelativeDate,
} from "../services/marketService.js";
import {
  COMMON_CROP_SUGGESTIONS,
  slugifyCrop,
} from "../data/featuredCrops.js";

function Admin() {
  const { profile } = useAuth();
  const [districts, setDistricts] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [activeTab, setActiveTab] = useState("prices"); // "prices" | "districts" | "analytics"

  // Form state
  const [editingId, setEditingId] = useState(null);
  const [cropName, setCropName] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [price, setPrice] = useState("");

  // Table search & filter
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");

  // Feedback banner
  const [status, setStatus] = useState({ type: "", text: "" });

  const loadData = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    try {
      setLoading(true);
      const { prices: priceRows, districts: districtRows } =
        await fetchMarketData();
      setPrices(priceRows);
      setDistricts(districtRows);
    } catch (err) {
      setStatus({
        type: "error",
        text: err.message || "Failed to load data from Supabase.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    let active = true;
    fetchMarketData()
      .then(({ prices: priceRows, districts: districtRows }) => {
        if (!active) return;
        setPrices(priceRows);
        setDistricts(districtRows);
      })
      .catch((err) => {
        if (!active) return;
        setStatus({
          type: "error",
          text: err.message || "Failed to load data from Supabase.",
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const latestGrouped = useMemo(() => groupLatestPrices(prices), [prices]);

  const analytics = useMemo(() => {
    const uniqueCrops = new Set(
      prices.map((p) => (p.crop_name || "").trim().toLowerCase()).filter(Boolean)
    ).size;
    const avgPrice =
      latestGrouped.length > 0
        ? Math.round(
            latestGrouped.reduce((sum, i) => sum + Number(i.price || 0), 0) /
              latestGrouped.length
          )
        : 0;
    const rising = latestGrouped.filter((i) => i.trend === "up").length;
    const falling = latestGrouped.filter((i) => i.trend === "down").length;
    const sortedByPrice = [...latestGrouped].sort(
      (a, b) => Number(b.price) - Number(a.price)
    );
    return {
      uniqueCrops,
      avgPrice,
      rising,
      falling,
      topExpensive: sortedByPrice.slice(0, 5),
      mostAffordable: [...sortedByPrice].reverse().slice(0, 5),
    };
  }, [prices, latestGrouped]);

  const cropSuggestions = useMemo(() => {
    const set = new Set(COMMON_CROP_SUGGESTIONS);
    prices.forEach((p) => {
      if (p.crop_name?.trim()) set.add(p.crop_name.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [prices]);

  const filteredPrices = useMemo(() => {
    const q = search.trim().toLowerCase();
    return prices.filter((item) => {
      const distName = getDistrictName(
        districts,
        item.district_id
      ).toLowerCase();
      const matchesQuery =
        !q || item.crop_name?.toLowerCase().includes(q) || distName.includes(q);
      const matchesDistrict =
        !districtFilter || String(item.district_id) === districtFilter;
      return matchesQuery && matchesDistrict;
    });
  }, [prices, districts, search, districtFilter]);

  const districtStats = useMemo(() => {
    return districts.map((d) => {
      const rows = latestGrouped.filter(
        (p) => String(p.district_id) === String(d.id)
      );
      const avg =
        rows.length > 0
          ? Math.round(
              rows.reduce((sum, r) => sum + Number(r.price || 0), 0) /
                rows.length
            )
          : 0;
      return { ...d, count: rows.length, avg };
    });
  }, [districts, latestGrouped]);

  const resetForm = () => {
    setEditingId(null);
    setCropName("");
    setDistrictId("");
    setPrice("");
  };

  const handleEdit = (item) => {
    setActiveTab("prices");
    setEditingId(item.id);
    setCropName(item.crop_name || "");
    setDistrictId(String(item.district_id || ""));
    setPrice(String(item.price ?? ""));
    setStatus({ type: "", text: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", text: "" });

    if (!cropName.trim() || !districtId || price === "" || Number(price) < 0) {
      setStatus({
        type: "error",
        text: "Please enter a valid crop name, district, and non-negative price.",
      });
      return;
    }

    try {
      setSaving(true);
      if (editingId) {
        const updated = await updateMarketPrice(editingId, {
          crop_name: cropName,
          district_id: districtId,
          price,
        });
        setPrices((prev) =>
          prev.map((row) => (row.id === editingId ? updated : row))
        );
        setStatus({
          type: "success",
          text: `Updated "${updated.crop_name}" price to ${formatRwf(
            updated.price
          )}.`,
        });
      } else {
        const created = await addMarketPrice({
          crop_name: cropName,
          district_id: districtId,
          price,
        });
        setPrices((prev) => [created, ...prev]);
        setStatus({
          type: "success",
          text: `Published "${created.crop_name}" at ${formatRwf(
            created.price
          )}.`,
        });
      }
      resetForm();
    } catch (err) {
      setStatus({
        type: "error",
        text: err.message || "Could not save price to Supabase.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Delete "${item.crop_name}" (${formatRwf(item.price)}) in ${getDistrictName(
        districts,
        item.district_id
      )}?`
    );
    if (!confirmed) return;

    try {
      setDeletingId(item.id);
      setStatus({ type: "", text: "" });
      await deleteMarketPrice(item.id);
      setPrices((prev) => prev.filter((row) => row.id !== item.id));
      if (editingId === item.id) resetForm();
      setStatus({
        type: "success",
        text: `Deleted price record for "${item.crop_name}".`,
      });
    } catch (err) {
      setStatus({
        type: "error",
        text: err.message || "Failed to delete record.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf7] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Admin Console Header */}
        <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Console • Signed in as {profile.fullName}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              AgriPrice Market Administration
            </h1>
            <p className="text-sm text-emerald-100/85 mt-1.5">
              Publish, edit, and audit agricultural market prices directly in
              Supabase.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={loadData}
              disabled={loading || !isSupabaseConfigured}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-emerald-950 text-sm font-bold hover:bg-amber-300 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Sync Supabase
            </button>
            <Link
              to="/crops"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
            >
              View Public Board
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* KPI Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-emerald-900/10 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Price Records
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {prices.length}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {latestGrouped.length} active pairs
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-emerald-900/10 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Unique Crops
            </p>
            <p className="text-2xl font-extrabold text-emerald-900 mt-1">
              {analytics.uniqueCrops}
            </p>
            <p className="text-xs text-slate-400 mt-1">Tracked commodities</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-emerald-900/10 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Loaded Districts
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {districts.length}
            </p>
            <p className="text-xs text-slate-400 mt-1">Rwanda markets</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-emerald-900/10 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Avg Market Price
            </p>
            <p className="text-2xl font-extrabold text-amber-700 mt-1">
              {analytics.avgPrice > 0 ? formatRwf(analytics.avgPrice) : "—"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              ↑ {analytics.rising} rising • ↓ {analytics.falling} falling
            </p>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: "prices", label: "Manage Prices", icon: Database },
            { id: "districts", label: "Districts Overview", icon: MapPin },
            { id: "analytics", label: "Market Insights", icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-emerald-900 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-emerald-900/10 hover:bg-emerald-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Status Message */}
        {status.text && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm ${
              status.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {status.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span className="font-medium">{status.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatus({ type: "", text: "" })}
              className="p-1 rounded-lg hover:bg-black/5 cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 1: MANAGE PRICES (CRUD) */}
        {activeTab === "prices" && (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Form Card */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    {editingId ? (
                      <Pencil className="w-4 h-4" />
                    ) : (
                      <PlusCircle className="w-4 h-4" />
                    )}
                  </span>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {editingId ? "Edit Market Price" : "Add Market Price"}
                  </h2>
                </div>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Crop Name
                  </label>
                  <input
                    type="text"
                    list="crop-suggestions"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    placeholder="e.g. Irish Potatoes (Ibirayi)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                    required
                  />
                  <datalist id="crop-suggestions">
                    {cropSuggestions.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    District / Market
                  </label>
                  {loading ? (
                    <p className="text-xs text-slate-400 py-2">
                      Loading districts...
                    </p>
                  ) : districts.length === 0 ? (
                    <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
                      No districts returned from Supabase. Ensure your{" "}
                      <code>districts</code> table has a public SELECT RLS
                      policy.
                    </p>
                  ) : (
                    <select
                      value={districtId}
                      onChange={(e) => setDistrictId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                      required
                    >
                      <option value="">Select a district</option>
                      {districts.map((district) => (
                        <option key={district.id} value={district.id}>
                          {district.market || district.name}
                          {district.province ? ` — ${district.province}` : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Price per kg (RWF)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 1200"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving || loading || districts.length === 0}
                  className="w-full py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Market Price"
                    : "Publish Market Price"}
                </button>
              </form>
            </div>

            {/* CRUD Table */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-emerald-900/10 shadow-sm overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Recorded Market Prices ({filteredPrices.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Edit or remove entries directly from Supabase
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search crop..."
                      className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm w-44 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                    />
                  </div>
                  {districts.length > 0 && (
                    <select
                      value={districtFilter}
                      onChange={(e) => setDistrictFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                    >
                      <option value="">All Districts</option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.market || d.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                      <th className="py-3.5 px-5">Crop</th>
                      <th className="py-3.5 px-5">District</th>
                      <th className="py-3.5 px-5">Price</th>
                      <th className="py-3.5 px-5">Added</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {loading ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-12 text-center text-slate-400"
                        >
                          Loading records from Supabase...
                        </td>
                      </tr>
                    ) : filteredPrices.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-12 text-center text-slate-400"
                        >
                          No market price records match your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredPrices.map((row) => (
                        <tr
                          key={row.id}
                          className={`transition-colors ${
                            editingId === row.id
                              ? "bg-amber-50/60"
                              : "hover:bg-slate-50/80"
                          }`}
                        >
                          <td className="py-3.5 px-5 font-bold text-slate-900">
                            <Link
                              to={`/product/${slugifyCrop(row.crop_name)}`}
                              className="hover:text-emerald-800 hover:underline"
                            >
                              {row.crop_name}
                            </Link>
                          </td>
                          <td className="py-3.5 px-5 text-slate-600">
                            {getDistrictName(districts, row.district_id)}
                          </td>
                          <td className="py-3.5 px-5 font-extrabold text-emerald-800">
                            {formatRwf(row.price)}
                          </td>
                          <td className="py-3.5 px-5 text-xs text-slate-400">
                            {formatRelativeDate(row.created_at)}
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleEdit(row)}
                                className="p-2 rounded-lg text-slate-500 hover:bg-emerald-50 hover:text-emerald-800 transition-colors cursor-pointer"
                                title="Edit price"
                                aria-label={`Edit ${row.crop_name}`}
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(row)}
                                disabled={deletingId === row.id}
                                className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40 transition-colors cursor-pointer"
                                title="Delete price"
                                aria-label={`Delete ${row.crop_name}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DISTRICTS OVERVIEW */}
        {activeTab === "districts" && (
          <section className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-sm">
            <h2 className="text-lg font-extrabold text-slate-900 mb-1">
              Covered Districts ({districts.length})
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Active price listings and average crop price per district
            </p>

            {districtStats.length === 0 ? (
              <p className="text-sm text-slate-500 py-8 text-center">
                No districts loaded yet. Make sure your Supabase{" "}
                <code>districts</code> table allows public SELECT.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {districtStats.map((d) => (
                  <div
                    key={d.id}
                    className="rounded-2xl border border-slate-200/80 p-4 flex items-center justify-between gap-3 hover:border-emerald-500/40 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-slate-900">
                        {d.market || d.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {d.province || `District #${d.id}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-emerald-800">
                        {d.count} listings
                      </p>
                      <p className="text-xs text-slate-400">
                        {d.avg > 0 ? `Avg ${formatRwf(d.avg)}` : "No prices"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 3: MARKET ANALYTICS */}
        {activeTab === "analytics" && (
          <section className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-sm">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm mb-4">
                <TrendingUp className="w-4 h-4" />
                Highest Priced Listings
              </div>
              {analytics.topExpensive.length === 0 ? (
                <p className="text-sm text-slate-400">No data available yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {analytics.topExpensive.map((item) => (
                    <div
                      key={item.id}
                      className="py-3 flex items-center justify-between text-sm"
                    >
                      <div>
                        <p className="font-bold text-slate-900">
                          {item.crop_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {getDistrictName(districts, item.district_id)}
                        </p>
                      </div>
                      <span className="font-extrabold text-emerald-800">
                        {formatRwf(item.price)}/kg
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-4">
                <TrendingDown className="w-4 h-4" />
                Most Affordable Listings
              </div>
              {analytics.mostAffordable.length === 0 ? (
                <p className="text-sm text-slate-400">No data available yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {analytics.mostAffordable.map((item) => (
                    <div
                      key={item.id}
                      className="py-3 flex items-center justify-between text-sm"
                    >
                      <div>
                        <p className="font-bold text-slate-900">
                          {item.crop_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {getDistrictName(districts, item.district_id)}
                        </p>
                      </div>
                      <span className="font-extrabold text-emerald-800">
                        {formatRwf(item.price)}/kg
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default Admin;
