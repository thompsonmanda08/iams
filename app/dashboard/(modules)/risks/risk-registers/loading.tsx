import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

type TableSkeletonProps = {
  columns: number;
  rows?: number;
  showFilters?: boolean;
  filterCount?: number;
  showPagination?: boolean;
  showCard?: boolean;
  columnWidths?: string[];
  hasActions?: boolean;
  hasNestedContent?: boolean;
};

export default function PageSkeleton() {
  return (
    <div className="container mx-auto p-8">
      <TableSkeleton
        columns={8}
        rows={5}
        showFilters={true}
        filterCount={2}
        showPagination={true}
        showCard={true}
        hasActions={true}
        hasNestedContent={true}
        columnWidths={["w-48", "w-32", "w-24", "w-24", "w-16", "w-20", "w-24", "w-auto"]}
      />
    </div>
  );
}

export function TableSkeleton({
  columns,
  rows = 5,
  showFilters = false,
  filterCount = 2,
  showPagination = false,
  showCard = true,
  columnWidths,
  hasActions = false,
  hasNestedContent = false
}: TableSkeletonProps) {
  const TableContent = (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: columns }).map((_, index) => (
              <TableHead
                key={index}
                className={index === columns - 1 && hasActions ? "text-right" : ""}>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell
                  key={colIndex}
                  className={colIndex === columns - 1 && hasActions ? "text-right" : ""}>
                  {colIndex === 0 && hasNestedContent ? (
                    <div className="space-y-2">
                      <Skeleton className={`h-4 ${columnWidths?.[colIndex] || "w-48"}`} />
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-3 w-3" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ) : colIndex === columns - 1 && hasActions ? (
                    <div className="flex justify-end gap-2">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ) : (
                    <Skeleton className={`h-4 ${columnWidths?.[colIndex] || "w-32"}`} />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {showPagination && (
        <div className="flex items-center justify-between border-t px-6 py-4">
          <Skeleton className="h-4 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {showFilters && (
        <Card className="mb-8 px-4 py-8">
          <div className="flex flex-col gap-4 md:flex-row">
            {Array.from({ length: filterCount }).map((_, index) => (
              <Skeleton
                key={index}
                className={`h-10 ${index === 0 ? "w-full md:flex-1" : "w-full md:w-48"}`}
              />
            ))}
          </div>
        </Card>
      )}

      {showCard ? <Card>{TableContent}</Card> : TableContent}
    </>
  );
}
