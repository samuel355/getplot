import { supabase } from "@/utils/supabase/client";
import { clearCache } from '@/lib/redis';

export const updatePlotStatus = async (
  databaseName,
  plotId,
  firstname,
  lastname,
  email,
  phone,
  country,
  residentialAddress
) => {
  //Change the status for on hold for client for 50 hours and change it back to Available
  const { data, error } = await supabase
    .from(databaseName)
    .update({
      status: "On Hold",
      firstname: firstname,
      lastname: lastname,
      email: email,
      phone: phone,
      country: country,
      residentialAddress: residentialAddress,
    })
    .eq("id", plotId);
  if (error) {
    console.log("changing reserve plot status error:", error);
  }
  if (data) {
    console.log("success update");
    try {
      // Invalidate relevant caches: properties list and specific property detail
      await clearCache('properties:list:*', true);
      await clearCache(`property:detail:${plotId}`);
    } catch (e) {
      console.warn('Failed to clear cache after plot status update', e);
    }
  }
};
