import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DocumentsTab({ property }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Property Documents</h2>
      {property.documents && property.documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {property.documents.map((doc, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-base">{doc.name}</CardTitle>
                </div>
                <CardDescription>
                  {doc.size
                    ? `${(doc.size / 1024 / 1024).toFixed(2)} MB`
                    : "Size not available"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(doc.url, "_blank")}
                >
                  View Document
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No documents available</h3>
          <p className="text-muted-foreground mt-1">
            This property doesn't have any documents attached to it.
          </p>
        </div>
      )}
    </div>
  );
}
