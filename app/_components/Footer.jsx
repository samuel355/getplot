/* eslint-disable jsx-a11y/anchor-is-valid */

import { Button } from "@/components/ui/button";
import {
  Building2,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
} from "lucide-react";
import Link from "next/link";

const Footer = () => {
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
            <div className="mt-3">
              <p className="text-sm">
                Unveiling the Secrets to Strategic Real Estate Investment From
                prime locations to savvy financial analysis.
              </p>
              <div className="gap-5 my-6 flex items-center">
                <div className="icon-box bg-dark-light hover:bg-hover-color-dark">
                  <Facebook />
                </div>

                <div className="icon-box bg-dark-light hover:bg-hover-color-dark">
                  <Twitter />
                </div>

                <div className="icon-box bg-dark-light hover:bg-hover-color-dark">
                  <Instagram />
                </div>

                <div className="icon-box bg-dark-light hover:bg-hover-color-dark">
                  <Linkedin />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 basis-[10rem]">
            <h2 className="text-xl font-semibold">Services</h2>
            <ul>
              <li className="my-2">
                <a className="text-sm hover:underline" href="#"> Order Tracking</a>
              </li>
              <li className="my-2 text-muted">
                <a href="#" className="text-sm hover:underline">Whislist</a>
              </li>
              <li className="my-2 text-muted">
                <a href="#" className="text-sm hover:underline">Terms of use</a>
              </li>
              <li className="my-2 text-muted">
                <a href="#" className="text-sm hover:underline">Contact support</a>
              </li>
              <li className="my-2 text-muted">
                <a href="#" className="text-sm hover:underline">2 year guarantee</a>
              </li>
            </ul>
          </div>

          <div className="flex-1 basis-[10rem]">
            <h2 className="text-xl font-semibold">Quick Links</h2>
            <ul>
            <li className="my-2 text-muted">
                <Link href="/contact-us" className="text-sm hover:underline"> Contact Us</Link>
              </li>
              <li className="my-2 text-muted">
                <a href="#" className="text-sm hover:underline"> About Us</a>
              </li>
              <li className="my-2 text-muted">
                <a href="#" className="text-sm hover:underline">Services</a>
              </li>
              <li className="my-2 text-muted">
                <a href="#" className="text-sm hover:underline">Blog</a>
              </li>
              <li className="my-2 text-muted">
                <a href="#" className="text-sm hover:underline">Portifolio</a>
              </li>
            </ul>
          </div>

          <div className="flex-1 basis-[10rem]">
            <h2 className="text-xl font-semibold">Business</h2>
            <ul>
              <li className="my-2 text-muted">
                <a href="#" className="text-sm hover:underline"> Success</a>
              </li>
              <li className="my-2 text-muted">
                <a href="#" className="text-sm hover:underline">Guide</a>
              </li>
              <li className="my-2 text-muted">
                <a href="#" className="text-sm hover:underline">Mission</a>
              </li>
              <li className="my-2 text-muted">
                <a href="#" className="text-sm hover:underline">Terms & Conditions</a>
              </li>
              <li className="my-2 text-muted">
                <a href="#" className="text-sm hover:underline">Pricacy Policy</a>
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
                type="text"
                className="px-4 py-[0.35rem] card-bordered dark:shadow-none outline-none bg-transparent rounded-tl-full rounded-bl-full border"
                placeholder="Email Address..."
              />
              <button className="text-primary bg-white px-2 py-[7px] animate-pulse rounded-tr-full rounded-br-full">Subscribe</button>
            </div>
          </div>
        </div>
      </footer>
      <div className="py-2 mt-3 text-center text-muted border-dark" style={{borderTop: '1px solid grey'}}>
        <p className="text-sm">Get One Plot | All Rights Reserved</p>
      </div>
    </div>
  );
};

export default Footer;
