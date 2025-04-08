import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useSettingsStore from "../../_store/useSettingsStore";
import { useToast } from "@/components/hooks/use-toast";

export function EmailSettings() {
  const { settings, updateSettings, updateEmailTemplate } = useSettingsStore();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState('propertyApproved');
  const [templateContent, setTemplateContent] = useState(
    settings.email.templates[selectedTemplate] || ''
  );
  const [notifications, setNotifications] = useState(settings.email.notifications);

  const handleTemplateUpdate = async () => {
    const result = await updateEmailTemplate(selectedTemplate, templateContent);
    
    if (result.success) {
      toast({
        title: "Template Updated",
        description: "Email template has been saved successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update email template",
        variant: "destructive",
      });
    }
  };

  const handleNotificationUpdate = async () => {
    const result = await updateSettings('email', { notifications });
    
    if (result.success) {
      toast({
        title: "Settings Updated",
        description: "Email notification settings have been saved",
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="propertyApproved">Property Approved</Label>
              <Switch
                id="propertyApproved"
                checked={notifications.propertyApproved}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, propertyApproved: checked})
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="propertyRejected">Property Rejected</Label>
              <Switch
                id="propertyRejected"
                checked={notifications.propertyRejected}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, propertyRejected: checked})
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="userBanned">User Banned</Label>
              <Switch
                id="userBanned"
                checked={notifications.userBanned}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, userBanned: checked})
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="userUnbanned">User Unbanned</Label>
              <Switch
                id="userUnbanned"
                checked={notifications.userUnbanned}
                onCheckedChange={(checked) => 
                  setNotifications({...notifications, userUnbanned: checked})
                }
              />
            </div>

            <Button onClick={handleNotificationUpdate}>Save Notification Settings</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Template</Label>
              <Select
                value={selectedTemplate}
                onValueChange={setSelectedTemplate}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="propertyApproved">Property Approved</SelectItem>
                  <SelectItem value="propertyRejected">Property Rejected</SelectItem>
                  <SelectItem value="userBanned">User Banned</SelectItem>
                  <SelectItem value="userUnbanned">User Unbanned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Template Content</Label>
              <Textarea
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
                rows={10}
                className="font-mono"
              />
              <p className="text-sm text-muted-foreground">
                Available variables: {`{{firstName}}, {{lastName}}, {{email}}, {{propertyTitle}}`}
              </p>
            </div>

            <Button onClick={handleTemplateUpdate}>Save Template</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}