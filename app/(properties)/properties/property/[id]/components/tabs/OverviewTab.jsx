import { format } from "date-fns";
import { Tag, Ruler, Bed, Bath, Calendar } from "lucide-react";

export default function OverviewTab({ property }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">About this property</h2>
      <p className="text-muted-foreground whitespace-pre-line">
        {property.description}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        <div className="flex flex-col items-center p-4 bg-muted/40 rounded-lg">
          <Tag className="h-5 w-5 mb-2 text-muted-foreground" />
          <span className="font-medium">
            {property.listing_type === "rent" ? (
              <>
                ₵{Number(property.rental_price).toLocaleString()}
                <span className="text-xs text-muted-foreground block">
                  per month
                </span>
              </>
            ) : property.listing_type === "airbnb" ? (
              <>
                ₵{Number(property.rental_price).toLocaleString()}
                <span className="text-xs text-muted-foreground block">
                  per day
                </span>
              </>
            ) : (
              <>
                ₵{Number(property.price).toLocaleString()}
                {property.negotiable && (
                  <span className="text-xs text-muted-foreground block">
                    Negotiable
                  </span>
                )}
              </>
            )}
          </span>
        </div>

        <div className="flex flex-col items-center p-4 bg-muted/40 rounded-lg">
          <Ruler className="h-5 w-5 mb-2 text-muted-foreground" />
          <span className="font-medium">{property.size}</span>
        </div>

        {property.type === "house" && (
          <>
            <div className="flex flex-col items-center p-4 bg-muted/40 rounded-lg">
              <Bed className="h-5 w-5 mb-2 text-muted-foreground" />
              <span className="font-medium">{property.bedrooms} Bedrooms</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-muted/40 rounded-lg">
              <Bath className="h-5 w-5 mb-2 text-muted-foreground" />
              <span className="font-medium">
                {property.bathrooms} Bathrooms
              </span>
            </div>
          </>
        )}

        <div className="flex flex-col items-center p-4 bg-muted/40 rounded-lg">
          <Calendar className="h-5 w-5 mb-2 text-muted-foreground" />
          <span className="font-medium">
            Listed on {format(new Date(property.created_at), "MMM d, yyyy")}
          </span>
        </div>
      </div>
    </div>
  );
}
