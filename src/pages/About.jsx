import { Link } from "react-router-dom";
import { Sprout, Target, Users, TrendingUp, ArrowRight } from "lucide-react";

function About() {
  const pillars = [
    {
      icon: TrendingUp,
      title: "Transparent Pricing",
      description:
        "Clear, district-level crop prices updated directly so farmers know the true market value before negotiating.",
    },
    {
      icon: Users,
      title: "Built for Farmers & Cooperatives",
      description:
        "Designed to be fast and readable on mobile devices across rural and urban markets in Rwanda.",
    },
    {
      icon: Target,
      title: "Smarter Selling Decisions",
      description:
        "Compare markets side-by-side and estimate harvest earnings to choose the best time and place to sell.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8faf7] py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Intro Card */}
        <section className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white rounded-3xl p-8 sm:p-12 shadow-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold uppercase tracking-wider mb-5">
            <Sprout className="w-3.5 h-3.5" />
            Our Mission
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Connecting Rwanda&apos;s Farmers to Fair Market Intelligence
          </h1>
          <p className="text-emerald-100/90 text-base sm:text-lg mt-5 max-w-2xl leading-relaxed">
            AgriPrice is an agricultural market information platform built to
            help farmers, cooperatives, and buyers discover live crop prices,
            compare districts, and plan harvests with confidence.
          </p>
        </section>

        {/* Pillars */}
        <section className="grid md:grid-cols-3 gap-6 mt-10">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bg-white rounded-2xl p-6 border border-emerald-900/10 shadow-sm"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {pillar.title}
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </section>

        {/* Vision CTA */}
        <section className="mt-10 bg-white rounded-3xl p-8 sm:p-10 border border-emerald-900/10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
              Our Vision
            </p>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
              Empowering Every Farmer With Equal Market Access
            </h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              When price information is open and timely, farmers earn fairer
              returns, buyers plan better supply chains, and local agriculture
              thrives.
            </p>
          </div>
          <Link
            to="/crops"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-900 text-white font-bold text-sm hover:bg-emerald-800 transition-colors shrink-0"
          >
            Explore Live Prices
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}

export default About;
