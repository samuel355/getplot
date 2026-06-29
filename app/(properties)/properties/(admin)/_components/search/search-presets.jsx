import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Save, BookmarkIcon, MoreVertical, Trash } from "lucide-react";
import useAdvancedSearchStore from "../../_store/useAdvancedSearchStore";
import { useToast } from "@/hooks/use-toast";

export function SearchPresets() {
  const { savedPresets, savePreset, loadPreset, deletePreset } =
    useAdvancedSearchStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const { toast } = useToast();

  const handleSavePreset = () => {
    if (!presetName.trim()) return;

    savePreset(presetName);
    setPresetName("");
    setIsDialogOpen(false);

    toast({
      title: "Preset Saved",
      description: "Your search preset has been saved",
    });
  };

  const handleDeletePreset = (presetId, presetName) => {
    deletePreset(presetId);

    toast({
      title: "Preset Deleted",
      description: `"${presetName}" has been deleted`,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Save Current Filters
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Search Preset</DialogTitle>
            <DialogDescription>
              Give your search preset a name to save it for later use.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Preset name"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePreset}>Save Preset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {savedPresets.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <BookmarkIcon className="h-4 w-4 mr-2" />
              Saved Presets
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Your Presets</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {savedPresets.map((preset) => (
              <DropdownMenuItem
                key={preset.id}
                className="flex items-center justify-between"
              >
                <button
                  onClick={() => loadPreset(preset.id)}
                  className="flex-1 text-left"
                >
                  {preset.name}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePreset(preset.id, preset.name);
                  }}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
