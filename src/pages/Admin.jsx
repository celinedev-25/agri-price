import { useCallback, useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { isSupabaseConfigured } from "../supabase.js";
import {
  fetchMarketData,
  addMarketPrice,
  updateMarketPrice,
  deleteMarketPrice,
  getDistrictName,
  formatRwf,
  formatRelativeDate,
} from "../services/marketService.js";
import { COMMON_CROP_SUGGESTIONS } from "../data/featuredCrops.js";

function Admin() {
  const [districts, setDistricts] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form state
  const [editingId, setEditingId] = useState(null);
  const [cropName, setCropName] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [price, setPrice] = useState("");

  // Table search
  const [search, setSearch] = useState("");

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

  const cropSuggestions = useMemo(() => {
    const set = new Set(COMMON_CROP_SUGGESTIONS);
    prices.forEach((p) => {
      if (p.crop_name?.trim()) set.add(p.crop_name.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [prices]);

  const filteredPrices = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return prices;
    return prices.filter((item) => {
      const distName = getDistrictName(districts, item.district_id).toLowerCase();
      return (
        item.crop_name?.toLowerCase().includes(q) || distName.includes(q)
      );
    });
  }, [prices, districts, search]);

  const resetForm = () => {
    setEditingId(null);
    setCropName("");
    setDistrictId("");
    setPrice("");
  };

  const handleEdit = (item) => {
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
          text: `Added "${created.crop_name}" at ${formatRwf(created.price)}.`,
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
    <div className="min-h-screen bg-[#f8faf7] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Market Administration
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
              AgriPrice Admin Portal
            </h1>
            <p className="text-slate-600 mt-2">
              Add, update, and manage Rwanda crop market prices directly in
              Supabase.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading || !isSupabaseConfigured}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-emerald-900/15 text-sm font-semibold text-slate-700 hover:bg-emerald-50 disabled:opacity-50 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Sync Supabase
          </button>
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

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* FORM CARD */}
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
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    {isSupabaseConfigured
                      ? "No districts found in your Supabase 'districts' table."
                      : "Connect Supabase in .env.local to load districts."}
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
                disabled={
                  saving ||
                  loading ||
                  !isSupabaseConfigured ||
                  districts.length === 0
                }
                className="w-full py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Price"
                  : "Save Market Price"}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-700" />
                {districts.length} districts loaded
              </span>
              <span>{prices.length} total records</span>
            </div>
          </div>

          {/* RECORDS TABLE */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-emerald-900/10 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Recorded Market Prices
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click edit to modify a price or delete to remove an entry
                </p>
              </div>

              <div className="relative sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter records..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                />
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
                        {isSupabaseConfigured
                          ? "No market price records found."
                          : "Add your Supabase key in .env.local to manage records."}
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
                          {row.crop_name}
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
      </div>
    </div>
  );
}

export default Admin;
