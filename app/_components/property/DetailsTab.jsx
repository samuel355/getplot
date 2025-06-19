export default function DetailsTab({ property }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">Property Details</h3>
        <dl className="space-y-2">
          <div className="flex justify-between py-1 border-b">
            <dt className="text-gray-500">Property Type</dt>
            <dd className="font-medium capitalize">{property?.type}</dd>
          </div>
          <div className="flex justify-between py-1 border-b">
            <dt className="text-gray-500">Size</dt>
            <dd className="font-medium">{property?.size}</dd>
          </div>
          {property?.type === "house" && (
            <>
              <div className="flex justify-between py-1 border-b">
                <dt className="text-gray-500">Bedrooms</dt>
                <dd className="font-medium">{property?.bedrooms}</dd>
              </div>
              <div className="flex justify-between py-1 border-b">
                <dt className="text-gray-500">Bathrooms</dt>
                <dd className="font-medium">{property?.bathrooms}</dd>
              </div>
            </>
          )}
          <div className="flex justify-between py-1 border-b">
            <dt className="text-gray-500">Created</dt>
            <dd className="font-medium">
              {new Date(property?.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Price Information</h3>
        <dl className="space-y-2">
          {property?.listing_type === "rent" ? (
            <>
              <div className="flex justify-between py-1 border-b">
                <dt className="text-gray-500">Monthly Rent</dt>
                <dd className="font-medium">
                  GHS{Number(property?.rental_price).toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between py-1 border-b">
                <dt className="text-gray-500">Rental Duration</dt>
                <dd className="font-medium capitalize">
                  {property?.rental_duration?.replace("_", " ")}
                </dd>
              </div>
              <div className="flex justify-between py-1 border-b">
                <dt className="text-gray-500">Security Deposit</dt>
                <dd className="font-medium">
                  GHS{Number(property?.rental_deposit).toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between py-1 border-b">
                <dt className="text-gray-500">Utilities Included</dt>
                <dd className="font-medium">
                  {property?.rental_utilities_included ? "Yes" : "No"}
                </dd>
              </div>
              <div className="flex justify-between py-1 border-b">
                <dt className="text-gray-500">Furnished</dt>
                <dd className="font-medium">
                  {property?.rental_furnished ? "Yes" : "No"}
                </dd>
              </div>
            </>
          ) : property?.listing_type === "airbnb" ? (
            <>
              <div className="flex justify-between py-1 border-b">
                <dt className="text-gray-500">Price per Day</dt>
                <dd className="font-medium">
                  GHS{Number(property?.rental_price).toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between py-1 border-b">
                <dt className="text-gray-500">Available From</dt>
                <dd className="font-medium">
                  {property?.rental_available_from
                    ? new Date(
                        property?.rental_available_from
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A"}
                </dd>
              </div>
              <div className="flex justify-between py-1 border-b">
                <dt className="text-gray-500">Available To</dt>
                <dd className="font-medium">
                  {property?.rental_available_to
                    ? new Date(
                        property?.rental_available_to
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A"}
                </dd>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between py-1 border-b">
                <dt className="text-gray-500">Price</dt>
                <dd className="font-medium">
                  GHS{Number(property?.price).toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between py-1 border-b">
                <dt className="text-gray-500">Negotiable</dt>
                <dd className="font-medium">
                  {property?.negotiable ? "Yes" : "No"}
                </dd>
              </div>
            </>
          )}
        </dl>
      </div>
    </div>
  );
}
