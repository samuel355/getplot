"use client";
import { UserButton, UserProfile } from "@clerk/nextjs";
import { Building2 } from "lucide-react";
import UserListing from "./_components/UserListing";

const Profile = () => {
  return (
    <>
      <div className="w-full">
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
