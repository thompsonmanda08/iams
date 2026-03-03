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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PageSkeleton() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-13 w-13 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="engagement" className="space-y-4">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex h-12 w-auto min-w-full gap-1 lg:gap-3">
              <TabsTrigger value="annual" className="gap-2" disabled>
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 w-24" />
              </TabsTrigger>
              <TabsTrigger value="engagement" className="gap-2" disabled>
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 w-28" />
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="engagement">
            <Card className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-80" />
                </div>
                <Skeleton className="h-9 w-40 rounded-md" />
              </div>

              <Skeleton className="mb-4 h-4 w-48" />

              <Table>
                <TableHeader>
                  <TableRow>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <TableHead key={i} className={i === 7 ? "text-right" : ""}>
                        <Skeleton className="h-4 w-24" />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {Array.from({ length: 8 }).map((_, colIndex) => (
                        <TableCell
                          key={colIndex}
                          className={colIndex === 7 ? "text-right" : ""}>
                          {colIndex === 7 ? (
                            <div className="flex justify-end gap-2">
                              <Skeleton className="h-8 w-24" />
                              <Skeleton className="h-8 w-16" />
                            </div>
                          ) : (
                            <Skeleton
                              className={`h-4 ${["w-48", "w-32", "w-24", "w-24", "w-16", "w-20", "w-24"][colIndex] || "w-32"}`}
                            />
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t px-2 py-4">
                <Skeleton className="h-4 w-48" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-32" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
