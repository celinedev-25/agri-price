import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Calculator,
  MapPin,
  Sprout,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  CheckCircle2,
  ChevronDown,
  Calendar,
} from "lucide-react";
import { isSupabaseConfigured } from "../supabase.js";
import {
  fetchMarketData,
  groupLatestPrices,
  getDistrictName,
  formatRwf,
  formatRelativeDate,
} from "../services/marketService.js";
import { slugifyCrop } from "../data/featuredCrops.js";
import { fetchProducts, getProductsSync } from "../services/productService.js";

function Home() {
  const [livePrices, setLivePrices] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [products, setProducts] = useState(() => getProductsSync());
  const [loadingLive, setLoadingLive] = useState(isSupabaseConfigured);

  useEffect(() => {
    let active = true;
    fetchProducts().then((list) => {
      if (active) setProducts(list);
    });

    if (!isSupabaseConfigured) return () => { active = false; };

    fetchMarketData()
      .then(({ prices, districts: dists }) => {
        if (!active) return;
        setLivePrices(groupLatestPrices(prices));
        setDistricts(dists);
      })
      .catch(() => {
        // Gracefully degrade on Home
      })
      .finally(() => {
        if (active) setLoadingLive(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const uniqueCropsCount = new Set(
    livePrices.map((p) => (p.crop_name || "").trim().toLowerCase())
  ).size;

  const latestFeatured = livePrices.slice(0, 4);

  const getCropLivePrice = (crop) => {
    const matches = livePrices.filter((item) => {
      const name = (item.crop_name || "").toLowerCase();
      return (
        name.includes(crop.name.toLowerCase()) ||
        name.includes(crop.kinya.toLowerCase()) ||
        name.includes(crop.slug)
      );
    });
    if (matches.length === 0) return { price: crop.referencePrice, isLive: false };
    const avg = Math.round(
      matches.reduce((sum, m) => sum + Number(m.price || 0), 0) / matches.length
    );
    return { price: avg, isLive: true, count: matches.length };
  };

  return (
    <div className="bg-[#f8faf7]">
      {/* FULL-SCREEN HERO (fills viewport height below 64px sticky navbar) */}
      <section className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white">
        {/* Subtle decorative background accents */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

        <div className="relative flex-1 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-700/80 text-amber-300 text-xs font-bold uppercase tracking-wider mb-6">
                <Sprout className="w-3.5 h-3.5" />
                AgriPrice Rwanda • Live Agricultural Markets
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.06]">
                Smarter Harvests Start With{" "}
                <span className="text-amber-400">Real Market Prices</span>
              </h1>

              <p className="text-emerald-100/90 text-lg sm:text-xl mt-6 max-w-2xl leading-relaxed">
                Track crop prices across districts in Rwanda, compare regional
                markets, and estimate your harvest earnings before you sell.
              </p>

              <div className="flex flex-wrap gap-4 mt-8">
                <Link
                  to="/crops"
                  className="inline-flex items-center gap-2 bg-amber-400 text-emerald-950 px-7 py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-950/30 hover:bg-amber-300 transition-all"
                >
                  Explore Live Prices
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/prices"
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/25 text-white px-7 py-3.5 rounded-xl font-bold hover:bg-white hover:text-emerald-950 transition-all"
                >
                  <Calculator className="w-4 h-4" />
                  Harvest Calculator
                </Link>
              </div>

              {/* Trust highlights */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-8 text-sm text-emerald-200">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  District-level RWF pricing
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  Price trend history
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  Instant harvest estimator
                </span>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=85"
                  alt="Fresh agricultural crops and vegetables at a market"
                  className="w-full h-[320px] sm:h-[400px] lg:h-[460px] object-cover rounded-3xl shadow-2xl border border-white/15"
                />
                {/* Floating Market Coverage Card */}
                <div className="absolute -bottom-5 left-4 right-4 sm:left-6 sm:right-6 bg-white/95 backdrop-blur-md text-slate-900 rounded-2xl p-4 shadow-xl border border-emerald-900/10 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                      Market Coverage
                    </p>
                    <p className="text-base sm:text-lg font-extrabold text-slate-900">
                      {loadingLive
                        ? "Syncing markets..."
                        : districts.length > 0
                        ? `${districts.length} Districts • ${uniqueCropsCount} Crops`
                        : "30 Districts • Rwanda Markets"}
                    </p>
                  </div>
                  <Link
                    to="/crops"
                    className="shrink-0 px-3.5 py-2 rounded-xl bg-emerald-900 text-white text-xs font-bold hover:bg-emerald-800 transition-colors"
                  >
                    View Board
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Scroll Indicator */}
        <div className="relative pb-5 flex justify-center">
          <a
            href="#products"
            className="inline-flex flex-col items-center gap-1 text-xs font-semibold text-emerald-200/80 hover:text-amber-300 transition-colors"
          >
            <span>Explore Products</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </a>
        </div>
      </section>

      {/* LIVE SNAPSHOT (shown when Supabase has live entries) */}
      {latestFeatured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                Real-Time Feed
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Latest Market Updates
              </h2>
            </div>
            <Link
              to="/crops"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-800 hover:text-emerald-600"
            >
              View all {livePrices.length} listings
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {latestFeatured.map((item) => (
              <Link
                key={item.id}
                to={`/product/${slugifyCrop(item.crop_name)}`}
                className="group bg-white rounded-2xl p-5 border border-emerald-900/10 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {item.crop_name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      {getDistrictName(districts, item.district_id)}
                    </p>
                  </div>
                  {item.trend === "up" && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-rose-50 text-rose-700">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Up
                    </span>
                  )}
                  {item.trend === "down" && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
                      <TrendingDown className="w-3.5 h-3.5" />
                      Down
                    </span>
                  )}
                  {(item.trend === "same" || item.trend === "new") && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                      <Minus className="w-3.5 h-3.5" />
                      {item.trend === "new" ? "New" : "Steady"}
                    </span>
                  )}
                </div>

                <p className="text-2xl font-extrabold text-emerald-800 mt-4">
                  {formatRwf(item.price)}
                  <span className="text-xs font-medium text-slate-400">
                    {" "}
                    / kg
                  </span>
                </p>

                <p className="text-xs text-slate-400 flex items-center gap-1 mt-3">
                  <Clock className="w-3.5 h-3.5" />
                  {formatRelativeDate(item.created_at)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FEATURED AGRICULTURAL PRODUCTS */}
      <section
        id="products"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Featured Agricultural Products
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
              Popular Rwanda Crops
            </h2>
            <p className="text-slate-600 mt-2 max-w-xl text-sm sm:text-base">
              Click any product to view district prices, seasonal insights,
              storage tips, and estimate your harvest value.
            </p>
          </div>

          <Link
            to="/crops"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-800 hover:text-emerald-600 shrink-0"
          >
            Browse all live prices
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {products.map((crop) => {
            const { price, isLive } = getCropLivePrice(crop);

            return (
              <article
                key={crop.slug}
                className="group bg-white rounded-3xl overflow-hidden border border-emerald-900/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Product Image Header */}
                <Link
                  to={`/product/${crop.slug}`}
                  className="relative h-56 overflow-hidden block"
                >
                  <img
                    src={crop.image}
                    alt={`${crop.name} (${crop.kinya})`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/75 via-emerald-950/15 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-emerald-900 text-xs font-bold shadow-sm">
                      {crop.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 backdrop-blur-sm text-amber-300 text-[11px] font-bold">
                      {isLive ? "Live Market" : crop.qualityGrade}
                    </span>
                  </div>

                  {/* Price Pill Overlaid at Bottom Left */}
                  <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-end justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-emerald-200 font-semibold">
                        {isLive ? "Avg Market Price" : "Reference Price"}
                      </p>
                      <p className="text-xl font-extrabold text-white">
                        {formatRwf(price)}
                        <span className="text-xs font-medium text-emerald-200">
                          {" "}
                          / {crop.unit}
                        </span>
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <Link to={`/product/${crop.slug}`}>
                        <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors">
                          {crop.name}
                        </h3>
                      </Link>
                      <span className="text-sm font-semibold text-emerald-700">
                        {crop.kinya}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                      {crop.description}
                    </p>

                    <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">
                          Top markets: {crop.topRegions.slice(0, 3).join(", ")}
                        </span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{crop.season}</span>
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <Link
                      to={`/product/${crop.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-900 hover:text-emerald-700 transition-colors"
                    >
                      View Product Details
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    <Link
                      to={`/prices?crop=${encodeURIComponent(crop.name)}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-900 hover:text-white transition-colors"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      Estimate
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-emerald-900/5 border-y border-emerald-900/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Built for Farmers &amp; Buyers
            </p>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              Everything You Need to Price Fairly
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-7 rounded-2xl border border-emerald-900/10 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-5">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-2">
                Live Crop Prices
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-5">
                Search updated crop prices by district and track whether prices
                are rising, falling, or holding steady over time.
              </p>
              <Link
                to="/crops"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-800 hover:text-emerald-600"
              >
                Explore Prices <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-emerald-900/10 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-2">
                District Comparison
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-5">
                Compare prices for the same crop across different markets to
                spot the best selling or buying opportunity.
              </p>
              <Link
                to="/prices"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-800 hover:text-emerald-600"
              >
                Compare Markets <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-emerald-900/10 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-5">
                <Calculator className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-2">
                Harvest Value Calculator
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-5">
                Enter your harvest weight in kilograms and instantly calculate
                expected revenue using live district market prices.
              </p>
              <Link
                to="/prices"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-800 hover:text-emerald-600"
              >
                Calculate Value <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
