import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const user = await currentUser();
    console.log('current user id', user?.id);
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fixed: Added const/let and proper array syntax
    const acceptedRoles = ['sysadmin', 'admin', 'property_agent', 'chief', 'chief_asst'];
    const userRole = user.publicMetadata?.role;
    const userArea = user.publicMetadata?.area;
    const userEmail =
      user.primaryEmailAddress?.emailAddress ||
      user.emailAddresses?.[0]?.emailAddress;
    
    // Treat specific email as auto‑approved, otherwise fall back to role check
    const isApproved =
      userEmail === 'samueloseiboatenglistowell57@gmail.com' ||
      (userRole && acceptedRoles.includes(userRole));

    const response = {
      isApproved: !!isApproved,
      area: userArea,
      role: userRole,
      lastChecked: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in approval status API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}