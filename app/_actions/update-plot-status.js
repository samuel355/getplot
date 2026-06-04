import { supabase } from "@/utils/supabase/client";

export const updatePlotStatus = async (
  databaseName,
  plotId,
  firstname,
  lastname,
  email,
  phone,
  country,
  residentialAddress,
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
  } else {
    console.log("success update");
    try {
      // Invalidate relevant caches via API route to avoid bundling Redis lib in client
      await fetch("/api/cache/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "properties:list:*", usePattern: true }),
      });
      await fetch("/api/cache/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: `property:detail:${plotId}`, usePattern: false }),
      });
    } catch (e) {
      console.warn("Failed to clear cache after plot status update", e);
    }
  }
};
