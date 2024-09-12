"use client";
import { UserButton, UserProfile, useUser } from "@clerk/nextjs";
import { Building2, Loader } from "lucide-react";
import React, { useEffect, useState } from "react";
import UserListing from "./_components/UserListing";
import Header from "./_components/Header";
import { usePathname, useRouter } from "next/navigation";

const Profile = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  //console.log(user?.publicMetadata);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
      setLoading(false);
      return;
    } else {
      setLoading(false);
    }
  }, [user, router, isLoaded]);

  if (loading) {
    <div className="flex flex-col justify-center items-center pt-5">
      <Loader className="animate-spin" />
    </div>;
  }

  return (
    <>
      <Header />
      <div className="my-6 w-full px-10 pt-[7.5rem]">
        <h2 className="font-bold text-2xl mb-5 ml-1">Profile</h2>
        {user && (
          <UserProfile routing="hash">
            <UserButton.UserProfilePage
              label="My Listing"
              labelIcon={<Building2 className="h-4 w-4" />}
              url="my-listing"
            >
              <UserListing />
            </UserButton.UserProfilePage>
          </UserProfile>
        )}
      </div>
    </>
  );
};

export default Profile;
