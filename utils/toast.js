import { useToast } from "@/hooks/use-toast";


// We'll export a hook that can be used in components
export const useFavoriteToasts = () => {
  const { toast } = useToast();
  
  return {
    addedToFavorites: (property) => {
      toast({
        title: "Added to Favorites",
        description: property.title,
        variant: "default",
        duration: 3000,
      });
    },
    
    removedFromFavorites: (property) => {
      toast({
        title: "Removed from Favorites",
        description: property.title,
        variant: "default",
        duration: 3000,
      });
    },
    
    error: (message) => {
      toast({
        title: "Error",
        description: message || "Something went wrong",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
};