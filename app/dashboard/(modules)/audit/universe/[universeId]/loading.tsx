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

export default function UniverseDetailsLoading() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="bg-muted/40 border-muted z-10 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-13 w-13 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-44" />
                <Skeleton className="h-4 w-72" />
              </div>
            </div>
            <Skeleton className="h-9 w-36 rounded-md" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Universe Header Card */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-7 w-56" />
                <Skeleton className="h-4 w-80" />
              </div>
              <Skeleton className="h-9 w-40 rounded-md" />
            </div>
          </div>
          {/* Info Grid */}
          <div className="grid grid-cols-1 gap-8 p-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Universe Items Table */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: 6 }).map((_, i) => (
                  <TableHead key={i} className={i === 5 ? "text-right" : ""}>
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: 6 }).map((_, colIndex) => (
                    <TableCell
                      key={colIndex}
                      className={colIndex === 5 ? "text-right" : ""}>
                      {colIndex === 5 ? (
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-16 rounded-md" />
                          <Skeleton className="h-8 w-16 rounded-md" />
                        </div>
                      ) : (
                        <Skeleton className="h-4 w-28" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <Skeleton className="h-4 w-40" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
