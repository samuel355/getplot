import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTab from "./tabs/OverviewTab";
import DetailsTab from "./tabs/DetailsTab";
import FeaturesTab from "./tabs/FeaturesTab";
import LocationTab from "./tabs/LocationTab";
import DocumentsTab from "./tabs/DocumentsTab";

export default function PropertyTabs({ property }) {
  return (
    <Tabs defaultValue="overview" className="mt-6">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="location">Location</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="pt-4">
        <OverviewTab property={property} />
      </TabsContent>
      <TabsContent value="details" className="pt-4">
        <DetailsTab property={property} />
      </TabsContent>
      <TabsContent value="features" className="pt-4">
        <FeaturesTab property={property} />
      </TabsContent>
      <TabsContent value="location" className="pt-4">
        <LocationTab property={property} />
      </TabsContent>
      <TabsContent value="documents" className="pt-4">
        <DocumentsTab property={property} />
      </TabsContent>
    </Tabs>
  );
}
