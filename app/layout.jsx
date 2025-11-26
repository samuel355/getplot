import { ClerkProvider } from "@clerk/nextjs";
import { PrimeReactProvider } from "primereact/api";
import "./globals.css";
import Provider from "./Provider";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as NewToaster } from "@/components/ui/toaster";
import ToastMessage from "./_components/ToastMessage";

export const metadata = {
  developer: "Samuel Osei Adu",
  title: "Get One Plot",
  description:
    "Get One Plot, Where listing of properties and land purchase made easy",
};

export default function RootLayout({ children }) {
  return (
    <PrimeReactProvider>
      <ClerkProvider
        signOutUrl="/"
        signInUrl="/sign-in"
        signInForceRedirectUrl="/approval"
        signUpForceRedirectUrl="/approval"
        afterSignOutUrl="/"
      >
        <html lang="en">
          <body>
            <ToastMessage />
            <Provider>{children}</Provider>
            <Toaster />
            <NewToaster />
          </body>
        </html>
      </ClerkProvider>
    </PrimeReactProvider>
  );
}
