"use client";

import dynamic from "next/dynamic";

const SonnerToaster = dynamic(
  () => import("@/components/ui/sonner").then((mod) => mod.Toaster),
  { ssr: false },
);
const UiToaster = dynamic(
  () => import("@/components/ui/toaster").then((mod) => mod.Toaster),
  { ssr: false },
);
const ToastContainer = dynamic(
  () => import("react-toastify").then((mod) => mod.ToastContainer),
  { ssr: false },
);

export default function ClientToasters() {
  return (
    <>
      <SonnerToaster />
      <UiToaster />
      <ToastContainer position="top-right" autoClose={4000} />
    </>
  );
}
