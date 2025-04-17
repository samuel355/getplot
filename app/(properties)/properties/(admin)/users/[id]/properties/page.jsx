"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import AdminLayout from "../../../_components/admin-layout";
import UserProperties from "../../../_components/user-properties";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function UserPropertiesPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/get-user/`, {
          method: "POST",
          body: JSON.stringify({ userId: params.id }),
        });
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/properties/users");
      }
    };

    if (params.id) {
      fetchUserData();
    }
  }, [params.id, router]);

  return (
    <AdminLayout>
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {userData ? `${userData.firstName} ${userData.lastName}'s Properties` : 'User Properties'}
            </h1>
            {userData && (
              <p className="text-muted-foreground">{userData.emailAddresses[0].emailAddress}</p>
            )}
          </div>
        </div>

        <UserProperties userId={params.id} />
      </div>
    </AdminLayout>
  );
}