import { ArrowRight, Home } from "lucide-react";
import Link from "next/link";

const Invests = () => {
  return (
    <div className="pt-20 pb-16 relative">
      <div className="bg-primary grid grid-cols-1 md:flex md:flex-row">
        <div className="relative">
          <img
            src="/property.jpeg"
            alt=""
            className="w-full object-cover lg:h-full md:h-full xl:h-full h-64"
          />

          <div className="absolute flex-col p-5 top-0 left-72 mt-5 lg:left-20 md:left-24 lg:mt-6 animate-pulse">
            <div className="flex flex-col p-3 rounded-lg bg-white/90 backdrop-blur-sm sm:-ml-72 md:-ml-20 sm:mt-0">
              <div className="flex flex-align-center">
                <img
                  src="/avatars/avatar.png"
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
                <img
                  src="/avatars/avatar-1.png"
                  alt=""
                  className="w-8 h-8 -ml-2 border-2 border-white rounded-full dark:border-dark"
                />
                <img
                  src="/avatars/avatar-2.png"
                  alt=""
                  className="w-8 h-8 -ml-2 border-2 border-white rounded-full dark:border-dark"
                />
                <img
                  src="/avatars/avatar-3.png"
                  alt=""
                  className="w-8 h-8 -ml-2 border-2 border-white rounded-full dark:border-dark"
                />
                <div className="grid w-8 h-8 -ml-2 text-white border-2 border-white rounded-full bg-primary place-items-center dark:border-dark">
                  <h1>+5</h1>
                </div>
              </div>
              <h1 className="mt-2 text-primary text-sm">
                People Successfully Getting Properties
              </h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col p-10 md:p-16 lg:p-16 xl:p-16">
          <h1 className="text-xl font-medium text-white ml-2 md:ml-10">
            Unveiling the Secrets to Strategic Real Estate Investment From prime
            locations to savvy financial analysis, embark on your journey to
            wealth through property 🔑🏠.
          </h1>
          <Link
            className="flex animate-pulse mt-8 ml-2 lg:ml-10 md:ml-10 text-white border p-2 w-40 text-center"
            href={"/get-home"}
          >
            Get Started <ArrowRight className="text-white animate-pulse ml-2" />{" "}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Invests;
