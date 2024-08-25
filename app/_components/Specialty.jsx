import { ArrowRight, Check, Layers, Users } from "lucide-react";
import Link from "next/link";

const Speciality = () => {
  return (
    <div className="py-10 pb-16 px-12 md:px-14 lg:px-14">
      <div className="flex flex-wrap gap-10">
        <div className="flex-1 basis-[20rem]">
          <h1 className="p-2 text-primary/80 text-sm bg-cyan-100 rounded-full w-28 text-center">
            About Us
          </h1>
          <h1 className="font-bold text-xl capitalize mt-5">we specialize in quality home renovations</h1>
          <p className="mt-3">
            Welcome to Get One Plot Platform, your premier destination for all things
            related to real estate buying. At Get One Plot Platform, we understand
            that purchasing a property is not just a transaction; it's a
            milestone in your life's journey. Whether you're a first-time buyer
            or a seasoned investor, we're here to guide you every step of the
            way.
          </p>
          <div className="mt-4">
            <div className="flex flex-align-center gap-x-2">
              <div className="text-primary/80 rounded-full bg-cyan-100">
                <Check className="p-1" />
              </div>
              <p>Outstanding Property</p>
            </div>
            <div className="flex flex-align-center gap-x-2">
              <div className="text-primary/80 rounded-full bg-cyan-100">
                <Check className="p-1" />
              </div>
              <p>Professional and experienced human resource</p>
            </div>
            <div className="flex flex-align-center gap-x-2">
              <div className="text-primary/80 rounded-full bg-cyan-100">
                <Check className="p-1" />
              </div>
              <p>Provide the best services for users</p>
            </div>
            <div className="flex flex-align-center gap-x-2">
              <div className="text-primary/80 rounded-full bg-cyan-100">
                <Check className="p-1" />
              </div>
              <p>Modern city locations and exceptional lifestyle</p>
            </div>
            <Link href={""} className="mt-4 flex items-center underline font-bold">
              Read More <ArrowRight className="ml-1 w-5 h-5 animate-pulse" />
            </Link>
          </div>
        </div>
        <div className="flex-1 basis-[20rem]">
          <div className="relative">
            <img
              src="/property1.jpg"
              alt=""
              className="rounded-lg w-full sm:h-[400px] object-cover"
            />
            <div className="absolute -bottom-10 sm:bottom-5 -left-2 md:-left-20">
              <div className="p-3 bg-white rounded-lg shadow-md w-72 flex items-center gap-x-3 dark:bg-dark-light">
                <h1 className="text-sm">We have been serving our customers for over 70 years</h1>
                <div className="text-primary/80 rounded-full bg-cyan-100 p-2">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="p-3 mt-4 ml-8 bg-white rounded-lg shadow-md w-72 flex items-center gap-x-3 dark:bg-dark-light">
                <h1 className="text-sm">
                  Working with the symbol and reputation of trustworthy trait
                </h1>
                <div className="text-primary/80 rounded-full bg-cyan-100 p-2">
                  <Layers className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Speciality;
