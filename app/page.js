"use client";


import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "@/app/_components/Header";
import Hero from "./_components/Hero-section";
import PropertyCarousel from "@/app/_components/PropertyCarousel";
import Footer from "./_components/Footer";

const Home = () => {
  const router = useRouter();
  useEffect(() => {
    router.prefetch("/add-house-listing");
    router.prefetch("/add-land-listing");
    router.prefetch("/dar-es-salaam");
    router.prefetch("/nthc");
    router.prefetch("/trabuom");
    router.prefetch("/asokore-mampong");
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-8 md:pt-20 lg:pt-24">
        <Hero />
        <div className="w-full px-4 py-12">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Featured Properties
          </h2>
          <PropertyCarousel />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
