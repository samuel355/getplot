import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import PropertyTable from "./property-table";
import { useToast } from "@/components/hooks/use-toast";

export default function UserProperties({ userId }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProperties = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setProperties(data);
      } catch (error) {
        console.error("Error fetching user properties:", error);
        toast({
          title: "Error",
          description: "Failed to load user properties",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProperties();
    }
  }, [userId, toast]);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">User Properties</h2>
      {properties.length === 0 ? (
        <p className="text-muted-foreground">This user has no properties listed.</p>
      ) : (
        <PropertyTable properties={properties} hideActions />
      )}
    </div>
  );
}