import { BrowserRouter, Routes, Route, Link, Outlet } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import AdminLayout from "./components/admin/AdminLayout.jsx";

import Home from "./pages/Home.jsx";
import Crops from "./pages/Crops.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Prices from "./pages/Prices.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";

import AdminOverview from "./pages/admin/AdminOverview.jsx";
import AdminPrices from "./pages/admin/AdminPrices.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminTeam from "./pages/admin/AdminTeam.jsx";

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf7]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-16">
      <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
        404 Error
      </p>
      <h1 className="text-4xl font-extrabold text-slate-900 mt-2">
        Page Not Found
      </h1>
      <p className="text-slate-600 mt-3 max-w-md">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 rounded-xl bg-emerald-900 text-white text-sm font-bold hover:bg-emerald-800 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public & User Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/crops" element={<Crops />} />
            <Route path="/product/:slug" element={<ProductDetails />} />
            <Route path="/prices" element={<Prices />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Nested Admin Workspace with Sidebar + Outlet */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="prices" element={<AdminPrices />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="team" element={<AdminTeam />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
