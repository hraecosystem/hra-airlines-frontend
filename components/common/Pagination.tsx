"use client";

import React from "react";

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (count: number) => void;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const renderPageButtons = () => {
    const pages = [];

    const createBtn = (page: number) => (
      <button
        key={page}
        onClick={() => onPageChange(page)}
        className={`px-3 py-1 rounded text-sm font-medium transition ${
          page === currentPage
            ? "bg-blue-600 text-white"
            : "bg-gray-100 hover:bg-gray-200"
        }`}
        aria-current={page === currentPage ? "page" : undefined}
      >
        {page}
      </button>
    );

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(createBtn(i));
    } else {
      pages.push(createBtn(1));
      if (currentPage > 3) pages.push(<span key="start-ellipsis">…</span>);

      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(createBtn(i));
      }

      if (currentPage < totalPages - 2) pages.push(<span key="end-ellipsis">…</span>);
      pages.push(createBtn(totalPages));
    }

    return pages;
  };

  return (
    <nav
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6"
      aria-label="Pagination Navigation"
    >
      {/* MOBILE VIEW */}
      <div className="flex items-center justify-between w-full sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm text-gray-700">
          Page <strong>{currentPage}</strong> of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden sm:flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>

        {renderPageButtons()}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Optional Page Size Dropdown */}
      {itemsPerPage && onItemsPerPageChange && (
        <div className="hidden sm:flex items-center gap-2">
          <label className="text-sm text-gray-600">Items per page:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-pink-500"
          >
            {[10, 20, 50, 100].map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </div>
      )}
    </nav>
  );
}
