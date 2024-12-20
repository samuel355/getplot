"use client";

import Footer from "@/app/_components/Footer";
import Hero from "@/app/_components/Hero";
import Invests from "@/app/_components/Invests";
import Speciality from "@/app/_components/Specialty";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "@/app/_components/Header";

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
    <div>
      <Header />
      <div className="pt-[7rem]">
        <Hero />
        {/* <HomeFilters /> */}
        <Invests />
        <Speciality />
        {/* <Featured /> */}
        <Footer />
      </div>
    </div>
  );
};

export default Home;
