import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';
import { getOrSetCache } from '@/lib/redis';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    const cacheKey = `property:detail:${id}`;

    const property = await getOrSetCache(cacheKey, async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    }, 600); // Cache for 10 minutes

    return NextResponse.json(property);
  } catch (error) {
    console.error(`Error in /api/properties/${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch property details' },
      { status: 500 }
    );
  }
}
