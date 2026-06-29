import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getPortalPath } from "@/lib/roles";
import { MapPin, Clock } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";

export default async function ApprovalPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const role = user.publicMetadata?.role;
  if (role) redirect(getPortalPath(role));

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
          <div className="w-14 h-14 bg-[#05014c]/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Clock className="w-7 h-7 text-[#05014c]" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Account Pending</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Your account has been created. An administrator will review your account and assign you a role shortly.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-left mb-6">
            <p className="text-xs text-gray-400 mb-1">Signed in as</p>
            <p className="text-sm font-medium text-gray-800">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500">{user.emailAddresses?.[0]?.emailAddress}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/" className="w-full text-center text-sm bg-[#05014c] text-white font-medium py-2.5 rounded-xl hover:bg-[#05014c]/90 transition-colors">
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
