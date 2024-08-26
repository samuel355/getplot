import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Hero = () => {
  const router = useRouter();
  return (
    <div
      className="relative z-0 flex flex-wrap min-h-screen gap-2 mt-0 md:-mt-10 flex-center-center pt-12 lg:px-14 md:px-14 px-8"
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
            we connect you with the right land to build your dreams.
          </p>
        </div>
        <Button
          onClick={() => router.push("/get-plot")}
          className="mt-4 btn-primary capitalize text-base"
        >
          View Lands
        </Button>
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
      <div className="flex-1 basis-[20rem] mt-8 md:-mt-8 items-center place-items-center">
        <img src="/hero.png" alt="" className="w-full object-cover" />
      </div>
    </div>
  );
};

export default Hero;
