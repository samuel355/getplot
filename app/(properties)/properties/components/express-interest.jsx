"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";

export function ExpressInterest({ propertyId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setLoading(true);
      const response = await fetch("/api/properties/notify-interest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId,
          interestedUserId: user.id,
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send interest notification");
      }

      toast({
        title: "Success",
        description: "Your interest has been sent to the property owner",
      });

      setIsOpen(false);
      setMessage("");
    } catch (error) {
      console.error("Error expressing interest:", error);
      toast({
        title: "Error",
        description: "Failed to send interest notification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Express Interest
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Express Interest in Property</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="message"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Message to Property Owner
            </label>
            <Textarea
              id="message"
              placeholder="Write a message to the property owner..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Interest"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 