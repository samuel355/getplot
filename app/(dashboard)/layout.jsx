import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Sidebar from "@/app/_components/nav/Sidebar";
import {
  AUTO_SYSADMIN_ROLE,
  ensureAutoSysadminMetadata,
  getEffectiveRole,
} from "@/lib/autoApproval";

export default async function DashboardLayout({ children }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const role = getEffectiveRole(user);
  if (role === AUTO_SYSADMIN_ROLE && user?.publicMetadata?.role !== AUTO_SYSADMIN_ROLE) {
    const client = await clerkClient();
    await ensureAutoSysadminMetadata(client, user);
  }
  if (role !== "sysadmin" && role !== "admin") redirect("/unauthorized");

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role={role} />
      <main className="flex-1 md:ml-64 pt-14 md:pt-0">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
