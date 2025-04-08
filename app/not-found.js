"use client";

import { useEffect } from "react";
import Link from "next/link";
import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import { HomeIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function NotFound() {
  // Track 404 errors (optional)
  useEffect(() => {
    // You could add analytics tracking here
    console.log("404 page visited");
  }, []);

  return (
    <>
      <Header />
      <main className="flex flex-col items-center justify-center min-h-[70vh] px-4 sm:px-6 py-8 mt-24">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-6">
            <div className="relative mx-auto w-48 h-48">
              {/* Custom 404 illustration */}
              <div className="absolute inset-0 bg-primary-light rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-24 h-24 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-xl text-gray-600 mb-8">
            Oops! We couldn't find the page you're looking for.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Link href="/" className="flex items-center justify-center gap-2 bg-primary text-white py-3 px-6 rounded-md hover:bg-primary-dark transition duration-300">
              <HomeIcon className="h-5 w-5" />
              <span>Go Home</span>
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-50 transition duration-300"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Go Back</span>
            </button>
          </div>
          
          <div className="text-center border-t border-gray-200 pt-8">
            <p className="text-gray-600 mb-4">Looking for something specific?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/market-place" className="flex items-center justify-center gap-2 text-primary hover:text-primary-dark transition duration-300">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>Browse Properties</span>
              </Link>
              <Link href="/contact" className="flex items-center justify-center gap-2 text-primary hover:text-primary-dark transition duration-300">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Contact Us</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}