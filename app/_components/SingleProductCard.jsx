import CardHoverIcons from "./CardHoverIcons";
import CardLabels from "./CardLabels";
import Link from "next/link";
import { ArrowRight, Bath, Bed, LandPlot, MapPin } from "lucide-react";
import Image from "next/image";

const SingleProductCard = ({ property }) => {

  return (
    <div
      className={`flex-1 basis-[18rem] shadow-light dark:border-card-dark border rounded-lg overflow-hidden relative group`}
    >
      <div className="group !opacity-100 overflow-hidden relative">
        <Link href={"/view-house-listing/"+property.id} className="!opacity-100">
          <Image
            width={240}
            height={350}
            src={property.houseListingImages[0].url}
            alt={"property image"}
            className="w-full md:h-[250px] object-contain group-hover:scale-125 transition-all"
          />
        </Link>
        <CardHoverIcons />
        <div className="absolute bottom-0 left-0 w-full px-2 py-2 transition-transform bg-gradient-to-t from-black/80 sm:translate-y-10 group-hover:translate-y-0 to-transparent">
          <div className="text-white flex items-center gap-x-2">
            <MapPin />
            <p>{property.address}</p>
          </div>
        </div>
      </div>
      <CardLabels purpose={property.type} />
      <div className="p-3">
        <Link href={"/view-house-listing/"+property.id} className="group-hover:text-primary transition-a">
          <h1 className="text-lg font-bold capitalize">{property.title}</h1>
        </Link>
        <div className="flex justify-between mt-3">
          <div className="flex items-center gap-x-2">
            <div className="bg-cyan-100 rounded-full text-primary">
              <Bed className="w-5 h-5 p-1" />
            </div>
            <p className="text-sm">{property.bedroom} Beds</p>
          </div>
          <div className="flex items-center gap-x-2">
            <div className="bg-cyan-100 rounded-full text-primary">
              <Bath className="w-5 h-5 p-1" />
            </div>
            <p className="text-sm">{property.bathroom} Bathrooms</p>
          </div>
          <div className="flex items-center gap-x-2">
            <div className="bg-cyan-100 rounded-full text-primary">
              <LandPlot className="w-5 h-5 p-1" />
            </div>
            <p className="text-sm">{property.areaSize}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-primary">GHS. {property.price.toLocaleString()}</h1>
          <Link
            href={"/view-house-listing/"+property.id}
            className="btn btn-secondary animate-pulse flex items-center hover:underline"
          >
            View Details <ArrowRight className="w-5 h-5" />{" "}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SingleProductCard;
