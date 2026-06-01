import { NextResponse } from 'next/server';
import { clearCache } from '@/lib/redis';
import { auth } from '@clerk/nextjs/server';

export async function POST(request) {
  try {
    const { userId, orgRole } = await auth();

    // Simple authorization check
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { key, usePattern } = await request.json();

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    await clearCache(key, usePattern);

    return NextResponse.json({ success: true, message: `Cache cleared for ${key}` });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
