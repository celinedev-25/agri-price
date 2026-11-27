export const POPULAR_CROPS = [
  {
    slug: "maize",
    name: "Maize",
    kinya: "Ibigori",
    category: "Grains",
    unit: "kg",
    referencePrice: 520,
    season: "Season A & B (Feb–Mar, Jul–Aug)",
    topRegions: ["Nyagatare", "Gatsibo", "Kirehe", "Bugesera"],
    qualityGrade: "Dry Grain (Grade A)",
    image:
      "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=900&auto=format&fit=crop&q=85",
    description:
      "Maize (Ibigori) is one of Rwanda's primary staple cereal crops, widely traded across rural collection centers and Kigali wholesale markets for flour milling and animal feed.",
    storageTip:
      "Dry to below 13.5% moisture and store in hermetic bags off the ground to prevent aflatoxin and weevils.",
  },
  {
    slug: "potatoes",
    name: "Irish Potatoes",
    kinya: "Ibirayi",
    category: "Tubers",
    unit: "kg",
    referencePrice: 1050,
    season: "Year-round (Peak: Jan–Feb, Jun–Jul)",
    topRegions: ["Musanze", "Nyabihu", "Rubavu", "Burera"],
    qualityGrade: "Kinigi / Kirundo",
    image:
      "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=900&auto=format&fit=crop&q=85",
    description:
      "Grown predominantly in the volcanic soils of Northern and Western Rwanda, Irish potatoes (Ibirayi) have strong daily demand in Kigali and regional urban markets.",
    storageTip:
      "Cure freshly harvested tubers for 7–10 days in a cool, dark, well-ventilated store before bagging for transport.",
  },
  {
    slug: "tomatoes",
    name: "Tomatoes",
    kinya: "Inyanya",
    category: "Vegetables",
    unit: "kg",
    referencePrice: 900,
    season: "Year-round (Irrigated & Rain-fed)",
    topRegions: ["Bugesera", "Rwamagana", "Kamonyi", "Ngoma"],
    qualityGrade: "Fresh Firm Red",
    image:
      "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=900&auto=format&fit=crop&q=85",
    description:
      "Fresh tomatoes (Inyanya) are among the fastest-moving horticultural crops in Rwanda. Prices fluctuate weekly based on rainfall and regional supply.",
    storageTip:
      "Harvest at breaker-to-pink stage and pack in ventilated plastic crates rather than sacks to reduce bruising.",
  },
  {
    slug: "avocados",
    name: "Avocados",
    kinya: "Avoka",
    category: "Fruits",
    unit: "kg",
    referencePrice: 1400,
    season: "Mar–Jun & Sep–Nov",
    topRegions: ["Rwamagana", "Muhanga", "Huye", "Nyanza"],
    qualityGrade: "Hass & Fuerte",
    image:
      "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=900&auto=format&fit=crop&q=85",
    description:
      "Rwandan avocados (Avoka) — especially Hass and Fuerte varieties — enjoy growing domestic demand and strong export pricing through certified aggregators.",
    storageTip:
      "Clip fruit with a short stem attached and keep shaded after picking to maximize shelf life and export quality.",
  },
  {
    slug: "beans",
    name: "Beans",
    kinya: "Ibishyimbo",
    category: "Legumes",
    unit: "kg",
    referencePrice: 1850,
    season: "Season A & B (Jan, Jun)",
    topRegions: ["Huye", "Gicumbi", "Kayonza", "Rulindo"],
    qualityGrade: "Dry High-Iron Beans",
    image:
      "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=900&auto=format&fit=crop&q=85",
    description:
      "High-iron climbing and bush beans (Ibishyimbo) are an essential protein staple across Rwanda with resilient market demand throughout the year.",
    storageTip:
      "Clean and sort out damaged grains before storing in airtight PICS bags to preserve germination and cooking quality.",
  },
  {
    slug: "rice",
    name: "Rice",
    kinya: "Umuceri",
    category: "Grains",
    unit: "kg",
    referencePrice: 1750,
    season: "Jun–Jul & Dec–Jan",
    topRegions: ["Bugesera", "Gisagara", "Rusizi", "Nyagatare"],
    qualityGrade: "Long Grain Milled",
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=900&auto=format&fit=crop&q=85",
    description:
      "Locally cultivated marshland rice (Umuceri) from cooperatives in Eastern, Southern, and Western provinces is prized for its aroma and consistent grading.",
    storageTip:
      "Store milled rice in clean, dry woven sacks on pallets away from direct moisture to retain grain integrity.",
  },
];

export const COMMON_CROP_SUGGESTIONS = [
  "Maize (Ibigori)",
  "Irish Potatoes (Ibirayi)",
  "Beans (Ibishyimbo)",
  "Rice (Umuceri)",
  "Tomatoes (Inyanya)",
  "Cassava (Imyumbati)",
  "Avocados (Avoka)",
  "Bananas (Ibitoki)",
  "Sorghum (Amasaka)",
  "Carrots (Karoti)",
  "Onions (Ibitunguru)",
  "Cabbage (Amashu)",
];

export function slugifyCrop(name = "") {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function findCropMeta(slugOrName = "") {
  const needle = slugOrName.trim().toLowerCase();
  if (!needle) return null;

  return (
    POPULAR_CROPS.find(
      (c) =>
        c.slug === needle ||
        c.name.toLowerCase() === needle ||
        c.kinya.toLowerCase() === needle ||
        needle.includes(c.slug) ||
        needle.includes(c.name.toLowerCase()) ||
        needle.includes(c.kinya.toLowerCase())
    ) || null
  );
}
