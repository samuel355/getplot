"use client";

import Footer from "@/app/_components/Footer";
import Invests from "@/app/_components/Invests";
import Speciality from "@/app/_components/Specialty";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "@/app/_components/Header";
import Hero from "./_components/Hero-section";

const Home = () => {
  const router = useRouter();
  useEffect(() => {
    router.prefetch("/add-house-listing");
    router.prefetch("/add-land-listing");
    router.prefetch("/dar-es-salaam");
    router.prefetch("/nthc");
    router.prefetch("/trabuom");
  }, [router]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-8 md:pt-20 lg:pt-24"> {/* Responsive padding top */}
        <Hero />
        {/* Optional: Uncomment if you want to use these components */}
        {/* <Speciality /> */}
        {/* <Invests /> */}
      </main>
      <Footer />
    </div>
  );
};

export default Home;