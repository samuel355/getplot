"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";
import { getSiteBySlug } from "@/lib/sites";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, HeartHandshake, Loader2, MapPin } from "lucide-react";
import { toast } from "react-toastify";
import CountrySelect from "@/app/_components/ui/CountrySelect";
import { formatCalculatedPlotSize } from "@/lib/plotGeometry";

export default function ExpressInterestPage() {
  const { slug, id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const embedded = searchParams.get("embedded") === "1";
  const site = getSiteBySlug(slug);

  const [plot, setPlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    country: "",
    message: "",
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

  const plotNo = plot?.properties?.Plot_No ?? id;
  const plotAmount = plot?.plotTotalAmount ?? plot?.properties?.plotAmount ?? 0;
  const plotSize = formatCalculatedPlotSize(plot);

  const validate = () => {
    const required = ["firstname", "lastname", "email", "phone"];
    for (const key of required) {
      if (!form[key].trim()) { toast.error(`Please fill in ${key}`); return false; }
    }
    if (!/^\S+@\S+\.\S+/.test(form.email)) { toast.error("Enter a valid email"); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      // 1. Save to interests table
      const interestsTable = `${site.table}_interests`;
      const { error: insertError } = await supabase.from(interestsTable).insert({
        firstname: form.firstname,
        lastname: form.lastname,
        email: form.email,
        phone: form.phone,
        country: form.country,
        plot_number: plotNo,
        plot_name: site.name,
        plot_amount: plotAmount,
        message: form.message,
      });
      if (insertError) throw insertError;

      // 2. Email admin
      const emailResponse = await fetch("/api/mail-from-interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: form.firstname,
          lastname: form.lastname,
          email: form.email,
          phone: form.phone,
          country: form.country,
          plot_number: `Plot No. ${plotNo}`,
          plot_name: site.name,
          plot_amount: plotAmount ? `GHS ${Number(plotAmount).toLocaleString()}` : "Contact team",
          message: form.message || "No message provided",
        }),
      });
      if (!emailResponse.ok) throw new Error("Could not send interest email");

      // 3. SMS to user
      const smsResponse = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: form.phone,
          message: `Hi ${form.firstname}, thank you for your interest in Plot No. ${plotNo} at ${site.name}. Our team will contact you shortly. Call 0322008282 / +233 54 855 4216 for immediate assistance.`,
        }),
      });
      if (!smsResponse.ok) throw new Error("Could not send interest confirmation");

      const alertResponse = await fetch("/api/company-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: `New plot interest: Plot ${plotNo}`,
          message: [
            "New plot interest",
            `Client: ${form.firstname} ${form.lastname}`,
            `Phone: ${form.phone}`,
            `Email: ${form.email}`,
            `Country: ${form.country || "N/A"}`,
            `Plot: Plot No. ${plotNo} at ${site.name}`,
            `Amount: ${plotAmount ? `GHS ${Number(plotAmount).toLocaleString()}` : "Contact team"}`,
            `Message: ${form.message || "No message provided"}`,
          ].join("\n"),
        }),
      });
      if (!alertResponse.ok) throw new Error("Could not notify the sales team");

      if (embedded && window.parent !== window) {
        window.parent.postMessage({ type: "plot-action-complete", action: "interest" }, window.location.origin);
      } else {
        setDone(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!site || !plot) return null;

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Interest Submitted</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            Thank you, <strong>{form.firstname}</strong>! We have received your interest in Plot No.{" "}
            <strong>{plotNo}</strong> at {site.name}. Check your phone for a confirmation SMS. Our team will reach out shortly.
          </p>
          <Link
            href={`/sites/${slug}`}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy/90"
          >
            <MapPin className="w-4 h-4" /> Back to {site.name}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link
          href={`/sites/${slug}`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {site.name}
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-brand-navy rounded-lg flex items-center justify-center">
            <HeartHandshake className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Express Interest</h1>
            <p className="text-sm text-gray-500">{site.name} · Plot No. {plotNo}</p>
          </div>
        </div>

        {/* Plot summary */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-6 flex flex-wrap gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Plot</p>
            <p className="font-semibold text-gray-900">No. {plotNo}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Site</p>
            <p className="font-semibold text-gray-900">{site.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Plot size</p>
            <p className="font-semibold text-gray-900">{plotSize}</p>
          </div>
          {plotAmount > 0 && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Price</p>
              <p className="font-semibold text-gray-900">GHS {Number(plotAmount).toLocaleString()}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Your Information</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="First Name" name="firstname" value={form.firstname} onChange={field} />
            <FormField label="Last Name" name="lastname" value={form.lastname} onChange={field} />
          </div>

          <FormField label="Email Address" name="email" type="email" value={form.email} onChange={field} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Phone Number" name="phone" type="tel" value={form.phone} onChange={field} placeholder="+233..." />
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Country</label>
              <CountrySelect value={form.country} onChange={(val) => setForm((f) => ({ ...f, country: val }))} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Message <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={field}
              rows={4}
              placeholder="Tell us more about your interest in this plot — budget, timeline, questions..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            After submitting, you will receive an SMS confirmation on the number provided. Our team will contact you within 24 hours.
          </p>

          <div className="flex justify-between pt-2 border-t">
            <Link href={`/sites/${slug}`}>
              <Button type="button" variant="outline">
                <ArrowLeft className="w-4 h-4 mr-1" /> Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-brand-navy hover:bg-brand-navy/90 text-white"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <HeartHandshake className="w-4 h-4 mr-1" />}
              Submit Interest
            </Button>
          </div>
        </form>
      </div>
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
      <Loader2 className="w-8 h-8 text-brand-navy animate-spin" />
    </div>
  );
}
