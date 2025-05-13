import { CheckCircle } from 'lucide-react';

export default function FeaturesTab({ property }) {
  const features = property.features || [];
  
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Property Features</h3>
      {features.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No features listed for this property.</p>
      )}
    </div>
  );
} 