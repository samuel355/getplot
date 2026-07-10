import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Sidebar from "@/app/_components/nav/Sidebar";
import { getEffectiveRole } from "@/lib/autoApproval";

export default async function AgentLayout({ children }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const role = getEffectiveRole(user);
  if (role !== "agent" && role !== "property_agent" && role !== "sysadmin" && role !== "admin") {
    redirect("/unauthorized");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="property_agent" />
      <main className="flex-1 md:ml-64 pt-14 md:pt-0">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
