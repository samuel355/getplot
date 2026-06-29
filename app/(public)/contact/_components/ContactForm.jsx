"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const field = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/receive-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSent(true);
    } catch {
      toast.error("Failed to send message. Try calling us directly.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-14 h-14 bg-green-50 rounded-lg flex items-center justify-center mb-4">
          <CheckCircle className="w-7 h-7 text-green-500" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">Message Sent!</h3>
        <p className="text-sm text-gray-500">We&apos;ll get back to you within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Full Name *</label>
          <Input name="name" value={form.name} onChange={field} placeholder="John Mensah" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Email *</label>
          <Input name="email" type="email" value={form.email} onChange={field} placeholder="john@example.com" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone</label>
        <Input name="phone" value={form.phone} onChange={field} placeholder="0200000000" />
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-1.5">Message *</label>
        <Textarea
          name="message"
          value={form.message}
          onChange={field}
          placeholder="Tell us about the plot you're interested in or your question…"
          rows={5}
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
  );
}
