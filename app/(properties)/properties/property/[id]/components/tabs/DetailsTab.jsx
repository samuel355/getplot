import { format } from "date-fns";

export default function DetailsTab({ property }) {
  // Format size to 2 decimal places
  const formatSize = (size) => {
    if (!size) return "N/A";
    return Number(size).toFixed(2);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      <div>
        <h3 className="text-lg font-semibold mb-4">Property Details</h3>
        <dl className="space-y-3">
          <div className="flex justify-between py-2 border-b">
            <dt className="text-muted-foreground">Property Type</dt>
            <dd className="font-medium capitalize">{property.type}</dd>
          </div>
          <div className="flex justify-between py-2 border-b">
            <dt className="text-muted-foreground">Size</dt>
            <dd className="font-medium">{formatSize(property.size)}</dd>
          </div>
          {property.type === "house" && (
            <>
              <div className="flex justify-between py-2 border-b">
                <dt className="text-muted-foreground">Bedrooms</dt>
                <dd className="font-medium">{property.bedrooms}</dd>
              </div>
              <div className="flex justify-between py-2 border-b">
                <dt className="text-muted-foreground">Bathrooms</dt>
                <dd className="font-medium">{property.bathrooms}</dd>
              </div>
            </>
          )}
          <div className="flex justify-between py-2 border-b">
            <dt className="text-muted-foreground">Status</dt>
            <dd className="font-medium capitalize">{property.status}</dd>
          </div>
          <div className="flex justify-between py-2 border-b">
            <dt className="text-muted-foreground">Created</dt>
            <dd className="font-medium">
              {property.created_at ? format(new Date(property.created_at), "MMM d, yyyy") : "N/A"}
            </dd>
          </div>
          <div className="flex justify-between py-2 border-b">
            <dt className="text-muted-foreground">Last Updated</dt>
            <dd className="font-medium">
              {property.updated_at ? format(new Date(property.updated_at), "MMM d, yyyy") : "N/A"}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Price Information</h3>
        <dl className="space-y-3">
          {property.listing_type === "rent" ? (
            <>
              <div className="flex justify-between py-2 border-b">
                <dt className="text-muted-foreground">Monthly Rent</dt>
                <dd className="font-medium">₵{Number(property.rental_price).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between py-2 border-b">
                <dt className="text-muted-foreground">Rental Duration</dt>
                <dd className="font-medium capitalize">
                  {property.rental_duration?.replace("_", " ")}
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b">
                <dt className="text-muted-foreground">Security Deposit</dt>
                <dd className="font-medium">₵{Number(property.rental_deposit).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between py-2 border-b">
                <dt className="text-muted-foreground">Utilities Included</dt>
                <dd className="font-medium">{property.rental_utilities_included ? "Yes" : "No"}</dd>
              </div>
              <div className="flex justify-between py-2 border-b">
                <dt className="text-muted-foreground">Furnished</dt>
                <dd className="font-medium">{property.rental_furnished ? "Yes" : "No"}</dd>
              </div>
            </>
          ) : property.listing_type === "airbnb" ? (
            <>
              <div className="flex justify-between py-2 border-b">
                <dt className="text-muted-foreground">Price per Day</dt>
                <dd className="font-medium">₵{Number(property.rental_price).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between py-2 border-b">
                <dt className="text-muted-foreground">Available From</dt>
                <dd className="font-medium">
                  {property.rental_available_from
                    ? format(new Date(property.rental_available_from), "MMM d, yyyy")
                    : "N/A"}
                </dd>
              </div>
              <div className="flex justify-between py-2 border-b">
                <dt className="text-muted-foreground">Available To</dt>
                <dd className="font-medium">
                  {property.rental_available_to
                    ? format(new Date(property.rental_available_to), "MMM d, yyyy")
                    : "N/A"}
                </dd>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between py-2 border-b">
                <dt className="text-muted-foreground">Price</dt>
                <dd className="font-medium">₵{Number(property.price).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between py-2 border-b">
                <dt className="text-muted-foreground">Negotiable</dt>
                <dd className="font-medium">{property.negotiable ? "Yes" : "No"}</dd>
              </div>
            </>
          )}
        </dl>
      </div>
    </div>
  );
}
