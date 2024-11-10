import { CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell
} from "@/components/ui/table";
import { useEffect, useState } from "react";

export default function InterestedClients() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/interested-clients"); // Assuming your API route is under /api/users
        if (!response.ok) {
          throw new Error("Failed to fetch client list");
        }
        const data = await response.json();
        if (data) {
          setClients(data);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    
    fetchClients()
  }, []);

  console.log(clients);
  return (
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead className="text-right">Plot Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.splice(0, 5).map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                <div className="font-medium">
                  {client.firstname + " " + client.lastname}
                </div>
                <div className="hidden text-sm text-muted-foreground md:inline">
                  {client.email}
                </div>
              </TableCell>
              <TableCell className="text-right">{` Interested In Plot No ${client.plot_number} ${client.plot_name}`}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  );
}
