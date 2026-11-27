import supabase, { isSupabaseConfigured } from "../supabase.js";
import { POPULAR_CROPS, slugifyCrop } from "../data/featuredCrops.js";

const STORAGE_KEY = "agriprice_products_v1";

function readLocalProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(POPULAR_CROPS));
      return POPULAR_CROPS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : POPULAR_CROPS;
  } catch {
    return POPULAR_CROPS;
  }
}

function writeLocalProducts(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage quota errors
  }
}

export function getProductsSync() {
  return readLocalProducts();
}

export async function fetchProducts() {
  const local = readLocalProducts();
  if (!isSupabaseConfigured || !supabase) return local;

  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return local;
    }

    const normalized = data.map((row) => ({
      id: row.id,
      slug: row.slug || slugifyCrop(row.name),
      name: row.name,
      kinya: row.kinya || "",
      category: row.category || "Crops",
      unit: row.unit || "kg",
      referencePrice: Number(row.reference_price ?? row.referencePrice ?? 0),
      season: row.season || "Year-round",
      topRegions: Array.isArray(row.top_regions)
        ? row.top_regions
        : typeof row.top_regions === "string"
        ? row.top_regions
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      qualityGrade: row.quality_grade || "Standard Grade",
      image:
        row.image ||
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&auto=format&fit=crop&q=85",
      description: row.description || "",
      storageTip: row.storage_tip || "",
    }));

    writeLocalProducts(normalized);
    return normalized;
  } catch {
    return local;
  }
}

export async function createProduct(productInput) {
  const slug =
    productInput.slug?.trim() || slugifyCrop(productInput.name || "product");
  const topRegions = Array.isArray(productInput.topRegions)
    ? productInput.topRegions
    : String(productInput.topRegions || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  const newProduct = {
    id: `prod_${Date.now()}`,
    slug,
    name: productInput.name.trim(),
    kinya: (productInput.kinya || "").trim(),
    category: productInput.category || "Vegetables",
    unit: (productInput.unit || "kg").trim(),
    referencePrice: Number(productInput.referencePrice || 0),
    season: (productInput.season || "Year-round").trim(),
    topRegions,
    qualityGrade: (productInput.qualityGrade || "Grade A").trim(),
    image:
      (productInput.image || "").trim() ||
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&auto=format&fit=crop&q=85",
    description: (productInput.description || "").trim(),
    storageTip: (productInput.storageTip || "").trim(),
  };

  // Try persisting to Supabase `products` table if available
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            slug: newProduct.slug,
            name: newProduct.name,
            kinya: newProduct.kinya,
            category: newProduct.category,
            unit: newProduct.unit,
            reference_price: newProduct.referencePrice,
            season: newProduct.season,
            top_regions: newProduct.topRegions,
            quality_grade: newProduct.qualityGrade,
            image: newProduct.image,
            description: newProduct.description,
            storage_tip: newProduct.storageTip,
          },
        ])
        .select()
        .single();

      if (!error && data?.id) {
        newProduct.id = data.id;
      }
    } catch {
      // Fall back cleanly to local persistence
    }
  }

  const current = readLocalProducts();
  const deduped = current.filter((p) => p.slug !== newProduct.slug);
  const updated = [newProduct, ...deduped];
  writeLocalProducts(updated);
  return newProduct;
}

export async function updateProduct(targetSlug, updates) {
  const topRegions = Array.isArray(updates.topRegions)
    ? updates.topRegions
    : String(updates.topRegions || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  const current = readLocalProducts();
  const existing = current.find(
    (p) => p.slug === targetSlug || String(p.id) === String(targetSlug)
  );

  const merged = {
    ...(existing || {}),
    slug: updates.slug?.trim() || existing?.slug || slugifyCrop(updates.name),
    name: updates.name.trim(),
    kinya: (updates.kinya || "").trim(),
    category: updates.category || existing?.category || "Vegetables",
    unit: (updates.unit || "kg").trim(),
    referencePrice: Number(updates.referencePrice || 0),
    season: (updates.season || "Year-round").trim(),
    topRegions,
    qualityGrade: (updates.qualityGrade || "Grade A").trim(),
    image:
      (updates.image || "").trim() ||
      existing?.image ||
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&auto=format&fit=crop&q=85",
    description: (updates.description || "").trim(),
    storageTip: (updates.storageTip || "").trim(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from("products")
        .update({
          slug: merged.slug,
          name: merged.name,
          kinya: merged.kinya,
          category: merged.category,
          unit: merged.unit,
          reference_price: merged.referencePrice,
          season: merged.season,
          top_regions: merged.topRegions,
          quality_grade: merged.qualityGrade,
          image: merged.image,
          description: merged.description,
          storage_tip: merged.storageTip,
        })
        .eq("slug", targetSlug);
    } catch {
      // Ignore if table doesn't exist yet
    }
  }

  const nextList = current.map((p) => (p.slug === targetSlug ? merged : p));
  writeLocalProducts(nextList);
  return merged;
}

export async function deleteProduct(targetSlug) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("products").delete().eq("slug", targetSlug);
    } catch {
      // Ignore if table doesn't exist yet
    }
  }

  const current = readLocalProducts();
  const nextList = current.filter((p) => p.slug !== targetSlug);
  writeLocalProducts(nextList);
  return true;
}

export function findProductBySlugOrName(slugOrName = "", productsList = null) {
  const list = productsList || readLocalProducts();
  const needle = slugOrName.trim().toLowerCase();
  if (!needle) return null;

  return (
    list.find(
      (c) =>
        c.slug?.toLowerCase() === needle ||
        c.name?.toLowerCase() === needle ||
        c.kinya?.toLowerCase() === needle ||
        needle.includes(c.slug?.toLowerCase()) ||
        needle.includes(c.name?.toLowerCase()) ||
        (c.kinya && needle.includes(c.kinya.toLowerCase()))
    ) || null
  );
}
