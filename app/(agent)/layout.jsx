import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Sidebar from "@/app/_components/nav/Sidebar";

export default async function AgentLayout({ children }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const role = user?.publicMetadata?.role;
  if (role !== "agent" && role !== "sysadmin") redirect("/unauthorized");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="agent" />
      <main className="flex-1 md:ml-64 pt-14 md:pt-0">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
