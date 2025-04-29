"use client";
import * as React from "react";
import { Button } from "./button";

export function Pagination({ page, maxPage, onPageChange }) {
  return (
    <nav className="flex justify-center items-center gap-2 mt-4" aria-label="Pagination">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Prev
      </Button>
      <span className="px-2 text-sm select-none">
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
    </nav>
  );
}
