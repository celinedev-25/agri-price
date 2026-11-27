
import { Link } from "react-router-dom";

function Home() {
  const crops = [
    {
      name: "Maize",
      kinya: "Ibigori",
      image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=500",
    },
    {
      name: "Tomatoes",
      kinya: "Inyanya",
      image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=500",
    },
    {
      name: "Potatoes",
      kinya: "Ibirayi",
      image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500",
    },
    {
      name: "Avocados",
      kinya: "Avoka",
      image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500",
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* HERO */}
      <section className="bg-green-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">

          <div>
            <p className="text-yellow-400 font-bold tracking-widest">
              🌱 AGRIPRICE RWANDA
            </p>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mt-5">
              Welcome to
              <span className="text-yellow-400"> AgriPrice</span>
            </h1>

            <p className="text-green-100 text-lg mt-6 mb-8">
              Discover different agricultural crops and market prices
              in Rwanda. Grow more, learn more and make better decisions.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/crops"
                className="bg-yellow-400 text-green-950 px-7 py-3 rounded-lg font-bold hover:bg-yellow-300"
              >
                Explore Crops →
              </Link>

              <Link
                to="/prices"
                className="border-2 border-white px-7 py-3 rounded-lg font-bold hover:bg-white hover:text-green-900"
              >
                View Prices
              </Link>
            </div>
          </div>

          <div>
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=85"
              alt="Different fresh agricultural crops and vegetables"
              className="w-full h-[420px] object-cover rounded-3xl shadow-2xl"
            />
          </div>

        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="text-center py-14 px-6">
        <h2 className="text-3xl font-bold text-green-800 mb-4">
          Discover Our Agricultural Products
        </h2>

        <p className="text-gray-600 max-w-3xl mx-auto">
          Explore different crops and discover available agricultural
          price information through AgriPrice.
        </p>
      </section>

      {/* CROPS GALLERY */}
      <section className="max-w-7xl mx-auto px-6 pb-16">

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-green-800">
            Popular Crops 🌽
          </h2>

          <Link
            to="/crops"
            className="text-green-700 font-bold hover:underline"
          >
            See All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {crops.map((crop) => (
            <div
              key={crop.name}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition"
            >
              <img
                src={crop.image}
                alt={crop.name}
                className="w-full h-52 object-cover"
              />

              <div className="p-5 text-center">
                <h3 className="text-xl font-bold text-green-800">
                  {crop.name}
                </h3>
                <p className="text-gray-500">{crop.kinya}</p>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* SERVICES */}
      <section className="bg-green-50 py-16 px-6">
        <h2 className="text-3xl font-bold text-green-800 text-center mb-10">
          Our Services
        </h2>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">

          <div className="bg-white p-8 rounded-2xl shadow text-center">
            <div className="text-5xl mb-4">🌾</div>
            <h3 className="font-bold text-xl text-green-800 mb-3">
              Crop Information
            </h3>
            <p className="text-gray-600 mb-5">
              Learn about different agricultural products.
            </p>
            <Link to="/crops" className="text-green-700 font-bold">
              Explore →
            </Link>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow text-center">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="font-bold text-xl text-green-800 mb-3">
              Market Prices
            </h3>
            <p className="text-gray-600 mb-5">
              Check available crop market price information.
            </p>
            <Link to="/prices" className="text-green-700 font-bold">
              View Prices →
            </Link>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow text-center">
            <div className="text-5xl mb-4">🧮</div>
            <h3 className="font-bold text-xl text-green-800 mb-3">
              Price Calculator
            </h3>
            <p className="text-gray-600 mb-5">
              Estimate the value of your harvest.
            </p>
            <Link to="/prices" className="text-green-700 font-bold">
              Calculate →
            </Link>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-green-950 text-white text-center py-8">
        <h2 className="text-2xl font-bold text-yellow-400">
          AgriPrice 🌱
        </h2>
        <p className="text-green-100 mt-2">
          Supporting Farmers and Agriculture in Rwanda.
        </p>
        <p className="text-gray-400 text-sm mt-4">
          © 2026 AgriPrice. All Rights Reserved.
        </p>
      </footer>

    </div>
  );
}

export default Home;
