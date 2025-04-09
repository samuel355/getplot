import { useEffect } from "react";
import useAdvancedSearchStore from "../../_store/useAdvancedSearchStore";
import PropertyTable from "../property-table";

export function SearchResults() {
  const { results, totalResults, loading, error, executeSearch } = useAdvancedSearchStore();

  useEffect(() => {
    executeSearch();
  }, [executeSearch]);
  
  console.log(results);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        {error}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-500">No properties found matching your criteria</p>
      </div>
    );
  }
  
  console.log(results);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Found {totalResults} properties
        </p>
      </div>

      <PropertyTable properties={results} />
    </div>
  );
}