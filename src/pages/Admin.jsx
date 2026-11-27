
import { useEffect, useState } from "react";

function Admin() {
  const [districts, setDistricts] = useState([]);
  const [cropName, setCropName] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Get all districts from Supabase through backend
  useEffect(() => {
    const getDistricts = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/districts"
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to load districts");
        }

        const districtList = Array.isArray(result)
          ? result
          : result.data || [];

        setDistricts(districtList);
      } catch (error) {
        setMessage("District error: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    getDistricts();
  }, []);

  // Save crop price
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!cropName.trim() || !districtId || price === "") {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "http://localhost:5000/api/prices",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            crop_name: cropName.trim(),
            district_id: Number(districtId),
            price: Number(price),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save price");
      }

      setMessage("Price saved successfully!");

      setCropName("");
      setDistrictId("");
      setPrice("");
    } catch (error) {
      setMessage("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8">

        <h1 className="text-3xl font-bold text-green-700 text-center mb-2">
          AgriPrice Admin
        </h1>

        <p className="text-gray-500 text-center mb-8">
          Add and manage agricultural market prices in Rwanda.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Crop name */}
          <div>
            <label className="block font-semibold mb-2">
              Crop Name
            </label>

            <input
              type="text"
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              placeholder="Example: Ibirayi"
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* District */}
          <div>
            <label className="block font-semibold mb-2">
              Select District
            </label>

            {loading ? (
              <p className="text-gray-500">Loading districts...</p>
            ) : districts.length === 0 ? (
              <p className="text-red-600">
                No districts found. Check your Supabase districts table.
              </p>
            ) : (
              <select
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 bg-white outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Choose a district</option>

                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.market || district.name || district.district}
                    {district.province
                      ? ` - ${district.province}`
                      : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block font-semibold mb-2">
              Price (RWF)
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price in RWF"
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving || loading || districts.length === 0}
            className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-bold p-3 rounded-lg transition"
          >
            {saving ? "Saving..." : "Save Price"}
          </button>

        </form>

        {message && (
          <p className="mt-5 text-center font-semibold text-green-700">
            {message}
          </p>
        )}

        <p className="text-sm text-gray-500 text-center mt-6">
          Total districts loaded: {districts.length}
        </p>

      </div>
    </div>
  );
}

export default Admin;
