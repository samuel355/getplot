"use client";

import { useEffect, useState } from "react";
import { ClientsTable } from "../_components/clients-table";
import { clientsColumns } from "../_components/clients-columns";

const Users = () => {
  const [clientList, setClientList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchClientList() {
      try {
        const response = await fetch("/api/interested-clients", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            databaseName: 'nthc_interests',
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to fetch client list");
        }
        const data = await response.json();
        setClientList(data);
      } catch (err) {
        setLoading(false);
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

  return (
    <div>
      <div className="-mt-5">
        <h1 className="text-primary font-bold text-2xl">Interested Clients</h1>
      </div>
      <div className="mt-2">
        <ClientsTable
          data={clientList}
          columns={clientsColumns}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Users;
