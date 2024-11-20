import { supabase } from "@/utils/supabase/client";

export const updatePlotStatus = async (
  databaseName,
  id,
  firstname,
  lastname,
  email,
  phone,
) => {
  //Change the status for on hold for client for 50 hours and change it back to Available
  const { data, error } = await supabase
    .from(databaseName)
    .update({
      status: "On Hold",
      firstname: firstname,
      lastname: lastname,
      email: email,
      phone: phone
    })
    .eq("id", id);
  if (error) {
    console.log("changing reserve plot status error:", error);
  }
  if (data) {
    console.log("success update");
  }
};
