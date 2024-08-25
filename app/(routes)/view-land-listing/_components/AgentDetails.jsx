import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";

const AgentDetails = ({ listingDetails }) => {
  
  return (
    <div className="flex gap-5 flex-wrap items-center justify-between p-5 rounded-lg shadow-sm border">
      <div className="flex items-center gap-6">
        {listingDetails.profileImage && (
          <Image
            src={listingDetails[0]?.profileImage}
            alt="Agent Profile"
            width={60}
            height={60}
            className="rounded-full border"
          />
        )}
        <div>
          <h2 className="text-lg font-bold text-primary break-words">
            {listingDetails[0]?.fullName}
          </h2>
          <h2 className="text-gray-500">{listingDetails[0]?.createdBy}</h2>
        </div>
      </div>
      <Button className="font-medium text-sm">Send Message</Button>
    </div>
  );
};

export default AgentDetails;
