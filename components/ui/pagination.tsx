import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Pagination } from "@/lib/types";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<"a">;

function PaginationLink({ className, isActive, size = "icon", ...props }: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size
        }),
        className
      )}
      {...props}
    />
  );
}

function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}>
      <ChevronLeftIcon />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  );
}

function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}>
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}>
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

const CustomPagination = ({
  pagination,
  updatePagination,
  showDetails,
  classNames,
  className
}: {
  className?: string;
  classNames?: {
    wrapper: string;
    current: string;
    previous: string;
    next: string;
    pagesWrapper: string;
  };
  showDetails?: boolean;
  pagination: Pagination;
  updatePagination: (page: { page: number }) => void;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 px-4 py-3 sm:flex-row",
        {
          "items-center justify-between": showDetails
        },
        className,
        classNames?.wrapper
      )}>
      {showDetails && (
        <div className="text-foreground/80 order-2 text-sm sm:order-1">
          Showing page {pagination.page} of {pagination?.total_pages} ({pagination.totalCount} total
          products)
        </div>
      )}
      <div className="order-1 flex items-center space-x-1 sm:order-2 sm:space-x-2">
        <button
          onClick={() => updatePagination({ page: pagination?.page - 1 })}
          disabled={!pagination.has_prev}
          className={cn(
            "rounded-md border border-gray-300 px-2 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3",
            classNames?.previous
          )}>
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </button>

        <div className={cn("flex items-center space-x-1", classNames?.pagesWrapper)}>
          {Array.from({ length: Math.min(3, pagination?.total_pages) }, (_, i) => {
            let pageNum;
            if (pagination?.total_pages <= 3) {
              pageNum = i + 1;
            } else if (pagination.page <= 2) {
              pageNum = i + 1;
            } else if (pagination.page >= pagination?.total_pages - 1) {
              pageNum = pagination?.total_pages - 2 + i;
            } else {
              pageNum = pagination.page - 1 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => updatePagination({ page: pageNum })}
                className={cn(
                  `rounded-md px-2 py-1 text-sm sm:px-3 ${
                    pagination.page === pageNum
                      ? "bg-primary text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`,
                  classNames?.current
                )}>
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => updatePagination({ page: pagination.page + 1 })}
          disabled={!pagination.has_next}
          className={cn(
            "rounded-md border border-gray-300 px-2 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 sm:px-3",
            classNames?.next
          )}>
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">Next</span>
        </button>
      </div>
    </div>
  );
};

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  CustomPagination
};
