import React from "react";
import PublicHeader from "@/app/_components/nav/PublicHeader";
import Footer from "@/app/_components/Footer";

export const metadata = {
  title: "Terms of Service | GetOnePlot",
  description: "Official Terms of Service for GetOnePlot by Land and Homes Consult",
};

const TermsOfService = () => {
  const lastUpdated = "May 25, 2026";

  return (
    <div className="flex flex-col min-h-screen w-full">
      <PublicHeader />
      <main className="flex-grow pt-24 md:pt-32 bg-gray-50/30">
        <div className="max-w-4xl mx-auto px-6 py-16 bg-white shadow-sm border border-gray-100 rounded-xl my-8">
          <header className="border-b border-gray-100 pb-8 mb-12">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Terms of Service
            </h1>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">
              Version 1.0 • Last Updated: {lastUpdated}
            </p>
          </header>

          <div className="prose prose-slate max-w-none space-y-10 text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">1. Acceptance of Agreement</h2>
              <p>
                By accessing, browsing, or using the{" "}
                <span className="font-semibold text-slate-900">GetOnePlot</span> website or mobile
                application (collectively, the "Platform"), you acknowledge that you have read,
                understood, and agree to be bound by these Terms of Service. This Platform is owned
                and operated by{" "}
                <span className="font-semibold text-slate-900">Land and Homes Consult (LHC)</span>.
                If you do not agree to these terms, you must immediately cease all use of the
                Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">2. Description of Services</h2>
              <p>
                GetOnePlot acts as a digital intermediary and marketplace providing tools for the
                discovery, visualization, reservation, and purchase of serviced land plots. Services
                include but are not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Interactive mapping and GIS visualization of available land sites.</li>
                <li>Secure plot reservation and initial deposit processing.</li>
                <li>
                  Facilitation of formal land acquisition and documentation through LHC's
                  professional team.
                </li>
                <li>Marketplace listings for verified residential and commercial properties.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                3. Plot Information and Accuracy
              </h2>
              <p>
                All plot dimensions, street names, and geographic data displayed on the Platform are
                based on survey records maintained by Land and Homes Consult. While we strive for
                absolute precision,{" "}
                <span className="italic text-slate-900">
                  all digital plot representations are for informational and guidance purposes only
                </span>
                .
              </p>
              <p className="mt-4 font-medium text-slate-900">
                The final legal dimensions, boundaries, and descriptions of any plot will be
                confirmed and codified in the formal Indenture or Lease document during the title
                acquisition process.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                4. Financial Terms and Payments
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">4.1 Payment Processing</h3>
                  <p>
                    All financial transactions are conducted in Ghana Cedis (GHS) through our secure
                    gateway provider, Paystack. Users are responsible for any currency conversion
                    fees applied by their financial institutions for international payments.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">4.2 Reservation Deposits</h3>
                  <p>
                    A reservation fee (typically 10% of the total plot value) is required to place a
                    "Hold" on a specific plot. This fee constitutes a non-refundable commitment
                    towards the final purchase price, granting the user an exclusive window to
                    finalize the balance payment and legal documentation.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">4.3 Refunds</h3>
                  <p>
                    Refund policies for land purchases are subject to the specific terms outlined in
                    the formal Sale Agreement executed between the buyer and Land and Homes Consult.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                5. Land Documentation and Title
              </h2>
              <p>
                LHC provides comprehensive assistance with land registration and title acquisition.
                The purchase of a plot via the Platform initiates the documentation process, which
                involves:
              </p>
              <ul className="list-decimal pl-6 space-y-2 mt-4 font-medium text-slate-800">
                <li>Preparation of the Site Plan and Cadastral Plan.</li>
                <li>Drafting of the Lease Agreement or Indenture.</li>
                <li>
                  Submission of documents to the Lands Commission for stamping and registration.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">6. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Land and Homes Consult and GetOnePlot shall
                not be liable for any direct, indirect, incidental, or consequential damages
                resulting from the use or inability to use the Platform, including but not limited
                to reliance on plot visualizations or delays in third-party land registration
                processes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">7. Governing Law</h2>
              <p>
                These Terms of Service and any transaction initiated through the Platform shall be
                governed by and construed in accordance with the laws of the{" "}
                <span className="font-bold text-slate-900">Republic of Ghana</span>. Any disputes
                shall be subject to the exclusive jurisdiction of the competent courts in Ghana.
              </p>
            </section>

            <section className="border-t border-gray-100 pt-10">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                8. Corporate Contact Information
              </h2>
              <p className="text-slate-600 mb-6">
                Official notices and legal inquiries should be directed to our corporate
                headquarters:
              </p>
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-2xl">
                <p className="font-extrabold text-xl text-slate-900 mb-2">Land and Homes Consult</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-bold text-slate-500 uppercase tracking-tight mb-1">
                      Headquarters
                    </p>
                    <p>Off-Manhyia Road, Dichemso</p>
                    <p>Kumasi, Ghana</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-500 uppercase tracking-tight mb-1">
                      Digital Reach
                    </p>
                    <p>Email: info@landandhomesconsult.com</p>
                    <p>Web: www.landandhomesconsult.com</p>
                  </div>
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

export default TermsOfService;
