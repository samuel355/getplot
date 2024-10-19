"use client";
import { createClerkClient } from "@clerk/clerk-sdk-node";

import { useEffect, useState } from "react";

const Users = () => {
  const [clientList, setClientList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchClientList() {
      try {
        const response = await fetch("/api/users"); // Assuming your API route is under /api/users
        if (!response.ok) {
          throw new Error("Failed to fetch client list");
        }
        const data = await response.json();
        setClientList(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchClientList();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const selectData = clientList.data.map(
    ({ id, imageUrl, username, firstName, lastName, publicMetadata, emailAddresses }) => ({
      id,
      imageUrl,
      username,
      firstName,
      lastName,
      role: publicMetadata.role, // Ensure role is accessed correctly
      email: emailAddresses.length > 0 ? emailAddresses[0].emailAddress : null, // Check if emailAddresses has any elements
    })
  );

  console.log(selectData);
  return (
    <div>
      <div className="-mt-5">
        <h1 className="text-primary font-bold text-2xl">Users</h1>
      </div>
    </div>
  );
};

export default Users;
