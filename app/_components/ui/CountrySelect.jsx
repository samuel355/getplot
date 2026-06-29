"use client";

import OptGroup from "@/app/(dashboard)/dashboard/_components/OptGroup";

export default function CountrySelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <option value="">Select Country</option>
      <option value="Ghana (+233)">Ghana (+233)</option>
      <OptGroup />
    </select>
  );
}
