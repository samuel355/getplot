"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import {
  Search,
  Bell,
  Menu,
  CheckCircle,
  XCircle,
  Eye,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSidebar } from "../contexts/sidebar-context";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function Header() {
  const { user } = useUser();
  const { isMobileOpen, setIsMobileOpen } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const isAdmin =
    user?.publicMetadata?.role === "admin" ||
    user?.publicMetadata?.role === "sysadmin";

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(
      isAdmin
        ? `/properties/search?q=${encodeURIComponent(searchQuery)}`
        : `/properties/list?search=${encodeURIComponent(searchQuery)}`
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-slate-200 bg-white md:left-64">
      <div className="flex h-full items-center gap-3 px-4 md:px-6">
        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative flex-1 max-w-sm hidden md:flex">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder={isAdmin ? "Search all properties…" : "Search my properties…"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-colors"
          />
        </form>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          <NotificationButton isAdmin={isAdmin} userId={user?.id} />
          <UserButton
            afterSignOutUrl="/"
            appearance={{ elements: { avatarBox: "h-8 w-8" } }}
          />
        </div>
      </div>
    </header>
  );
}

function NotificationButton({ isAdmin, userId }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();
  const ref = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        let q = supabase
          .from("notifications")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false })
          .limit(10);

        if (!isAdmin) q = q.eq("user_id", userId);

        const { data } = await q;
        setNotifications(data ?? []);
      } catch {
        // silent
      }
    };
    if (userId) fetchNotifications();
  }, [isAdmin, userId]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markRead = async (id) => {
    await supabase
      .from("notifications")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unread = notifications.length;

  const typeIcon = (type) => {
    if (type === "property_approved") return <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />;
    if (type === "property_rejected") return <XCircle className="h-4 w-4 text-red-500 shrink-0" />;
    if (type === "property_interest") return <Eye className="h-4 w-4 text-blue-500 shrink-0" />;
    return <Bell className="h-4 w-4 text-slate-400 shrink-0" />;
  };

  const typeLabel = (type) =>
    type?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ?? "Notification";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-1rem)] bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
            <div className="flex items-center gap-2">
              <button
                className="text-xs text-brand-navy hover:underline"
                onClick={() => { setOpen(false); router.push("/properties/notifications"); }}
              >
                View all
              </button>
              <button
                className="p-1 rounded hover:bg-slate-100 text-slate-400"
                onClick={() => setOpen(false)}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
            {notifications.length ? (
              notifications.map((n) => (
                <div key={n.id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{typeIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {typeLabel(n.type)}
                        </p>
                        <span className="text-xs text-slate-400 shrink-0">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {n.details || n.message}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => markRead(n.id)}
                          className="text-xs text-brand-teal hover:underline"
                        >
                          Mark read
                        </button>
                        {n.property_id && (
                          <button
                            onClick={() => {
                              setOpen(false);
                              router.push(`/properties/property/${n.property_id}`);
                            }}
                            className="text-xs text-slate-500 hover:text-slate-800"
                          >
                            View property →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <Bell className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
