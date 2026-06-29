import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as NewToaster } from "@/components/ui/toaster";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
  title: "GetOnePlot — Ghana Land & Property",
  description: "Browse verified land plots and property listings across Ghana.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      signOutUrl="/"
      signInUrl="/sign-in"
      signInForceRedirectUrl="/approval"
      signUpForceRedirectUrl="/approval"
      afterSignOutUrl="/"
    >
      <html lang="en">
        <body className="font-[Outfit,sans-serif] antialiased">
          {children}
          <Toaster />
          <NewToaster />
          <ToastContainer position="top-right" autoClose={4000} />
        </body>
      </html>
    </ClerkProvider>
  );
}
