import { Phone, Mail, MapPin, Clock } from "lucide-react";
import ContactForm from "./_components/ContactForm";

export const metadata = {
  title: "Contact Us — GetOnePlot",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[#05014c] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-2">Get in Touch</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">We&apos;re here to help</h1>
          <p className="text-white/60">
            Have questions about a plot or site? Reach out and our team will respond promptly.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-14">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Info */}
          <div className="lg:col-span-2 space-y-4">
            {[
              {
                icon: Phone,
                title: "Phone",
                lines: ["0322008282", "+233 54 855 4216"],
              },
              {
                icon: Mail,
                title: "Email",
                lines: ["landandhomesconsult@gmail.com"],
              },
              {
                icon: MapPin,
                title: "Office",
                lines: ["Kumasi Dichemso", "Ghana"],
              },
              {
                icon: Clock,
                title: "Hours",
                lines: ["Mon – Fri: 8am – 6pm", "Sat: 9am – 4pm"],
              },
            ].map(({ icon: Icon, title, lines }) => (
              <div key={title} className="bg-white rounded-2xl border p-5 flex items-start gap-4">
                <div className="w-9 h-9 bg-[#05014c]/5 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-[#05014c]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
                  {lines.map((l) => (
                    <p key={l} className="text-sm text-gray-700">{l}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl border p-6 sm:p-8">
            <h2 className="font-semibold text-gray-900 text-lg mb-6">Send us a message</h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
