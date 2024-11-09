import { supabase } from "@/utils/supabase/client";

export async function GET(req) {
  try {
    const { data: interestedClients, error } = await supabase.from('dar_es_salaam_interests').select('*');
    if(error){
      console.log(error)
    }
    console.log(JSON.stringify(interestedClients));
    return new Response(JSON.stringify(interestedClients), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
