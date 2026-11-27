
function Contact() {
  return (
    <section className="min-h-screen bg-green-50 flex items-center justify-center px-6">

      <div className="bg-white p-10 rounded-2xl shadow-lg max-w-xl w-full text-center">

        <h1 className="text-4xl font-bold text-green-900 mb-5">
          Contact Us
        </h1>

        <p className="text-gray-600 mb-6">
          We are ready to help farmers.
          Contact us for more information.
        </p>

        <a
          href="mailto:info@agriprice.com"
          className="inline-block bg-green-700 text-white px-8 py-3 rounded-lg hover:bg-green-900"
        >
          Send Email
        </a>

      </div>
    </section>
  );
}

export default Contact;
