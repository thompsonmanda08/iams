"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScalesList } from "./scales-list";
import { RatingLevelsList } from "./rating-levels-list";
import { useMatrixRatings } from "@/hooks/use-matrix-query-data";

type RiskScalesManagerProps = {
  matrixId: string;
  initialLikelihoodScales?: any[];
  initialImpactScales?: any[];
  initialRatings?: any[];
};

export function RiskScalesManager({
  matrixId,
  initialLikelihoodScales,
  initialImpactScales,
  initialRatings
}: RiskScalesManagerProps) {
  // Ratings fetched once — shared across both scale tabs.
  // SSR data seeds the cache so the first render is instant.
  const { data: ratings = [] } = useMatrixRatings(matrixId, initialRatings);

  return (
    <Tabs defaultValue="likelihood" className="space-y-6">
      <TabsList className="inline-flex h-12 w-auto min-w-full gap-1 lg:gap-2">
        <TabsTrigger value="ratings">Rating Levels</TabsTrigger>
        <TabsTrigger value="likelihood">Likelihood Scale</TabsTrigger>
        <TabsTrigger value="impact">Impact Scale</TabsTrigger>
      </TabsList>

      <TabsContent value="ratings" className="space-y-6">
        <RatingLevelsList matrixId={matrixId} initialData={initialRatings} />
      </TabsContent>

      <TabsContent value="likelihood" className="space-y-6">
        <ScalesList
          matrixId={matrixId}
          scaleType="LIKELIHOOD"
          ratings={ratings}
          initialData={initialLikelihoodScales}
        />
      </TabsContent>

      <TabsContent value="impact" className="space-y-6">
        <ScalesList
          matrixId={matrixId}
          scaleType="IMPACT"
          ratings={ratings}
          initialData={initialImpactScales}
        />
      </TabsContent>
    </Tabs>
  );
}
