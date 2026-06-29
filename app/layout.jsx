import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import ClientToasters from "@/app/_components/ClientToasters";
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
          <ClientToasters />
        </body>
      </html>
    </ClerkProvider>
  );
}
