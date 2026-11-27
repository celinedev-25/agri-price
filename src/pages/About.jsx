
function About() {
  return (
    <section className="min-h-screen bg-green-50 flex items-center justify-center px-6">
      <div className="max-w-3xl bg-white p-10 rounded-2xl shadow-lg text-center">

        <h1 className="text-4xl font-bold text-green-900 mb-6">
          About AgriPrice
        </h1>

        <p className="text-gray-600 text-lg leading-8">
          AgriPrice is an agricultural market information
          platform designed to help farmers discover crop
          prices, compare markets and make better selling
          decisions.
        </p>

        <h2 className="text-2xl font-bold text-green-800 mt-8 mb-3">
          Our Vision
        </h2>

        <p className="text-gray-600">
          To connect every farmer with better market opportunities.
        </p>

      </div>
    </section>
  );
}

export default About;
