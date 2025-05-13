import PropertyMap from '../../../../components/property-map';

export default function LocationTab({ property }) {
  return (
    <div>
      <div className="aspect-[16/9] bg-muted rounded-lg overflow-hidden mb-4 h-80 w-full">
        <PropertyMap property={property} />
      </div>
      
      <h3 className="text-lg font-semibold mb-2">Location</h3>
      <p className="text-muted-foreground mb-2">
        {property.location}
      </p>
      
      <h3 className="text-lg font-semibold mt-4 mb-2">Address</h3>
      <p className="text-muted-foreground">
        {property.address}
      </p>
    </div>
  );
} 