import React from "react";
import { Button } from "../ui/button";

export function Pagination({ page, maxPage, onPageChange }) {
  return (
    <div className="flex justify-center items-center space-x-2 mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Prev
      </Button>
      <span className="px-2 text-sm">
        Page {page} of {maxPage}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= maxPage}
      >
        Next
      </Button>
    </div>
  );
}
