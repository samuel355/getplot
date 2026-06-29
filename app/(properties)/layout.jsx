import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Header from "./properties/components/header";
import Sidebar from "./properties/components/sidebar";
import { SidebarProvider } from "./properties/contexts/sidebar-context";

export default async function PropertiesLayout({ children }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const role = user?.publicMetadata?.role;

  if (!role) redirect("/approval");

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex flex-1 flex-col min-h-screen">
          <Header />
          <div className="h-16 shrink-0" />
          <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
