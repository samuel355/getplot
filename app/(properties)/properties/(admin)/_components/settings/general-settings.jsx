import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import useSettingsStore from "../../_store/useSettingsStore";
import { useToast } from "@/components/hooks/use-toast";

export function GeneralSettings() {
  const { settings, updateSettings } = useSettingsStore();
  const { toast } = useToast();
  const [formData, setFormData] = useState(settings.general);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateSettings('general', formData);
    
    if (result.success) {
      toast({
        title: "Settings Updated",
        description: "General settings have been saved successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={formData.siteName}
              onChange={(e) => setFormData({...formData, siteName: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support Email</Label>
            <Input
              id="supportEmail"
              type="email"
              value={formData.supportEmail}
              onChange={(e) => setFormData({...formData, supportEmail: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxImagesPerProperty">Max Images Per Property</Label>
            <Input
              id="maxImagesPerProperty"
              type="number"
              min="1"
              max="20"
              value={formData.maxImagesPerProperty}
              onChange={(e) => setFormData({...formData, maxImagesPerProperty: parseInt(e.target.value)})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxImageSize">Max Image Size (MB)</Label>
            <Input
              id="maxImageSize"
              type="number"
              min="1"
              max="10"
              value={formData.maxImageSize}
              onChange={(e) => setFormData({...formData, maxImageSize: parseInt(e.target.value)})}
            />
          </div>

          <Button type="submit">Save Changes</Button>
        </form>
      </CardContent>
    </Card>
  );
}