import { Tag, Ruler, Bed, Bath, Calendar } from "lucide-react";

export default function OverviewTab({ property }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Description</h3>
      <p className="text-gray-700 mb-4">{property?.description}</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
          <Tag className="h-5 w-5 mb-2 text-gray-500" />
          <span className="font-medium">
            {property?.listing_type === "rent" ? (
              <>
                GHS{Number(property?.rental_price).toLocaleString()}
                <span className="text-xs text-gray-500 block">per month</span>
              </>
            ) : property?.listing_type === "airbnb" ? (
              <>
                GHS{Number(property?.rental_price).toLocaleString()}
                <span className="text-xs text-gray-500 block">per day</span>
              </>
            ) : (
              <>GHS{Number(property?.price).toLocaleString()}</>
            )}
          </span>
        </div>

        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
          <Ruler className="h-5 w-5 mb-2 text-gray-500" />
          <span className="font-medium">{property?.size}</span>
        </div>

        {property?.type === "house" && (
          <>
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
              <Bed className="h-5 w-5 mb-2 text-gray-500" />
              <span className="font-medium">{property?.bedrooms} Bedrooms</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
              <Bath className="h-5 w-5 mb-2 text-gray-500" />
              <span className="font-medium">{property?.bathrooms} Bathrooms</span>
            </div>
          </>
        )}

        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
          <Calendar className="h-5 w-5 mb-2 text-gray-500" />
          <span className="font-medium">
            Listed on{" "}
            {new Date(property?.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
} 