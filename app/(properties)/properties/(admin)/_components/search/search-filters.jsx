import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import useAdvancedSearchStore from "../../_store/useAdvancedSearchStore";
import { UserFilter } from "./user-filter";

export function SearchFilters() {
  const {
    searchQuery,
    filters,
    setSearchQuery,
    setFilter,
    setFilters,
    resetFilters,
  } = useAdvancedSearchStore();

  const [showFilters, setShowFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (filters.type !== "all") count++;
    if (filters.status !== "all") count++;
    if (filters.priceRange.min) count++;
    if (filters.priceRange.max) count++;
    if (filters.dateRange.from) count++;
    if (filters.dateRange.to) count++;
    if (filters.location !== "all") count++;
    if (filters.bedrooms !== "any") count++;
    if (filters.bathrooms !== "any") count++;
    if (filters.features.length > 0) count++;
    if (filters.userId) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {(activeFiltersCount > 0 || searchQuery) && (
          <Button
            variant="ghost"
            onClick={resetFilters}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-white rounded-lg border">
          {/* Property Type */}
          <div className="space-y-2">
            <Label>Property Type</Label>
            <Select
              value={filters.type}
              onValueChange={(value) => setFilter("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="house">Houses</SelectItem>
                <SelectItem value="land">Land</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilter("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <Label>Price Range</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.priceRange.min}
                onChange={(e) =>
                  setFilter("priceRange", {
                    ...filters.priceRange,
                    min: e.target.value,
                  })
                }
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.priceRange.max}
                onChange={(e) =>
                  setFilter("priceRange", {
                    ...filters.priceRange,
                    max: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    filters.dateRange.to ? (
                      <>
                        {filters.dateRange.from.toLocaleDateString()} -
                        {filters.dateRange.to.toLocaleDateString()}
                      </>
                    ) : (
                      filters.dateRange.from.toLocaleDateString()
                    )
                  ) : (
                    "Select dates"
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
                  onSelect={(range) =>
                    setFilter("dateRange", {
                      from: range?.from,
                      to: range?.to,
                    })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label>Location</Label>
            <Select
              value={filters.location}
              onValueChange={(value) => setFilter("location", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="Accra">Accra</SelectItem>
                <SelectItem value="Kumasi">Kumasi</SelectItem>
                <SelectItem value="East Legon Hills">
                  East Legon Hills
                </SelectItem>
                <SelectItem value="East Legon">East Legon</SelectItem>
                <SelectItem value="Legon">Legon</SelectItem>
                <SelectItem value="NTHC">NTHC</SelectItem>
                <SelectItem value="Trabuom">Trabuom</SelectItem>
                <SelectItem value="Yabi">Yabi</SelectItem>
                <SelectItem value="Dar Es Salaam">Dar Es Salaam</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bedrooms */}
          <div className="space-y-2">
            <Label>Bedrooms</Label>
            <Select
              value={filters.bedrooms}
              onValueChange={(value) => setFilter("bedrooms", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
                <SelectItem value="5">5+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bathrooms */}
          <div className="space-y-2">
            <Label>Bathrooms</Label>
            <Select
              value={filters.bathrooms}
              onValueChange={(value) => setFilter("bathrooms", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bathrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
                <SelectItem value="5">5+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <Label>Features</Label>
            <Select
              value={filters.features[0] || "any"}
              onValueChange={(value) =>
                setFilter("features", value === "any" ? [] : [value])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select features" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="Swimming Pool">Swimming Pool</SelectItem>
                <SelectItem value="Air Conditioning">
                  Air Conditioning
                </SelectItem>
                <SelectItem value="Garage">Garage</SelectItem>
                <SelectItem value="Fenced">Fenced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Filter */}
          <div className="space-y-2">
            <Label>User</Label>
            <UserFilter />
          </div>
        </div>
      )}
    </div>
  );
}
