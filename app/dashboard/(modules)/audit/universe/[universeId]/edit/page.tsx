"use client";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import AuditUniverseForm from "../../_components/audit-universe-form";
import PageHeader from "@/components/page-header";

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
        <AuditUniverseForm initialData={universe} />
      </div>
    </div>
  );
};

export default UniverseUpdatePage;
