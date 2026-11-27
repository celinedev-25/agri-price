import supabase, { isSupabaseConfigured } from "../supabase.js";

const NOT_CONFIGURED_MSG =
  "Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local file.";

function assertConfigured() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(NOT_CONFIGURED_MSG);
  }
}

export async function fetchDistricts() {
  assertConfigured();
  const { data, error } = await supabase
    .from("districts")
    .select("*")
    .order("id", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchMarketPrices() {
  assertConfigured();
  const { data, error } = await supabase
    .from("market_price")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchMarketData() {
  assertConfigured();
  const [prices, districts] = await Promise.all([
    fetchMarketPrices(),
    fetchDistricts(),
  ]);
  return { prices, districts };
}

export async function addMarketPrice({ crop_name, district_id, price }) {
  assertConfigured();
  const { data, error } = await supabase
    .from("market_price")
    .insert([
      {
        crop_name: crop_name.trim(),
        district_id: Number(district_id),
        price: Number(price),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMarketPrice(id, { crop_name, district_id, price }) {
  assertConfigured();
  const { data, error } = await supabase
    .from("market_price")
    .update({
      crop_name: crop_name.trim(),
      district_id: Number(district_id),
      price: Number(price),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMarketPrice(id) {
  assertConfigured();
  const { error } = await supabase.from("market_price").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export function getDistrictName(districts, districtId) {
  const district = districts.find((d) => String(d.id) === String(districtId));
  if (!district) return "Unknown district";
  return district.market || district.name || `District #${district.id}`;
}

export function getDistrictProvince(districts, districtId) {
  const district = districts.find((d) => String(d.id) === String(districtId));
  return district?.province || "";
}

/**
 * Groups market_price records by (crop_name, district_id) and returns
 * the latest entry for each pair along with trend direction, delta, percent change,
 * and full chronological history.
 */
export function groupLatestPrices(prices) {
  const groups = new Map();

  for (const item of prices) {
    const key = `${(item.crop_name || "").trim().toLowerCase()}::${String(
      item.district_id
    )}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(item);
  }

  const latestList = [];

  for (const entries of groups.values()) {
    const sorted = [...entries].sort(
      (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
    );
    const current = sorted[0];
    const previous = sorted[1] || null;

    let trend = "new";
    let diff = 0;
    let percentChange = null;

    if (previous) {
      diff = Number(current.price) - Number(previous.price);
      if (diff > 0) trend = "up";
      else if (diff < 0) trend = "down";
      else trend = "same";

      if (Number(previous.price) > 0) {
        percentChange = (diff / Number(previous.price)) * 100;
      }
    }

    latestList.push({
      ...current,
      previousPrice: previous ? Number(previous.price) : null,
      trend,
      diff,
      percentChange,
      history: sorted,
    });
  }

  return latestList.sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  );
}

export function formatRwf(amount) {
  return `${Number(amount || 0).toLocaleString("en-RW")} RWF`;
}

export function formatRelativeDate(dateStr) {
  if (!dateStr) return "Date unavailable";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-RW", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
