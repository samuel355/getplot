import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import useSettingsStore from "../../_store/useSettingsStore";
import { useToast } from "@/hooks/use-toast";

export function FeaturedProperties() {
  const {
    settings,
    featuredProperties,
    updateSettings,
    fetchFeaturedProperties,
    toggleFeatured,
  } = useSettingsStore();
  const { toast } = useToast();

  useEffect(() => {
    fetchFeaturedProperties();
  }, [fetchFeaturedProperties]);

  const handleSettingsUpdate = async (newSettings) => {
    const result = await updateSettings("featured", newSettings);

    if (result.success) {
      toast({
        title: "Settings Updated",
        description: "Featured property settings have been saved",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  const handleToggleFeatured = async (propertyId, featured) => {
    const result = await toggleFeatured(propertyId, featured);

    if (result.success) {
      toast({
        title: featured ? "Property Featured" : "Property Unfeatured",
        description: `Property has been ${
          featured ? "added to" : "removed from"
        } featured listings`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update featured status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Featured Properties Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxFeatured">Maximum Featured Properties</Label>
              <Input
                id="maxFeatured"
                type="number"
                value={settings.featured.maxFeaturedProperties}
                onChange={(e) =>
                  handleSettingsUpdate({
                    ...settings.featured,
                    maxFeaturedProperties: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Featured Duration (days)</Label>
              <Input
                id="duration"
                type="number"
                value={settings.featured.featuredDuration}
                onChange={(e) =>
                  handleSettingsUpdate({
                    ...settings.featured,
                    featuredDuration: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="autoRemove">Auto-remove Expired</Label>
              <Switch
                id="autoRemove"
                checked={settings.featured.autoRemoveExpired}
                onCheckedChange={(checked) =>
                  handleSettingsUpdate({
                    ...settings.featured,
                    autoRemoveExpired: checked,
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Currently Featured Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {featuredProperties.map((property) => (
              <div
                key={property.id}
                className="flex items-center justify-between border-b pb-2"
              >
                <div>
                  <h3 className="font-medium">{property.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Featured until:{" "}
                    {new Date(property.featured_until).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleToggleFeatured(property.id, false)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
