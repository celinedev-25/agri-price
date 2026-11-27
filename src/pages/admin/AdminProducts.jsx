import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  Pencil,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Image as ImageIcon,
  Search,
} from "lucide-react";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsSync,
} from "../../services/productService.js";
import { formatRwf } from "../../services/marketService.js";

const CATEGORIES = [
  "Grains",
  "Tubers",
  "Vegetables",
  "Fruits",
  "Legumes",
  "Cash Crops",
];

const EMPTY_FORM = {
  name: "",
  kinya: "",
  category: "Vegetables",
  unit: "kg",
  referencePrice: "",
  qualityGrade: "Grade A",
  season: "Year-round",
  topRegions: "",
  image: "",
  description: "",
  storageTip: "",
};

function AdminProducts() {
  const [products, setProducts] = useState(() => getProductsSync());
  const [editingSlug, setEditingSlug] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  useEffect(() => {
    let active = true;
    fetchProducts().then((list) => {
      if (active) setProducts(list);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setEditingSlug(null);
    setForm(EMPTY_FORM);
  };

  const handleEdit = (product) => {
    setEditingSlug(product.slug);
    setForm({
      name: product.name || "",
      kinya: product.kinya || "",
      category: product.category || "Vegetables",
      unit: product.unit || "kg",
      referencePrice: String(product.referencePrice ?? ""),
      qualityGrade: product.qualityGrade || "",
      season: product.season || "",
      topRegions: Array.isArray(product.topRegions)
        ? product.topRegions.join(", ")
        : product.topRegions || "",
      image: product.image || "",
      description: product.description || "",
      storageTip: product.storageTip || "",
    });
    setStatus({ type: "", text: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", text: "" });

    if (!form.name.trim()) {
      setStatus({ type: "error", text: "Product name is required." });
      return;
    }

    try {
      setSaving(true);
      if (editingSlug) {
        const updated = await updateProduct(editingSlug, form);
        setProducts((prev) =>
          prev.map((p) => (p.slug === editingSlug ? updated : p))
        );
        setStatus({
          type: "success",
          text: `Updated product "${updated.name}" across Home & Product Details.`,
        });
      } else {
        const created = await createProduct(form);
        setProducts((prev) => [
          created,
          ...prev.filter((p) => p.slug !== created.slug),
        ]);
        setStatus({
          type: "success",
          text: `Added new product "${created.name}" to the catalog.`,
        });
      }
      resetForm();
    } catch (err) {
      setStatus({
        type: "error",
        text: err.message || "Could not save product.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Remove "${product.name}" from the product catalog?`))
      return;
    await deleteProduct(product.slug);
    setProducts((prev) => prev.filter((p) => p.slug !== product.slug));
    if (editingSlug === product.slug) resetForm();
    setStatus({
      type: "success",
      text: `Removed "${product.name}" from the catalog.`,
    });
  };

  const filtered = products.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name?.toLowerCase().includes(q) ||
      p.kinya?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
          Catalog Management
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Products Catalog
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Add new agricultural products or edit existing ones — changes update
          the Home page and Product Details immediately.
        </p>
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
        {/* ADD / EDIT PRODUCT FORM */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-emerald-900/10 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                {editingSlug ? (
                  <Pencil className="w-4 h-4" />
                ) : (
                  <PlusCircle className="w-4 h-4" />
                )}
              </span>
              <h2 className="text-lg font-extrabold text-slate-900">
                {editingSlug ? "Edit Product" : "Add New Product"}
              </h2>
            </div>
            {editingSlug && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Name (English) *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. Cassava"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kinyarwanda Name
                </label>
                <input
                  type="text"
                  value={form.kinya}
                  onChange={(e) => handleChange("kinya", e.target.value)}
                  placeholder="e.g. Imyumbati"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ref. Price (RWF)
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.referencePrice}
                  onChange={(e) =>
                    handleChange("referencePrice", e.target.value)
                  }
                  placeholder="650"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit
                </label>
                <input
                  type="text"
                  value={form.unit}
                  onChange={(e) => handleChange("unit", e.target.value)}
                  placeholder="kg"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quality Grade
                </label>
                <input
                  type="text"
                  value={form.qualityGrade}
                  onChange={(e) => handleChange("qualityGrade", e.target.value)}
                  placeholder="e.g. Grade A Fresh"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Harvest Season
                </label>
                <input
                  type="text"
                  value={form.season}
                  onChange={(e) => handleChange("season", e.target.value)}
                  placeholder="e.g. Season A & B"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Top Producing Regions (comma-separated)
              </label>
              <input
                type="text"
                value={form.topRegions}
                onChange={(e) => handleChange("topRegions", e.target.value)}
                placeholder="e.g. Ruhango, Nyanza, Kamonyi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Image URL
              </label>
              <div className="relative">
                <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={form.image}
                  onChange={(e) => handleChange("image", e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none"
                />
              </div>
              {form.image && (
                <img
                  src={form.image}
                  alt="Preview"
                  className="mt-2.5 w-full h-28 object-cover rounded-xl border border-slate-200"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Short overview of this crop in Rwanda's markets..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Post-Harvest Storage Tip
              </label>
              <input
                type="text"
                value={form.storageTip}
                onChange={(e) => handleChange("storageTip", e.target.value)}
                placeholder="Best practice for farmers storing this crop"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-bold text-sm transition-colors cursor-pointer"
            >
              {saving
                ? "Saving Product..."
                : editingSlug
                ? "Save Product Changes"
                : "Add Product to Catalog"}
            </button>
          </form>
        </div>

        {/* EXISTING PRODUCTS GRID */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-emerald-900/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-extrabold text-slate-900">
              Active Products ({filtered.length})
            </h2>
            <div className="relative sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((product) => (
              <div
                key={product.slug}
                className={`bg-white rounded-2xl overflow-hidden border transition-all shadow-sm ${
                  editingSlug === product.slug
                    ? "border-amber-400 ring-2 ring-amber-300/50"
                    : "border-emerald-900/10"
                }`}
              >
                <div className="relative h-36">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-white/95 text-emerald-900 text-[11px] font-bold">
                    {product.category}
                  </span>
                </div>

                <div className="p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-extrabold text-slate-900 truncate">
                      {product.name}
                    </h3>
                    <span className="text-xs font-semibold text-emerald-700 shrink-0">
                      {product.kinya}
                    </span>
                  </div>
                  <p className="text-base font-extrabold text-emerald-800 mt-1">
                    {formatRwf(product.referencePrice)}
                    <span className="text-xs font-normal text-slate-400">
                      /{product.unit || "kg"}
                    </span>
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/product/${product.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-emerald-800"
                    >
                      View Page <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEdit(product)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProducts;
