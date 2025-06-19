"use client";
import { supabase } from "@/utils/supabase/client";
import {
  Building2,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";

const Footer = () => {
  const [email, setEmail] = useState("");

  const subscribeNewsletter = async (e) => {
    e.preventDefault();
    if (email === "") {
      return toast.error("Enter your email");
    }
    const emailRegexPattern =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    const validateEmail = (email) => {
      return emailRegexPattern.test(email);
    };

    if (!validateEmail(email)) {
      return toast.error("Please enter a valid email");
    }
    setEmail("");

    try {
      const { data, error } = await supabase
        .from("news_letter_mails")
        .insert({ email: email })
        .select();
      if (data) {
        toast.success("Thank you for subscribing to our News letter");
        setEmail("");
      }
      if (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error occured \n Try again later");
    }
  };

  return (
    <footer className="w-full bg-gradient-to-br from-primary to-blue-900 text-white/90 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-wrap gap-8 md:gap-3 border-b border-white/10 pb-8">
          {/* Company Info */}
          <div className="flex-1 min-w-[220px] mb-6 md:mb-0">
            <Link
              href="/"
              className="flex items-center gap-x-2 mb-2"
              aria-label="Go to homepage"
            >
              <Building2 className="text-3xl text-white" />
              <span className="font-bold text-xl tracking-wide">
                GETONEPLOT
              </span>
            </Link>
            <p className="text-sm text-white/70 mt-2 max-w-xs">
              Your trusted partner for land registration, management, and
              property development. Secure your future, one plot at a time.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener"
                aria-label="Instagram"
                className="hover:text-pink-400 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener"
                aria-label="Twitter"
                className="hover:text-blue-400 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener"
                aria-label="Facebook"
                className="hover:text-blue-500 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener"
                aria-label="LinkedIn"
                className="hover:text-blue-300 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div className="flex-1 min-w-[180px]">
            <h2 className="text-lg font-semibold mb-2">Services</h2>
            <ul className="space-y-2">
              <li>
                <a
                  className="text-sm hover:underline hover:text-white"
                  href="#"
                >
                  Land Registration
                </a>
              </li>
              <li>
                <a
                  className="text-sm hover:underline hover:text-white"
                  href="#"
                >
                  Land Management
                </a>
              </li>
              <li>
                <a
                  className="text-sm hover:underline hover:text-white"
                  href="#"
                >
                  Building and Constructions
                </a>
              </li>
              <li>
                <a
                  className="text-sm hover:underline hover:text-white"
                  href="/contact-us"
                >
                  Contact support
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="flex-1 min-w-[180px]">
            <h2 className="text-lg font-semibold mb-2">Quick Links</h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/market-place"
                  className="text-sm hover:underline hover:text-white"
                >
                  Market Place
                </Link>
              </li>
              <li>
                <Link
                  href="/contact-us"
                  className="text-sm hover:underline hover:text-white"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <a
                  href="/trabuom"
                  className="text-sm hover:underline hover:text-white"
                >
                  Trabuom Site
                </a>
              </li>
              <li>
                <a
                  href="/nthc"
                  className="text-sm hover:underline hover:text-white"
                >
                  Kwadaso Lands
                </a>
              </li>
              <li>
                <a
                  href="/legon-hills"
                  className="text-sm hover:underline hover:text-white"
                >
                  East Legon Hills Land
                </a>
              </li>
              <li>
                <a
                  href="/berekuso"
                  className="text-sm hover:underline hover:text-white"
                >
                  Berekuso Lands
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="flex-1 min-w-[260px]">
            <h2 className="text-lg font-semibold mb-2">
              Subscribe to our Newsletter
            </h2>
            <p className="text-sm text-white/70 mb-3">
              Be the first to know about updates. Enter your email:
            </p>
            <form
              className="flex flex-col sm:flex-row w-full rounded-full overflow-hidden border border-white/20 bg-white/10 focus-within:ring-2 focus-within:ring-blue-400"
              onSubmit={subscribeNewsletter}
            >
              <input
                type="email"
                required
                className="min-w-0 flex-1 px-4 py-2 bg-transparent text-white placeholder-white/60 outline-none w-full"
                placeholder="Email Address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
              />
              <button
                type="submit"
                className="bg-white text-primary font-semibold px-5 py-2 hover:bg-blue-100 transition-colors w-full sm:w-auto border-t border-white/10 sm:border-t-0 sm:border-l"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-white/60 gap-2">
          <div>
            &copy; {new Date().getFullYear()} Get One Plot. All rights reserved.
          </div>
          <div>
            Powered by{" "}
            <a
              href="https://www.landandhomesconsult.com"
              target="_blank"
              rel="noopener"
              className="hover:underline hover:text-white ml-1"
            >
              Land and Homes Consult
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
