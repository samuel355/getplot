import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Filter } from "lucide-react";
import useActivityLogStore from "../../_store/useActivityLogStore";

export function LogFilters() {
  const { filters, setFilters } = useActivityLogStore();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleDateRangeSelect = (date) => {
    if (!filters.dateRange.from || (filters.dateRange.from && filters.dateRange.to)) {
      // Start new range
      setFilters({
        dateRange: { from: date, to: null }
      });
    } else {
      // Complete the range
      setFilters({
        dateRange: { 
          from: filters.dateRange.from,
          to: date 
        }
      });
      setIsCalendarOpen(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="w-[200px]">
        <Label>Action Type</Label>
        <Select
          value={filters.type}
          onValueChange={(value) => setFilters({ type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="property">Property</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="settings">Settings</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-[200px]">
        <Label>Date Range</Label>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateRange.from ? (
                filters.dateRange.to ? (
                  `${format(filters.dateRange.from, 'PP')} - ${format(filters.dateRange.to, 'PP')}`
                ) : (
                  format(filters.dateRange.from, 'PP')
                )
              ) : (
                "Pick a date range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{
                from: filters.dateRange.from,
                to: filters.dateRange.to,
              }}
              onSelect={handleDateRangeSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex-1">
        <Label>Search</Label>
        <div className="relative">
          <Input
            placeholder="Search logs..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="pl-8"
          />
          <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}