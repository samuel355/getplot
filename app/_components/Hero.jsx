import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowDown01, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Hero = () => {
  const router = useRouter();
  return (
    <div
      className="relative z-0 flex flex-wrap min-h-screen gap-2 mt-0 mb-0 md:-mt-10 flex-center-center pt-12 lg:px-14 md:px-14 px-8 h-screen"
      style={{
        background: "url('/hero-bg-pattern.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
      }}
    >
      <div className="absolute top-0 right-0 rounded-full bg-[#04a7ff]/30 dark:bg-[#04a7ff]/50 w-72 h-72 -z-10 blur-[120px]"></div>
      <div className="flex-1 basis-[20rem] pt-16">
        <h1 className="text-4xl md:text-5xl font-bold capitalize">
          Find Your Perfect Land in Ghana
        </h1>
        <div className="pl-3 my-7 border-l-4 border-primary w-full">
          <p>
            Explore verified listings across all regions with ease. Whether
            you're seeking residential, commercial, or investment opportunities,
            we connect you with the right land to build your dream homes.
          </p>
        </div>
        <Button className="mt-4 button-primay text-center rounded-sm px-4 py-2 capitalize text-base flex gap-2 bg-primary text-white">
          View out sites
          <span>
            {" "}
            <ArrowDown />{" "}
          </span>
        </Button>
        <div className="flex gap-4 flex-wrap mt-3">
          <Link className="text-primary hover:underline" href="/legon-hills">
            East Legon Hills (Santuo)
          </Link>
          <Link className="text-primary hover:underline" href="/nthc">
            NTHC (Kumasi)
          </Link>
          <Link className="text-primary hover:underline" href="/dar-es-salaam">
            Dar Es Salaam (Kumasi)
          </Link>
          <Link className="text-primary hover:underline" href="/trabuom">
            Trabuom(Kumasi)
          </Link>
        </div>
        <div className="mt-6 text-center flex flex-align-center gap-x-6">
          <div className="bg-cyan-100 p-2">
            <h1 className="text-xl font-bold">
              12k <span className="text-sm text-primary">+</span>
            </h1>
            <p className="text-sm text-gray-600">Satisfied Clients</p>
          </div>
          <div className="bg-cyan-100 p-2">
            <h1 className="text-xl font-bold">
              5k <span className="text-sm text-primary">+</span>
            </h1>
            <p className="text-sm text-gray-600">Available Lands</p>
          </div>
        </div>
      </div>
      <div className="flex-1 basis-[20rem] mt-12 md:-mt-6 items-center place-items-center">
        <img src="/hero-land.png" alt="" className="w-full object-cover" />
      </div>
    </div>
  );
};

export default Hero;
