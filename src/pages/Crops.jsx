
import { useEffect, useState } from "react";

function Crops() {
  const [prices, setPrices] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [priceResponse, districtResponse] = await Promise.all([
          fetch("http://localhost:5000/api/prices"),
          fetch("http://localhost:5000/api/districts")
        ]);

        const priceResult = await priceResponse.json();
        const districtResult = await districtResponse.json();

        if (!priceResponse.ok) {
          throw new Error("Failed to load prices");
        }

        if (!districtResponse.ok) {
          throw new Error("Failed to load districts");
        }

        setPrices(priceResult.data || []);
        setDistricts(districtResult.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Find the district name using district_id
  const getDistrictName = (id) => {
    const district = districts.find(
      (item) => String(item.id) === String(id)
    );

    return district?.market || district?.name || "Unknown district";
  };

  // Compare each price with the previous price for the same crop and district
  const getPriceChange = (current) => {
    const history = prices
      .filter(
        (item) =>
          item.crop_name.toLowerCase() === current.crop_name.toLowerCase() &&
          String(item.district_id) === String(current.district_id)
      )
      .sort(
        (a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
      );

    const currentIndex = history.findIndex(
      (item) => String(item.id) === String(current.id)
    );

    const previous = history[currentIndex + 1];

    if (!previous) return null;

    const difference = Number(current.price) - Number(previous.price);

    if (difference > 0) return "up";
    if (difference < 0) return "down";

    return "same";
  };

  const filteredPrices = prices
    .filter((item) => {
      const matchesSearch = item.crop_name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesDistrict =
        selectedDistrict === "" ||
        String(item.district_id) === selectedDistrict;

      return matchesSearch && matchesDistrict;
    })
    .sort(
      (a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
    );

  if (loading) {
    return (
      <div className="text-center py-20 text-xl">
        Loading crop prices...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-green-700">
            Rwanda Crop Prices
          </h1>

          <p className="text-gray-600 mt-3">
            Check agricultural prices in different districts of Rwanda.
          </p>
        </div>

        {/* Search and district filter */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">

          <input
            type="text"
            placeholder="Search crop..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 border rounded-lg bg-white"
          />

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full p-3 border rounded-lg bg-white"
          >
            <option value="">All districts</option>

            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.market || district.name}
              </option>
            ))}
          </select>

        </div>

        {error && (
          <p className="text-red-600 text-center mb-5">{error}</p>
        )}

        {/* Prices */}
        {filteredPrices.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center shadow">
            <h2 className="text-xl font-semibold text-gray-700">
              No crop prices found
            </h2>
            <p className="text-gray-500 mt-2">
              Add prices from the Admin page first.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {filteredPrices.map((item) => {
              const change = getPriceChange(item);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-600"
                >
                  <h2 className="text-2xl font-bold text-gray-800">
                    {item.crop_name}
                  </h2>

                  <p className="text-gray-500 mt-2">
                    📍 {getDistrictName(item.district_id)}
                  </p>

                  <p className="text-3xl font-bold text-green-700 mt-5">
                    {Number(item.price).toLocaleString()} RWF
                  </p>

                  <div className="mt-4">
                    {change === "up" && (
                      <span className="text-red-600 font-semibold">
                        ↑ Price increased
                      </span>
                    )}

                    {change === "down" && (
                      <span className="text-green-700 font-semibold">
                        ↓ Price decreased
                      </span>
                    )}

                    {change === "same" && (
                      <span className="text-gray-500 font-semibold">
                        = No price change
                      </span>
                    )}

                    {!change && (
                      <span className="text-gray-500">
                        No previous price for comparison
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400 mt-4">
                    Updated: {item.created_at
                      ? new Date(item.created_at).toLocaleString()
                      : "Date unavailable"}
                  </p>
                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}

export default Crops;
