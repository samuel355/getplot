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
      <div className="flex min-h-screen flex-col w-full">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-4 md:p-6 mt-16">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
