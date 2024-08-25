"use client";
import Featured from "@/app/_components/Featured";
import Footer from "@/app/_components/Footer";
import Hero from "@/app/_components/Hero";
import HomeFilters from "@/app/_components/HomeFilters";
import Invests from "@/app/_components/Invests";
import Speciality from "@/app/_components/Specialty";
import { useRouter } from "next/navigation";
import React, { Suspense } from "react";
import { useEffect } from "react";
import Header from "@/app/_components/Header";

const Home = () => {
  const router = useRouter();
  useEffect(() => {
    router.prefetch("/add-house-listing");
    router.prefetch("/add-land-listing");
    router.prefetch("/dar-es-salaam");
    router.prefetch("/get-home");
    router.prefetch("/get-plot");
    router.prefetch("/nthc");
    router.prefetch("/trabuom");
  }, [router]);
  return (
    <div>
      <Header />
      <div className="pt-[7rem]">
        <Hero />
        <HomeFilters />
        <Invests />
        <Speciality />
        <Featured />
        <Footer />
      </div>
    </div>
  );
};

export default Home;
