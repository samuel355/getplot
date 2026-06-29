import React from "react";
import PublicHeader from "@/app/_components/nav/PublicHeader";
import Footer from "@/app/_components/Footer";

export const metadata = {
  title: "Privacy Policy | GetOnePlot",
  description: "Comprehensive Privacy Policy for GetOnePlot by Land and Homes Consult",
};

const PrivacyPolicy = () => {
  const lastUpdated = "May 25, 2026";

  return (
    <div className="flex flex-col min-h-screen w-full">
      <PublicHeader />
      <main className="flex-grow pt-24 md:pt-32 bg-gray-50/30">
        <div className="max-w-4xl mx-auto px-6 py-16 bg-white shadow-sm border border-gray-100 rounded-xl my-8">
          <header className="border-b border-gray-100 pb-8 mb-12">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Privacy Policy
            </h1>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">
              Effective Date: {lastUpdated}
            </p>
          </header>

          <div className="prose prose-slate max-w-none space-y-10 text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">1. Scope and Ownership</h2>
              <p>
                This Privacy Policy describes the practices of{" "}
                <span className="font-semibold text-slate-900">GetOnePlot</span> (the "Platform"),
                which is exclusively owned and operated by{" "}
                <span className="font-semibold text-slate-900">Land and Homes Consult (LHC)</span>,
                a registered real estate and land management firm headquartered in Kumasi, Ghana. We
                respect your privacy and are committed to protecting the personal data we process in
                compliance with the{" "}
                <span className="italic">Data Protection Act, 2012 (Act 843)</span> of Ghana and
                other applicable international privacy standards.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">2. Information We Collect</h2>
              <p className="mb-4">
                To provide our land acquisition and management services effectively, we collect the
                following categories of information:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
                <div className="p-5 bg-slate-50 rounded-lg border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-2">Personal Identification</h3>
                  <p className="text-sm text-slate-600">
                    Legal name, email address, primary phone number, and physical residential
                    address for contract preparation and KYC compliance.
                  </p>
                </div>
                <div className="p-5 bg-slate-50 rounded-lg border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-2">Technical & Usage Data</h3>
                  <p className="text-sm text-slate-600">
                    IP addresses, device identifiers, and geographic location data used to provide
                    site-specific mapping and plot visualization.
                  </p>
                </div>
                <div className="p-5 bg-slate-50 rounded-lg border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-2">Authentication Data</h3>
                  <p className="text-sm text-slate-600">
                    Login credentials and profile information managed through our identity provider,
                    Clerk.
                  </p>
                </div>
                <div className="p-5 bg-slate-50 rounded-lg border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-2">Financial Records</h3>
                  <p className="text-sm text-slate-600">
                    Transaction history and reservation statuses. Note: Raw payment card data is
                    processed exclusively by Paystack and is never stored on our servers.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                3. Legal Basis and Purpose of Processing
              </h2>
              <p className="mb-4">We process your data under the following legal frameworks:</p>
              <ul className="list-disc pl-6 space-y-3">
                <li>
                  <span className="font-bold text-slate-900">Contractual Necessity:</span>{" "}
                  Processing required to facilitate land sale agreements, lease preparations, and
                  plot reservations.
                </li>
                <li>
                  <span className="font-bold text-slate-900">Legal Obligation:</span> Compliance
                  with Ghanaian land registration laws, tax regulations, and anti-money laundering
                  (AML) statutes.
                </li>
                <li>
                  <span className="font-bold text-slate-900">Legitimate Interest:</span> Improving
                  platform performance, preventing fraudulent listings, and ensuring the security of
                  our infrastructure.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                4. Data Retention and Security
              </h2>
              <p>
                We retain personal information only for as long as necessary to fulfill the purposes
                for which it was collected, including for the purposes of satisfying any legal,
                accounting, or reporting requirements. For land transactions, certain records must
                be retained indefinitely to verify ownership and title history in accordance with
                Ghanaian Land Commission standards.
              </p>
              <p className="mt-4">
                We implement industry-standard technical and organizational measures—including
                end-to-end encryption for data in transit and secure database partitioning through
                Supabase—to safeguard your information against unauthorized access or disclosure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">5. Third-Party Disclosures</h2>
              <p>
                We share information with third-party service providers only to the extent necessary
                to deliver our services:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <span className="font-semibold text-slate-900">Clerk:</span> For secure
                  authentication and session management.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">Paystack:</span> For secure
                  processing of Ghana Cedi (GHS) and USD transactions.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">Supabase:</span> For encrypted
                  cloud storage and data management.
                </li>
                <li>
                  <span className="font-semibold text-slate-900">Government Authorities:</span> When
                  legally compelled for land registration, taxation, or law enforcement purposes.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                6. Your Rights and Data Deletion
              </h2>
              <p className="mb-4">
                Under applicable data protection laws, you possess the following rights:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>The right to access and receive a copy of your personal data.</li>
                <li>The right to rectify inaccurate or incomplete information.</li>
                <li>The right to object to or restrict certain processing activities.</li>
                <li>The right to data portability.</li>
              </ul>
              <div className="bg-amber-50 p-6 rounded-lg border border-amber-100">
                <h3 className="text-lg font-bold text-amber-900 mb-2">Account Deletion Protocol</h3>
                <p className="text-amber-800 text-sm mb-4">
                  Users may request the permanent deletion of their account at any time through the
                  mobile app's profile settings or via direct written request. Please note that
                  certain transaction records related to land titles and legal leases cannot be
                  deleted due to statutory requirements in Ghana.
                </p>
                <a
                  href="mailto:support@getoneplot.com"
                  className="inline-flex items-center text-amber-900 font-bold hover:underline"
                >
                  Initiate Deletion Request →
                </a>
              </div>
            </section>

            <section className="border-t border-gray-100 pt-10">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                7. Contact and Data Controller
              </h2>
              <p className="text-slate-600 italic">
                For inquiries regarding this Privacy Policy or to exercise your data rights, please
                contact the Data Protection Officer at:
              </p>
              <div className="mt-6 p-6 bg-slate-900 rounded-xl text-slate-100">
                <p className="font-bold text-lg mb-1">Land and Homes Consult</p>
                <p className="opacity-80">Off-Manhyia Road, Dichemso</p>
                <p className="opacity-80">Kumasi, Ashanti Region, Ghana</p>
                <div className="mt-4 space-y-1">
                  <p>
                    <span className="font-semibold">Email:</span> info@landandhomesconsult.com
                  </p>
                  <p>
                    <span className="font-semibold">Phone:</span> +233 54 855 4216 / +233 32 200
                    8282
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
