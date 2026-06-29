import UserManagement from "./_components/UserManagement";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">View all users, assign roles and manage site access.</p>
      </div>
      <UserManagement />
    </div>
  );
}
