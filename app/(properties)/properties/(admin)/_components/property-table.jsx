import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building,
  Pencil,
} from "lucide-react";
import StatusBadge from "./status-badge";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import useBulkActionStore from "../_store/useBulkActionStore";

export default function PropertyTable({
  properties,
  approveProperty,
  openRejectDialog,
  hideActions = false,
  emptyMessage = "No properties found",
}) {
  const { selectedItems, toggleItem, toggleAll } = useBulkActionStore();
  if (properties.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed p-8">
        <div className="flex flex-col items-center text-center">
          <AlertTriangle className="h-8 w-8 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-semibold">{emptyMessage}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            No properties match your current filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>List of properties</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={selectedItems.length === properties.length}
              onCheckedChange={() => toggleAll(properties)}
            />
          </TableHead>
          <TableHead>Property Details</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date Added</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {properties.map((property) => (
          <TableRow key={property.id}>
            <TableCell>
              <Checkbox
                checked={selectedItems.includes(property.id)}
                onCheckedChange={() => toggleItem(property.id)}
              />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-md bg-muted">
                  {property.images && property.images[0] ? (
                    <img
                      src={property.images[0].url || property.images[0]}
                      alt={property.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <Building className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium">{property.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {property.location}
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {property.owner?.email || property.user_id}
              </div>
            </TableCell>
            <TableCell>
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize">
                {property.type}
              </span>
            </TableCell>
            <TableCell>
              {property.listing_type === "rent" ? (
                <>GHS {Number(property.rental_price).toLocaleString()}<span className="text-xs text-gray-500">/month</span></>
              ) : property.listing_type === "airbnb" ? (
                <>GHS {Number(property.rental_price).toLocaleString()}<span className="text-xs text-gray-500">/day</span></>
              ) : (
                <>GHS {Number(property.price).toLocaleString()}</>
              )}
            </TableCell>
            <TableCell>
              <StatusBadge status={property.status} />
            </TableCell>
            <TableCell>
              {new Date(property.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button asChild variant="ghost" size="icon">
                  <Link href={`/properties/property/${property.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>

                <Button asChild variant="ghost" size="icon">
                  <Link href={`/properties/edit-property/${property.id}`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>

                {!hideActions && property.status !== "approved" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-green-500 hover:text-green-700 hover:bg-green-50"
                    onClick={() => approveProperty(property.id)}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}

                {!hideActions && property.status !== "rejected" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => openRejectDialog(property)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
