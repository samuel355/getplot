import { NextResponse } from 'next/server';
import { auth, clerkClient, currentUser } from '@clerk/nextjs/server';
import { getOrSetCache } from '@/lib/redis';

const acceptedRoles = ['sysadmin', 'admin', 'property_agent', 'chief', 'chief_asst'];
const AUTO_APPROVED_EMAIL = 'samueloseiboatenglistowell57@gmail.com';

function buildApprovalResponse(user) {
  const userRole = user.publicMetadata?.role;
  const userArea = user.publicMetadata?.area;
  const userEmail =
    user.primaryEmailAddress?.emailAddress ||
    user.emailAddresses?.[0]?.emailAddress;

  const isApproved =
    userEmail === AUTO_APPROVED_EMAIL ||
    (userRole && acceptedRoles.includes(userRole));

  return {
    isApproved: !!isApproved,
    area: userArea,
    role: userRole,
    lastChecked: new Date().toISOString(),
  };
}

export async function GET() {
  try {
    // Web: session cookie via currentUser()
    let user = await currentUser();

    // Mobile: Authorization: Bearer <session JWT> from @clerk/clerk-expo getToken()
    if (!user) {
      const { userId } = await auth({
        acceptsToken: ['session_token', 'oauth_token'],
      });
      if (userId) {
        // Use cached clerk user when available to avoid repeated network calls
        user = await getOrSetCache(
          `clerk:user:${userId}`,
          async () => {
            const client = await clerkClient();
            return await client.users.getUser(userId);
          },
          60 // short cache for 1 minute
        );
      }
    } else if (user?.id) {
      // Optionally warm the cache for the current user
      getOrSetCache(`clerk:user:${user.id}`, async () => user, 60).catch(() => {});
    }

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    return NextResponse.json(buildApprovalResponse(user));
  } catch (error) {
    console.error('Error in approval status API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
