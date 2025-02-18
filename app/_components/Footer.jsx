/* eslint-disable jsx-a11y/anchor-is-valid */

import { Button } from "@/components/ui/button";
import { supabase } from "@/utils/supabase/client";
import {
  Building2,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
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
    <div className="w-full bg-primary text-white/90 py-10">
      <footer className="px-10">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 basis-[10rem]">
            <Link
              href="/"
              className="flex items-center flex-shrink-0 flex-align-center gap-x-1"
            >
              <Building2 className="text-3xl text-white" />
              <h1 className="font-semibold">GETONEPLOT</h1>
            </Link>
          </div>

          <div className="flex-1 basis-[10rem]">
            <h2 className="text-xl font-semibold">Services</h2>
            <ul>
              <li className="my-2">
                <a className="text-sm hover:underline" href="#">
                  {" "}
                  Land Registration
                </a>
              </li>
              <li className="my-2 text-muted">
                <a href="#" className="text-sm hover:underline">
                  Land Management
                </a>
              </li>
              <li className="my-2 text-muted">
                <a href="#" className="text-sm hover:underline">
                  Building and Contructions
                </a>
              </li>
              <li className="my-2 text-muted">
                <a href="/contact" className="text-sm hover:underline">
                  Contact support
                </a>
              </li>
            </ul>
          </div>

          <div className="flex-1 basis-[10rem]">
            <h2 className="text-xl font-semibold">Quick Links</h2>
            <ul>
              <li className="my-2 text-muted">
                <Link href="/contact-us" className="text-sm hover:underline">
                  {" "}
                  Contact Us
                </Link>
              </li>
              <li className="my-2 text-muted">
                <a href="/trabuom" className="text-sm hover:underline">
                  {" "}
                  Trabuom Site
                </a>
              </li>
              <li className="my-2 text-muted">
                <a href="/nthc" className="text-sm hover:underline">
                  Kwadaso Lands
                </a>
              </li>
              <li className="my-2 text-muted">
                <a href="/legon-hills" className="text-sm hover:underline">
                  East Legon Hills Land
                </a>
              </li>
            </ul>
          </div>

          <div className="flex-1 basis-[10rem] text-center md:text-left">
            <h2 className="text-xl font-semibold">
              Subscribe to our Newsletter
            </h2>
            <p className="text-sm text-muted my-1">
              Subscribe to be the first one to know about updates. Enter your
              email
            </p>
            <div className="justify-center my-3 flex items-center">
              <input
                type="email"
                required
                className="px-4 py-[0.35rem] card-bordered dark:shadow-none outline-none bg-transparent rounded-tl-full rounded-bl-full border"
                placeholder="Email Address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                onClick={subscribeNewsletter}
                type="submit"
                className="text-primary bg-white px-2 py-[7px] animate-pulse rounded-tr-full rounded-br-full"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </footer>
      <div
        className="py-2 mt-3 text-center text-muted border-dark"
        style={{ borderTop: "1px solid grey" }}
      >
        <p className="text-sm mt-6">Get One Plot | All Rights Reserved</p>
      </div>
    </div>
  );
};

export default Footer;
