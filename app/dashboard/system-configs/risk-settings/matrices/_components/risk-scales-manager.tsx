"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScalesList } from "./scales-list";
import { RatingLevelsList } from "./rating-levels-list";


type RiskScalesManagerProps = {
  matrixId: string;
};

export function RiskScalesManager({ matrixId }: RiskScalesManagerProps) {
  return (
    <Tabs defaultValue="likelihood" className="space-y-6">
      <TabsList className="w-full">
        <TabsTrigger value="likelihood" >
          Likelihood Scale
        </TabsTrigger>
        <TabsTrigger value="impact">
          Impact Scale
        </TabsTrigger>
        <TabsTrigger value="ratings">
          Rating Levels
        </TabsTrigger>
      </TabsList>

      <TabsContent value="likelihood" className="space-y-6">
        <ScalesList matrixId={matrixId} scaleType="LIKELIHOOD" />
      </TabsContent>

      <TabsContent value="impact" className="space-y-6">
        <ScalesList matrixId={matrixId} scaleType="IMPACT" />
      </TabsContent>

      <TabsContent value="ratings" className="space-y-6">
        <RatingLevelsList matrixId={matrixId} />
      </TabsContent>
    </Tabs>
  );
}
