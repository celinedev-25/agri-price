import { Link } from "react-router-dom";
import { Sprout, MapPin, Mail } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-emerald-950 text-emerald-100 border-t border-emerald-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center">
                <Sprout className="w-5 h-5" />
              </span>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Agri<span className="text-amber-400">Price</span>
              </span>
            </Link>
            <p className="text-sm text-emerald-200/80 mt-4 leading-relaxed max-w-xs">
              Empowering farmers, cooperatives, and buyers across Rwanda with
              transparent, up-to-date agricultural market prices.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/crops" className="hover:text-white transition-colors">
                  Live Crop Prices
                </Link>
              </li>
              <li>
                <Link
                  to="/prices"
                  className="hover:text-white transition-colors"
                >
                  Harvest Calculator &amp; Compare
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">
                  Admin Price Portal
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About AgriPrice
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4">
              Get in Touch
            </h3>
            <ul className="space-y-3 text-sm text-emerald-200/90">
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Kigali, Rwanda — Serving all 30 Districts</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href="mailto:info@agriprice.rw"
                  className="hover:text-white transition-colors"
                >
                  info@agriprice.rw
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-emerald-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-300/70">
          <p>© {new Date().getFullYear()} AgriPrice Rwanda. All rights reserved.</p>
          <p>Direct Supabase-powered market intelligence</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
