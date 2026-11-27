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
} from "lucide-react";
import { isSupabaseConfigured } from "../../supabase.js";
import {
  fetchMarketData,
  addMarketPrice,
  updateMarketPrice,
  deleteMarketPrice,
  getDistrictName,
  formatRwf,
  formatRelativeDate,
} from "../../services/marketService.js";
import {
  COMMON_CROP_SUGGESTIONS,
  slugifyCrop,
} from "../../data/featuredCrops.js";
import { getProductsSync } from "../../services/productService.js";

function AdminPrices() {
  const [districts, setDistricts] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [cropName, setCropName] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [price, setPrice] = useState("");

  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" });

  const loadData = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      setLoading(true);
      const { prices: pRows, districts: dRows } = await fetchMarketData();
      setPrices(pRows);
      setDistricts(dRows);
    } catch (err) {
      setStatus({
        type: "error",
        text: err.message || "Failed to load market prices.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    fetchMarketData()
      .then(({ prices: pRows, districts: dRows }) => {
        if (!active) return;
        setPrices(pRows);
        setDistricts(dRows);
      })
      .catch((err) => {
        if (!active) return;
        setStatus({
          type: "error",
          text: err.message || "Failed to load market prices.",
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
    getProductsSync().forEach((p) => {
      if (p.name) set.add(p.kinya ? `${p.name} (${p.kinya})` : p.name);
    });
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
        text: "Please enter a valid crop name, district, and price.",
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
          text: `Updated "${updated.crop_name}" to ${formatRwf(updated.price)}.`,
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
    if (!window.confirm(`Delete "${item.crop_name}" (${formatRwf(item.price)})?`))
      return;
    try {
      setDeletingId(item.id);
      await deleteMarketPrice(item.id);
      setPrices((prev) => prev.filter((r) => r.id !== item.id));
      if (editingId === item.id) resetForm();
      setStatus({
        type: "success",
        text: `Deleted price record for "${item.crop_name}".`,
      });
    } catch (err) {
      setStatus({
        type: "error",
        text: err.message || "Failed to delete price.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Live Database CRUD
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Market Prices Manager
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Add, edit, and remove district crop prices directly in Supabase.
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-emerald-900/15 text-sm font-semibold text-slate-700 hover:bg-emerald-50 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Sync Prices
        </button>
      </div>

      {status.text && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm ${
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
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Form */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                {editingId ? (
                  <Pencil className="w-4 h-4" />
                ) : (
                  <PlusCircle className="w-4 h-4" />
                )}
              </span>
              <h2 className="text-lg font-extrabold text-slate-900">
                {editingId ? "Edit Price" : "Add New Price"}
              </h2>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Crop Name
              </label>
              <input
                type="text"
                list="admin-crop-list"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder="e.g. Irish Potatoes (Ibirayi)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                required
              />
              <datalist id="admin-crop-list">
                {cropSuggestions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                District / Market
              </label>
              {districts.length === 0 ? (
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  No districts loaded yet. Enable a public SELECT policy on your
                  Supabase <code>districts</code> table.
                </p>
              ) : (
                <select
                  value={districtId}
                  onChange={(e) => setDistrictId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                  required
                >
                  <option value="">Choose district</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.market || d.name}
                      {d.province ? ` — ${d.province}` : ""}
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
                placeholder="e.g. 950"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                required
              />
            </div>

            <button
              type="submit"
              disabled={saving || districts.length === 0}
              className="w-full py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Price"
                : "Publish Price"}
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-emerald-900/10 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold text-slate-900">
              All Records ({filteredPrices.length})
            </h2>
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
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none"
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
                  <th className="py-3.5 px-5">Updated</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      Loading market prices...
                    </td>
                  </tr>
                ) : filteredPrices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No market prices found.
                    </td>
                  </tr>
                ) : (
                  filteredPrices.map((row) => (
                    <tr
                      key={row.id}
                      className={
                        editingId === row.id
                          ? "bg-amber-50/60"
                          : "hover:bg-slate-50/80"
                      }
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
                            className="p-2 rounded-lg text-slate-500 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(row)}
                            disabled={deletingId === row.id}
                            className="p-2 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                            title="Delete"
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
  );
}

export default AdminPrices;
