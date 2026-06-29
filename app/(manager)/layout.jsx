import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Sidebar from "@/app/_components/nav/Sidebar";
import { getUserSites } from "@/lib/roles";

export default async function ManagerLayout({ children }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const role = user?.publicMetadata?.role;
  const managerRoles = ["land_manager", "chief", "chief_asst"];
  if (!managerRoles.includes(role) && role !== "sysadmin" && role !== "admin") {
    redirect("/unauthorized");
  }

  const assignedSites = getUserSites(user);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role={managerRoles.includes(role) ? role : "land_manager"} assignedSites={assignedSites} />
      <main className="flex-1 md:ml-64 pt-14 md:pt-0">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
