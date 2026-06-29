import Link from "next/link";
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from "lucide-react";
import { SITES } from "@/lib/sites";

export default function Footer() {
  const kumasi = SITES.filter((s) => s.location === "Kumasi");
  const accra = SITES.filter((s) => s.location === "Accra");

  return (
    <footer className="bg-[#05014c] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-orange-400" />
              <span className="font-bold text-lg">GetOnePlot</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Ghana&apos;s trusted platform for verified land plots and property listings across Kumasi and Accra.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "#" },
                { icon: Instagram, href: "#" },
                { icon: Twitter, href: "#" },
              ].map(({ icon: Icon, href }) => (
                <a
                  key={href + Icon.name}
                  href={href}
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Kumasi sites */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Kumasi Sites</h4>
            <ul className="space-y-2">
              {kumasi.map((site) => (
                <li key={site.slug}>
                  <Link
                    href={`/sites/${site.slug}`}
                    className="text-sm text-white/60 hover:text-orange-400 transition-colors"
                  >
                    {site.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Accra sites + quick links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Accra Sites</h4>
            <ul className="space-y-2 mb-6">
              {accra.map((site) => (
                <li key={site.slug}>
                  <Link
                    href={`/sites/${site.slug}`}
                    className="text-sm text-white/60 hover:text-orange-400 transition-colors"
                  >
                    {site.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Company</h4>
            <ul className="space-y-2">
              {[
                { label: "Marketplace", href: "/marketplace" },
                { label: "Contact Us", href: "/contact" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/60 hover:text-orange-400 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Get in Touch</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-white/70">0322008282</p>
                  <p className="text-sm text-white/70">+233 54 855 4216</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                <p className="text-sm text-white/70">landandhomesconsult@gmail.com</p>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                <p className="text-sm text-white/70">Kumasi Dichemso, Ghana</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">
            © {new Date().getFullYear()} GetOnePlot. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-white/30 hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-white/30 hover:text-white/60 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
