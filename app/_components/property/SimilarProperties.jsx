import Link from "next/link";

export default function SimilarProperties({ similarProperties }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Similar Properties</h3>
      <div className="space-y-4">
        {similarProperties.length > 0 ? (
          similarProperties.map((property) => (
            <Link
              key={property.id}
              href={`/property/${property.id}`}
              className="flex gap-3 group"
            >
              <div className="h-16 w-20 rounded-md overflow-hidden flex-shrink-0">
                <img
                  src={property?.images[0]}
                  alt={property.title}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-200"
                />
              </div>
              <div className="overflow-hidden">
                <h4 className="font-medium text-gray-900 truncate group-hover:text-primary">
                  {property.title}
                </h4>
                <p className="text-sm text-gray-500 truncate">
                  {property.location}
                </p>
                <p className="text-primary font-semibold text-sm">
                  {property.listing_type === "rent" ? (
                    <>
                      GHS{property.rental_price.toLocaleString()}
                      <span className="text-xs text-gray-500">/month</span>
                    </>
                  ) : property.listing_type === "airbnb" ? (
                    <>
                      GHS{property.rental_price.toLocaleString()}
                      <span className="text-xs text-gray-500">/day</span>
                    </>
                  ) : (
                    <>GHS{property?.price?.toLocaleString()}</>
                  )}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-gray-500">No similar properties found</p>
        )}
      </div>
    </div>
  );
}
