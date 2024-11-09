import { supabase } from "@/utils/supabase/client";

export async function POST(request) {
  try {
    const { databaseName } = await request.json();
    const { data: interestedClients, error } = await supabase
      .from(databaseName)
      .select("*");
    if (error) {
      console.log(error);
    }
    return new Response(JSON.stringify(interestedClients), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
