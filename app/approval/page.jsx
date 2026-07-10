import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getPortalPath } from "@/lib/roles";
import {
  AUTO_SYSADMIN_ROLE,
  ensureAutoSysadminMetadata,
  getEffectiveRole,
} from "@/lib/autoApproval";
import { Clock } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { LogoLateral } from "@/app/_components/Logo";

export default async function ApprovalPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const role = getEffectiveRole(user);
  if (role === AUTO_SYSADMIN_ROLE && user.publicMetadata?.role !== AUTO_SYSADMIN_ROLE) {
    const client = await clerkClient();
    await ensureAutoSysadminMetadata(client, user);
  }
  if (role) redirect(getPortalPath(role));

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-8">
          <LogoLateral variant="dark" height={30} />
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="w-14 h-14 bg-brand-navy/5 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Clock className="w-7 h-7 text-brand-navy" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Account Pending</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Your account has been created. An administrator will review your account and assign you a role shortly.
          </p>
          <div className="bg-slate-50 rounded-lg p-4 text-left mb-6">
            <p className="text-xs text-gray-400 mb-1">Signed in as</p>
            <p className="text-sm font-medium text-gray-800">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500">{user.emailAddresses?.[0]?.emailAddress}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/" className="w-full text-center text-sm bg-brand-navy text-white font-medium py-2.5 rounded-lg hover:bg-brand-navy/90 transition-colors">
              Browse Sites
            </Link>
            <SignOutButton>
              <button className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors">
                Sign out
              </button>
            </SignOutButton>
          </div>
        </div>
      </div>
    </div>
  );
}
