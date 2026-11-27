

function Prices() {
  const crops = [
    { name: "Maize (Ibigori)", price: 500 },
    { name: "Beans (Ibishyimbo)", price: 2200 },
    { name: "Rice (Umuceri)", price: 1800 },
    { name: "Cassava (Imyumbati)", price: 400 },
    { name: "Taro (Amateke)", price: 800 },
    { name: "Potatoes (Ibirayi)", price: 1100 },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-green-700 mb-6">
        Crop Market Prices
      </h1>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-green-700 text-white">
            <th className="p-3">Crop</th>
            <th className="p-3">Price per Kg (RWF)</th>
          </tr>
        </thead>

        <tbody>
          {crops.map((crop) => (
            <tr key={crop.name} className="border text-center">
              <td className="p-3">{crop.name}</td>
              <td className="p-3">{crop.price} RWF</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-4 text-gray-500">
        Note: These are sample prices, not verified market prices.
      </p>
    </div>
  );
}

export default Prices;
