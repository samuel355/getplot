import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import useSettingsStore from "../../_store/useSettingsStore";
import { useToast } from "@/hooks/use-toast";

export function PropertySettings() {
  const { settings, updateSettings } = useSettingsStore();
  const { toast } = useToast();
  const [formData, setFormData] = useState(settings.property);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateSettings('property', formData);
    
    if (result.success) {
      toast({
        title: "Settings Updated",
        description: "Property settings have been saved successfully",
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
        <CardTitle>Property Requirements</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="requireApproval">Require Approval</Label>
            <Switch
              id="requireApproval"
              checked={formData.requireApproval}
              onCheckedChange={(checked) => 
                setFormData({...formData, requireApproval: checked})
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="allowNegotiable">Allow Negotiable Prices</Label>
            <Switch
              id="allowNegotiable"
              checked={formData.allowNegotiable}
              onCheckedChange={(checked) => 
                setFormData({...formData, allowNegotiable: checked})
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minPrice">Minimum Price</Label>
              <Input
                id="minPrice"
                type="number"
                value={formData.minPrice}
                onChange={(e) => setFormData({...formData, minPrice: parseInt(e.target.value)})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPrice">Maximum Price</Label>
              <Input
                id="maxPrice"
                type="number"
                value={formData.maxPrice}
                onChange={(e) => setFormData({...formData, maxPrice: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <Button type="submit">Save Changes</Button>
        </form>
      </CardContent>
    </Card>
  );
}