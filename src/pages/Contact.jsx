import { useState } from "react";
import { Mail, MapPin, Phone, Send, CheckCircle2 } from "lucide-react";

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    const mailSubject = encodeURIComponent(
      subject.trim() || `AgriPrice Inquiry from ${name.trim()}`
    );
    const mailBody = encodeURIComponent(
      `Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`
    );
    window.location.href = `mailto:info@agriprice.rw?subject=${mailSubject}&body=${mailBody}`;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#f8faf7] py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
            Support &amp; Partnerships
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
            Contact AgriPrice
          </h1>
          <p className="text-slate-600 mt-2">
            Have a question about market data, want to report a district price,
            or partner with us? Send us a message.
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-start">
          {/* Contact Info */}
          <div className="md:col-span-5 bg-emerald-950 text-white rounded-3xl p-7 sm:p-8 shadow-lg space-y-6">
            <div>
              <h2 className="text-xl font-extrabold">Get in Touch</h2>
              <p className="text-sm text-emerald-200/85 mt-1.5 leading-relaxed">
                We support farmers, market officers, and agricultural
                cooperatives across all provinces of Rwanda.
              </p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-xs text-emerald-300 font-semibold uppercase">
                    Email
                  </p>
                  <a
                    href="mailto:info@agriprice.rw"
                    className="font-semibold hover:text-amber-300 transition-colors"
                  >
                    info@agriprice.rw
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-xs text-emerald-300 font-semibold uppercase">
                    Helpline
                  </p>
                  <p className="font-semibold">+250 788 000 000</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </span>
                <div>
                  <p className="text-xs text-emerald-300 font-semibold uppercase">
                    Location
                  </p>
                  <p className="font-semibold">Kigali, Rwanda</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-7 bg-white rounded-3xl p-7 sm:p-8 border border-emerald-900/10 shadow-sm">
            {submitted ? (
              <div className="py-10 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Message Ready in Your Mail App
                </h2>
                <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                  Your default email client has been opened with your inquiry to{" "}
                  <strong>info@agriprice.rw</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setName("");
                    setEmail("");
                    setSubject("");
                    setMessage("");
                  }}
                  className="mt-6 px-5 py-2.5 rounded-xl bg-emerald-900 text-white text-sm font-bold hover:bg-emerald-800 cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jean Claude"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Market price update or partnership"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help you?"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-sm transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
