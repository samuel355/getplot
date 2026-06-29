"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";
import { getSiteBySlug } from "@/lib/sites";
import { reservePlot } from "@/app/_actions/reserve-plot";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2, MapPin } from "lucide-react";
import { toast } from "react-toastify";
import CountrySelect from "@/app/_components/ui/CountrySelect";

const STEPS = ["Plot Details", "Your Info", "Confirm"];

export default function ReservePlotPage() {
  const { slug, id } = useParams();
  const router = useRouter();
  const site = getSiteBySlug(slug);

  const [step, setStep] = useState(0);
  const [plot, setPlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    country: "",
    residentialAddress: "",
    agent: "",
    initialDeposit: "",
  });

  useEffect(() => {
    if (!site) { router.push("/"); return; }
    fetchPlot();
  }, []);

  const fetchPlot = async () => {
    const { data, error } = await supabase.from(site.table).select("*").eq("id", id).single();
    if (error || !data) {
      toast.error("Plot not found");
      router.push(`/sites/${slug}`);
      return;
    }
    setPlot(data);
    setLoading(false);
  };

  const field = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const plotAmount = plot?.plotTotalAmount ?? plot?.properties?.plotAmount ?? 0;
  const minDeposit = plotAmount * 0.25;
  const plotNo = plot?.properties?.Plot_No ?? id;
  const plotSize = plot?.properties?.Area ?? plot?.properties?.Shape_Length ?? 0;

  const validateStep0 = () => {
    if (!plotAmount) { toast.error("Plot price not set — contact admin"); return false; }
    const dep = parseFloat(form.initialDeposit);
    if (!dep || dep < minDeposit) {
      toast.error(`Minimum deposit is GHS ${minDeposit.toLocaleString()}`);
      return false;
    }
    if (dep > plotAmount) { toast.error("Deposit cannot exceed plot amount"); return false; }
    return true;
  };

  const validateStep1 = () => {
    const required = ["firstname", "lastname", "email", "phone", "country", "residentialAddress"];
    for (const key of required) {
      if (!form[key]) { toast.error(`Please fill in ${key}`); return false; }
    }
    if (form.phone.length !== 10) { toast.error("Phone must be 10 digits"); return false; }
    return true;
  };

  const handleNext = () => {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await reservePlot(
      plot,
      plotAmount,
      parseFloat(form.initialDeposit),
      setSubmitting,
      router,
      site.table,
      id,
      form.email,
      form.firstname,
      form.lastname,
      form.phone,
      form.country,
      form.residentialAddress
    );
  };

  if (loading) return <PageLoader />;
  if (!site || !plot) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Back */}
        <Link href={`/sites/${slug}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to {site.name}
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#05014c] rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Reserve Plot</h1>
            <p className="text-sm text-gray-500">{site.name} · Plot No. {plotNo}</p>
          </div>
        </div>

        {/* Stepper */}
        <Stepper steps={STEPS} current={step} />

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mt-6">
          {/* Step 0: Plot details */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="font-semibold text-gray-900">Plot Information</h2>
              <InfoRow label="Plot Number" value={`Plot No. ${plotNo}`} />
              <InfoRow label="Size" value={`${parseFloat(plotSize).toFixed(3)} Acres`} />
              <InfoRow label="Total Amount" value={`GHS ${Number(plotAmount).toLocaleString()}`} />
              <InfoRow label="Minimum Deposit (25%)" value={`GHS ${Number(minDeposit).toLocaleString()}`} />
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Your Initial Deposit (GHS)
                </label>
                <Input
                  name="initialDeposit"
                  type="number"
                  placeholder={`Min. GHS ${minDeposit.toLocaleString()}`}
                  value={form.initialDeposit}
                  onChange={field}
                />
              </div>
            </div>
          )}

          {/* Step 1: Client info */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-semibold text-gray-900">Your Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="First Name" name="firstname" value={form.firstname} onChange={field} />
                <FormField label="Last Name" name="lastname" value={form.lastname} onChange={field} />
              </div>
              <FormField label="Email Address" name="email" type="email" value={form.email} onChange={field} />
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Phone (10 digits)" name="phone" type="number" value={form.phone} onChange={field} />
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Country</label>
                  <CountrySelect value={form.country} onChange={(val) => setForm((f) => ({ ...f, country: val }))} />
                </div>
              </div>
              <FormField label="Residential Address" name="residentialAddress" value={form.residentialAddress} onChange={field} />
              <FormField label="Agent (optional)" name="agent" value={form.agent} onChange={field} />
            </div>
          )}

          {/* Step 2: Confirm */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-semibold text-gray-900">Confirm Details</h2>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Plot</p>
                <InfoRow label="Plot No." value={`Plot No. ${plotNo}`} />
                <InfoRow label="Site" value={site.name} />
                <InfoRow label="Total Amount" value={`GHS ${Number(plotAmount).toLocaleString()}`} />
                <InfoRow label="Initial Deposit" value={`GHS ${Number(form.initialDeposit).toLocaleString()}`} />
              </div>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Client</p>
                <InfoRow label="Name" value={`${form.firstname} ${form.lastname}`} />
                <InfoRow label="Email" value={form.email} />
                <InfoRow label="Phone" value={form.phone} />
                <InfoRow label="Country" value={form.country} />
                <InfoRow label="Address" value={form.residentialAddress} />
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                By reserving, you acknowledge that payment must be made to the provided bank accounts. Your plot will be held pending payment confirmation.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-4 border-t">
            <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            {step < 2 ? (
              <Button onClick={handleNext} className="bg-[#05014c] hover:bg-[#05014c]/90">
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting} className="bg-orange-400 hover:bg-orange-500">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Confirm Reservation
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stepper({ steps, current }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${i <= current ? "bg-[#05014c] text-white" : "bg-gray-200 text-gray-400"}`}>
              {i + 1}
            </div>
            <span className={`text-xs mt-1 ${i <= current ? "text-[#05014c] font-medium" : "text-gray-400"}`}>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < current ? "bg-[#05014c]" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}

function FormField({ label, name, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1.5">{label}</label>
      <Input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  );
}

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#05014c] animate-spin" />
    </div>
  );
}
