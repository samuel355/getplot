import { Button } from "@/components/ui/button";
import { ArrowDown, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Hero = () => {
  const router = useRouter();
  return (
    <div
      className="relative z-0 flex flex-col lg:flex-row items-center justify-between gap-8 px-4 sm:px-6 md:px-8 lg:px-12 py-12 md:py-16"
      style={{
        background: "url('/hero-bg-pattern.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain",
      }}
    >
      {/* Gradient accents */}
      <div className="absolute top-0 right-0 rounded-full bg-[#04a7ff]/30 dark:bg-[#04a7ff]/50 w-72 h-72 -z-10 blur-[120px]"></div>
      <div className="absolute bottom-10 left-10 rounded-full bg-primary/20 dark:bg-primary/30 w-56 h-56 -z-10 blur-[80px]"></div>
      
      {/* Content section */}
      <div className="w-full lg:w-1/2 lg:pr-6">
        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 mb-6">
          <p className="text-sm font-medium text-primary flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-primary inline-block animate-pulse"></span>
            Premier Land Marketplace
          </p>
        </div>
        
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold capitalize leading-tight">
          Find Your Perfect <span className="text-primary">Land in Ghana </span> 
        </h1>
        
        <div className="pl-4 my-5 md:my-7 border-l-4 border-primary">
          <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg">
            Explore verified listings across all regions with ease. Whether
            you're seeking residential, commercial, or investment opportunities,
            we connect you with the right land to build your dreams.
          </p>
        </div>
        
        {/* Feature bullets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 mb-6 md:mb-8">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Check size={12} className="text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm">Verified Land Titles</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Check size={12} className="text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm">Transparent Pricing</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Check size={12} className="text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm">Flexible Payment Plans</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Check size={12} className="text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm">Expert Consultation</p>
          </div>
        </div>
        
        <div className="mb-6 font-medium flex gap-2 items-center text-gray-800 dark:text-gray-200">
          <p className="text-base">Browse our Land locations</p>
          <span className="animate-bounce text-primary pt-2">
            <ArrowDown size={18} />
          </span>
        </div>
        
        {/* Links with clear visibility - more responsive */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mt-3">
          <Link 
            className="px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg text-primary border border-blue-100 dark:border-blue-900 hover:border-primary transition-all duration-300 rounded-lg font-medium text-xs sm:text-sm" 
            href="/legon-hills"
          >
            East Legon Hills
          </Link>
          <Link 
            className="px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg text-primary border border-blue-100 dark:border-blue-900 hover:border-primary transition-all duration-300 rounded-lg font-medium text-xs sm:text-sm" 
            href="/nthc"
          >
            NTHC (Kumasi)
          </Link>
          <Link 
            className="px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg text-primary border border-blue-100 dark:border-blue-900 hover:border-primary transition-all duration-300 rounded-lg font-medium text-xs sm:text-sm" 
            href="/dar-es-salaam"
          >
            Dar Es Salaam
          </Link>
          <Link 
            className="px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg text-primary border border-blue-100 dark:border-blue-900 hover:border-primary transition-all duration-300 rounded-lg font-medium text-xs sm:text-sm" 
            href="/trabuom"
          >
            Trabuom
          </Link>
          <Link 
            className="px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg text-primary border border-blue-100 dark:border-blue-900 hover:border-primary transition-all duration-300 rounded-lg font-medium text-xs sm:text-sm" 
            href="/yabi"
          >
            Yabi
          </Link>
        </div>
        
        {/* Stats section with enhanced styling */}
        <div className="mt-8 flex gap-4 sm:gap-6">
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
            <h1 className="text-xl sm:text-2xl font-bold">
              12k<span className="text-primary">+</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Satisfied Clients</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
            <h1 className="text-xl sm:text-2xl font-bold">
              5k<span className="text-primary">+</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Available Lands</p>
          </div>
        </div>
      </div>
      
      {/* Right section with image */}
      <div className="w-full lg:w-1/2 mt-12 lg:mt-0 relative">
        <div className="relative h-full flex items-center justify-center">
          {/* Main image with overlay card */}
          <div className="relative z-10 w-[90%] h-auto overflow-hidden rounded-2xl shadow-2xl">
            <img 
              srcc="https://images.unsplash.com/photo-1628624747186-a941c476b7ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              src="/images/trabuom-lt.jpg" 
              alt="Beautiful land in Ghana" 
              className="w-full h-full object-cover aspect-[4/3] sm:aspect-[16/10]"
            />
            
            {/* Overlay card */}
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-white font-bold text-sm sm:text-xl">Serviced Lands</h3>
                  <p className="text-gray-200 text-xs sm:text-sm">Kumasi - Ghana</p>
                </div>
                <div className="bg-primary rounded-lg px-2 sm:px-3 py-1 sm:py-1.5">
                  <p className="text-white text-xs sm:text-sm font-bold">From GHS 30,000</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating cards - hide on smaller screens */}
          <div className="absolute top-10 -right-4 bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg shadow-lg z-20 border border-gray-100 dark:border-gray-700 w-28 sm:w-36 hidden sm:block">
            <div className="flex items-center gap-2">
              <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Check size={12} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium">Verified</p>
                <p className="text-xs text-gray-500">Lands Sites</p>
              </div>
            </div>
          </div>
          
          <div className="absolute -bottom-10  -left-2 bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg shadow-lg z-20 border border-gray-100 dark:border-gray-700 hidden sm:block">
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src="/favicon.png" 
                alt="Client" 
                className="w-8 sm:w-10 h-8 sm:h-10 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
                <p className="text-xs mt-1">"Perfect service and support!"</p>
              </div>
            </div>
          </div>
          
          {/* Background decorative elements */}
          <div className="absolute right-10 top-10 w-40 h-40 bg-blue-100 dark:bg-blue-900/20 rounded-full -z-10 blur-xl"></div>
          <div className="absolute -right-10 bottom-20 w-60 h-60 bg-primary/10 rounded-full -z-10 blur-xl"></div>
        </div>
      </div>
    </div>
  );
};

export default Hero;