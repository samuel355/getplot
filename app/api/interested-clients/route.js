import { supabase } from "@/utils/supabase/client";
import { getOrSetCache } from '@/lib/redis';

export async function POST(request) {
  try {
    const { databaseName } = await request.json();
    if (!databaseName) {
      return new Response(JSON.stringify({ error: 'databaseName is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const interestedClients = await getOrSetCache(
      `interested:${databaseName}`,
      async () => {
        const { data, error } = await supabase.from(databaseName).select("*");
        if (error) throw error;
        return data;
      },
      300 // cache for 5 minutes
    );

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
