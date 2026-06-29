import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border shadow-sm p-8 text-center">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldX className="w-7 h-7 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-sm text-gray-500 mb-6">
          You don&apos;t have permission to view this page. Contact your administrator if you think this is a mistake.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center w-full bg-[#05014c] text-white text-sm font-medium py-2.5 rounded-xl hover:bg-[#05014c]/90 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
