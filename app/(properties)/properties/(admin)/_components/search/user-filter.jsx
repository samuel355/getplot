import { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, Check } from "lucide-react";
import useAdvancedSearchStore from "../../_store/useAdvancedSearchStore";
import { useClerk } from "@clerk/nextjs";
import useAdminUserStore from "../../_store/useAdminUserStore";

export function UserFilter() {
  const { setFilter, filters } = useAdvancedSearchStore();
  const { users } = useAdminUserStore();
  const { clerkClient } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  console.log(users);

  // Fetch users from Clerk
  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       if(!response.ok){
  //         throw new Error('Failed to fetch users')
  //       }
  //       const data = await response.json();
  //       if(data){
  //         setUsers(data.data);
  //         setFilteredUsers(data.data);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching users:", error);
  //     }
  //   };

  //   fetchUsers();
  // }, [clerkClient]);

  // Update search results
  useEffect(() => {
    setFilteredUsers(
      users.filter(
        (user) =>
          `${user.firstName} ${user.lastName}`
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          user.emailAddresses[0]?.emailAddress
            .toLowerCase()
            .includes(search.toLowerCase())
      )
    );
  }, [search, users]);

  // Get selected user
  const isSelected = (userId) => filters.userId === userId;

  // Clear selected user
  const handleClearUser = () => {
    setFilter("userId", null);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-[200px] justify-start"
        >
          <User className="mr-2 h-4 w-4" />
          {filters.userId ? (
            users.find((u) => u.id === filters.userId)?.firstName +
            " " +
            users.find((u) => u.id === filters.userId)?.lastName
          ) : (
            <span>Select User</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="p-2">
          <Label htmlFor="user-search">Search User</Label>
          <Input
            id="user-search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full mt-1"
          />
        </div>

        <ScrollArea className="max-h-[300px]">
          {filteredUsers.map((user) => (
            <Button
              key={user.id}
              variant="ghost"
              className={`w-full justify-start data-[state=active]:bg-accent data-[state=active]:text-accent-foreground rounded-none pl-4 ${
                isSelected(user.id) ? "font-semibold" : ""
              }`}
              onClick={() => {
                setFilter("userId", user.id);
                setIsOpen(false);
              }}
            >
              <Avatar className="mr-2 h-5 w-5">
                <AvatarImage src={user.imageUrl} alt={user.firstName} />
                <AvatarFallback>
                  {user.firstName[0]}
                  {user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <span>
                {user.firstName} {user.lastName}
              </span>
              {isSelected(user.id) && (
                <Check className="ml-auto h-4 w-4 text-primary" />
              )}
            </Button>
          ))}
          {filteredUsers.length === 0 && (
            <div className="p-4 text-muted-foreground">No users found</div>
          )}
        </ScrollArea>

        {filters.userId && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              className="w-full text-red-500 hover:bg-red-50"
              onClick={handleClearUser}
            >
              Clear User
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
