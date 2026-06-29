import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function MessagePage({ searchParams }) {
  const redirect = searchParams?.redirect ?? "/";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border shadow-sm p-8 text-center">
        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-green-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Request Received!</h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          Thank you! We&apos;ve received your request and sent you an email with our bank account details. Please make your payment and visit our office with your receipt.
        </p>
        <p className="text-xs text-gray-400 mb-6">
          For enquiries: <span className="text-gray-700 font-medium">0322008282 / +233 54 855 4216</span>
        </p>
        <Link
          href={redirect}
          className="inline-flex items-center justify-center w-full bg-[#05014c] text-white text-sm font-medium py-2.5 rounded-xl hover:bg-[#05014c]/90 transition-colors"
        >
          Back to Site
        </Link>
      </div>
    </div>
  );
}
