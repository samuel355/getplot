"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, X } from "lucide-react";
import { toast } from "react-toastify";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const field = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/receive-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || "Message could not be sent");
      }

      setSent(true);
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message. Try calling us directly.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Full Name *</label>
          <Input name="name" value={form.name} onChange={field} placeholder="John Mensah" autoComplete="name" required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Email *</label>
          <Input name="email" type="email" value={form.email} onChange={field} placeholder="john@example.com" autoComplete="email" required />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone</label>
        <Input name="phone" type="tel" value={form.phone} onChange={field} placeholder="0200000000" autoComplete="tel" />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">Message *</label>
        <Textarea
          name="message"
          value={form.message}
          onChange={field}
          placeholder="Tell us about the plot you're interested in or your question…"
          rows={5}
          required
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-navy hover:bg-brand-navy/90 text-white font-semibold py-2.5"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Send Message
      </Button>
    </form>
    {sent ? (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-navy/55 px-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-success-title"
        onClick={() => setSent(false)}
      >
        <div
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-white p-7 text-center shadow-2xl sm:p-9"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setSent(false)}
            className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close confirmation"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/60">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-teal">Message received</p>
          <h3 id="contact-success-title" className="text-2xl font-bold text-brand-navy">
            Thank you for contacting us!
          </h3>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">
            Your message has reached the GetOnePlot team. We&apos;ll review your enquiry and respond to you as soon as possible.
          </p>
          <Button
            type="button"
            onClick={() => setSent(false)}
            className="mt-7 w-full bg-brand-navy font-semibold text-white hover:bg-brand-navy/90"
          >
            Done
          </Button>
        </div>
      </div>
    ) : null}
    </>
  );
}
