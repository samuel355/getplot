"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { SITES } from "@/lib/sites";
import { ROLES } from "@/lib/roles";
import { Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const ROLE_OPTIONS = [
  { value: "", label: "No Role" },
  { value: ROLES.SYSADMIN, label: "System Admin" },
  { value: ROLES.AGENT, label: "Property Agent" },
  { value: ROLES.LAND_MANAGER, label: "Land Manager" },
];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // userId being saved

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/users");
    const json = await res.json();
    setUsers(json?.data ?? []);
    setLoading(false);
  };

  const updateRole = async (userId, role, sites) => {
    setSaving(userId);
    const res = await fetch("/api/edit-user-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role, sites }),
    });
    setSaving(null);
    if (res.ok) {
      toast.success("Role updated");
      fetchUsers();
    } else {
      toast.error("Failed to update role");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-[#05014c] animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {["User", "Email", "Current Role", "Assign Role", "Assign Sites", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-medium text-gray-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                saving={saving === u.id}
                onSave={(role, sites) => updateRole(u.id, role, sites)}
              />
            ))}
            {!users.length && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-gray-400">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserRow({ user, saving, onSave }) {
  const currentRole = user.publicMetadata?.role ?? "";
  const currentSites = user.publicMetadata?.sites ?? [];
  const [role, setRole] = useState(currentRole);
  const [selectedSites, setSelectedSites] = useState(currentSites);

  const toggleSite = (slug) => {
    setSelectedSites((s) => s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug]);
  };

  const dirty = role !== currentRole || JSON.stringify(selectedSites) !== JSON.stringify(currentSites);

  return (
    <tr className="hover:bg-gray-50 transition-colors align-top">
      <td className="px-5 py-4">
        <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
      </td>
      <td className="px-5 py-4 text-gray-500">
        {user.emailAddresses?.[0]?.emailAddress ?? "—"}
      </td>
      <td className="px-5 py-4">
        <RoleBadge role={currentRole} />
      </td>
      <td className="px-5 py-4">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="h-8 px-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#05014c] bg-white"
        >
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </td>
      <td className="px-5 py-4">
        {role === ROLES.LAND_MANAGER ? (
          <div className="space-y-1 max-h-36 overflow-y-auto">
            {SITES.map((s) => (
              <label key={s.slug} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSites.includes(s.slug)}
                  onChange={() => toggleSite(s.slug)}
                  className="accent-[#05014c]"
                />
                <span className="text-xs text-gray-700">{s.name}</span>
              </label>
            ))}
          </div>
        ) : (
          <span className="text-gray-300 text-xs">N/A</span>
        )}
      </td>
      <td className="px-5 py-4">
        <Button
          size="sm"
          onClick={() => onSave(role, selectedSites)}
          disabled={!dirty || saving}
          className="bg-[#05014c] hover:bg-[#05014c]/90 disabled:opacity-40 h-8 text-xs"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
        </Button>
      </td>
    </tr>
  );
}

function RoleBadge({ role }) {
  const map = {
    sysadmin: "bg-purple-100 text-purple-700",
    agent: "bg-blue-100 text-blue-700",
    land_manager: "bg-green-100 text-green-700",
  };
  if (!role) return <span className="text-gray-300 text-xs">None</span>;
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${map[role] ?? "bg-gray-100 text-gray-600"}`}>
      {role.replace("_", " ")}
    </span>
  );
}
