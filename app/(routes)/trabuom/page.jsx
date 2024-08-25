"use client";
import Footer from "@/app/_components/Footer";
import Map from "@/app/_components/Map";
import Link from "next/link";
import Header from "@/app/_components/Header";

const page = () => {
  // const center = {
  //   lng: -1.6615226669999288,
  //   lat: 6.6696035320000533,
  // };

  return (
    <>
    <Header />
      <div className="w-full mx-12 overflow-x-hidden mb-8 pt-[7.5rem]">
        <section className="h-screen">
          <div className="mx-auto max-w-screen-xl px-4 py-12 lg:flex lg:h-screen lg:items-center">
            <div className="mx-auto max-w-xl text-center">
              <h1 className="text-3xl font-extrabold sm:text-5xl">
                TRABUOM SITE
              </h1>

              <p className="mt-4 sm:text-xl/relaxed">
                TRABUOM Site hosts over 1000 plots which are yet to be displayed
                here
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  className="block w-full rounded bg-primary/90 px-12 py-3 text-sm font-medium text-white shadow hover:bg-primary focus:outline-none focus:ring active:bg-red-500 sm:w-auto"
                  href="/nthc"
                >
                  Check NTHC Plots
                </Link>

                <Link
                  className="block w-full rounded px-12 py-3 text-sm font-medium text-primary/80 shadow hover:text-primary focus:outline-none focus:ring active:text-red-500 sm:w-auto"
                  href="/"
                >
                  Go Home
                </Link>
              </div>
            </div>
          </div>
        </section>
        {/* <Map geoJsonData={nthc} parcels={nthc} center={center} /> */}
      </div>
      <Footer />
    </>
  );
};

export default page;
