"use client";
import AuditUniverseForm from "../../_components/audit-universe-form";
import { AuditUniverse } from "@/lib/types/audit-types";

const UniverseUpdatePage = async () => {
  const universeResponse = await Promise.resolve({
    success: true,
    data: {
      data: {
        id: 1,
        name: "Universe 1",
        description: "Description 1",
        isActive: true
      }
    }
  });

  const universe = universeResponse.data.data;

  return (
    <div className="bg-background min-h-screen">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <AuditUniverseForm initialData={universe as unknown as AuditUniverse} />
      </div>
    </div>
  );
};

export default UniverseUpdatePage;
