
import AuthCheck from "@/app/_components/AuthCheck";
import AdminLayout from "../_components/admin-layout";

export default function SystemLogsPage() {
  return <AuthCheck>
    <AdminLayout>
    <h1 className="text-3xl font-bold mb-8">System Logs</h1>
    </AdminLayout>
  </AuthCheck>;
}
