import { createClerkClient } from '@clerk/clerk-sdk-node';
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function POST(request) {
  try {
    const { userId, role } = await request.json();
    
    const user = await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        role: role,
      },
    });

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
