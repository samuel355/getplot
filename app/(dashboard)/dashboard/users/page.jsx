"use client";
import { createClerkClient } from "@clerk/clerk-sdk-node";

import { useEffect, useState } from "react";
import { UsersTable } from "./table";
import { columns } from "./column";

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
        setLoading(false)
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

  return (
    <div>
      <div className="-mt-5">
        <h1 className="text-primary font-bold text-2xl">Users</h1>
      </div>
      <div className="mt-2">
        <UsersTable data={selectData} columns={columns} loading={loading} />
      </div>
    </div>
  );
};

export default Users;

