"use client";

import usePropertyStore from '@/store/usePropertyStore';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const Pagination = () => {
  const { pagination, setPage } = usePropertyStore();
  const { page, totalPages, totalCount } = pagination;
  
  // If there's only one page or no pages, don't render the pagination
  if (totalPages <= 1) return null;
  
  // Generate page numbers to display (show maximum 5 page numbers)
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Calculate range around current page
    let startPage = Math.max(2, page - 1);
    let endPage = Math.min(totalPages - 1, page + 1);
    
    // If we're at the start, show more pages after
    if (page <= 2) {
      endPage = Math.min(totalPages - 1, 4);
    }
    
    // If we're at the end, show more pages before
    if (page >= totalPages - 1) {
      startPage = Math.max(2, totalPages - 3);
    }
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pageNumbers.push('...');
    }
    
    // Add middle page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pageNumbers.push('...');
    }
    
    // Always add last page if more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => page > 1 && setPage(page - 1)}
          disabled={page === 1}
          className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
            page === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => page < totalPages && setPage(page + 1)}
          disabled={page === totalPages}
          className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
            page === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Next
        </button>
      </div>
      
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{Math.min((page - 1) * pagination.pageSize + 1, totalCount)}</span> to{' '}
            <span className="font-medium">{Math.min(page * pagination.pageSize, totalCount)}</span> of{' '}
            <span className="font-medium">{totalCount}</span> results
          </p>
        </div>
        
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => page > 1 && setPage(page - 1)}
              disabled={page === 1}
              className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
                page === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            
            {pageNumbers.map((pageNumber, index) => (
              <button
                key={index}
                onClick={() => pageNumber !== '...' && setPage(pageNumber)}
                disabled={pageNumber === '...'}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                  pageNumber === page
                    ? 'bg-primary text-white'
                    : pageNumber === '...'
                    ? 'bg-white text-gray-700'
                    : 'bg-white text-gray-500 hover:bg-gray-50'
                }`}
              >
                {pageNumber}
              </button>
            ))}
            
            <button
              onClick={() => page < totalPages && setPage(page + 1)}
              disabled={page === totalPages}
              className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
                page === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;