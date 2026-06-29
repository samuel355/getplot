"use client";

import AuthCheck from "@/app/_components/AuthCheck";
import AdminLayout from "../(admin)/_components/admin-layout";
import { SearchFilters } from "../(admin)/_components/search/search-filters";
import { SearchPresets } from "../(admin)/_components/search/search-presets";
import { SearchResults } from "../(admin)/_components/search/search-results";

export default function AdvancedSearchPage() {
  return (
    <AuthCheck>
      <AdminLayout>
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">Advanced Search</h1>
              <p className="text-muted-foreground">
                Search and filter properties with advanced criteria
              </p>
            </div>
            <SearchPresets />
          </div>

          <SearchFilters />
          <SearchResults />
        </div>
      </AdminLayout>
    </AuthCheck>
  );
}
