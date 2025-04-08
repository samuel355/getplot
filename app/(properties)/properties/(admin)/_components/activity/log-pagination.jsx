import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import useActivityLogStore from "../../_store/useActivityLogStore";

export function LogPagination() {
  const { pagination, fetchLogs } = useActivityLogStore();
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => fetchLogs(pagination.page - 1)}
            disabled={pagination.page === 1}
          />
        </PaginationItem>
        
        {pages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              onClick={() => fetchLogs(page)}
              isActive={pagination.page === page}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        
        <PaginationItem>
          <PaginationNext
            onClick={() => fetchLogs(pagination.page + 1)}
            disabled={pagination.page === totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}