interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="flex gap-2 justify-center items-center mt-6" role="navigation" aria-label="Pagination">
      <button
        type="button"
        onClick={() => canGoPrevious && onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
        className="px-3 py-1 border border-line rounded disabled:opacity-50"
        aria-label="Go to previous page"
      >
        Previous
      </button>
      <span className="text-ink2" aria-live="polite">
        Page {currentPage} of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => canGoNext && onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className="px-3 py-1 border border-line rounded disabled:opacity-50"
        aria-label="Go to next page"
      >
        Next
      </button>
    </div>
  );
}
