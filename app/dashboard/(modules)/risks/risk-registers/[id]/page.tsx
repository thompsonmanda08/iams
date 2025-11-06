import { getRisksInRegister } from "@/app/_actions/risk-module-actions";
import { RisksPageHeader } from "../../_components/risks-page-header";
import RisksTable from "../../_components/risks-table";

type ApiRisk = {
  id: string;
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
    code: string;
  };
  inherent_score: number;
  inherent_impact: number;
  inherent_likelihood: number;
  residual_score: number;
  residual_impact: number;
  residual_likelihood: number;
  inherent_rating: string;
  status: string;
  risk_owner?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  step?: number;
};

type TransformedRisk = {
  id: string;
  riskId: string;
  title: string;
  description: string;
  category: string;
  inherentScore: number;
  inherentImpact: number;
  inherentLikelihood: number;
  residualScore: number;
  residualImpact: number;
  residualLikelihood: number;
  riskMagnitude: string;
  status: string;
  owner: string;
  step?: number;
};

function transformRiskData(apiRisks: ApiRisk[]): TransformedRisk[] {
  if (!Array.isArray(apiRisks) || apiRisks.length === 0) {
    return [];
  }

  return apiRisks.map((risk) => {
    const ownerName = risk.risk_owner
      ? `${risk.risk_owner.first_name} ${risk.risk_owner.last_name}`.trim() ||
        risk.risk_owner.email ||
        "Unassigned"
      : "Unassigned";

    return {
      id: risk.id,
      riskId: `${risk.category?.code ? risk.category?.code : "N/A"}-${risk.id.slice(0, 4).toUpperCase()}`,
      title: risk.title || "Untitled Risk",
      description: risk.description || "No description provided",
      category: risk.category?.name || "Uncategorized",
      inherentScore: risk.inherent_score || 0,
      inherentImpact: risk.inherent_impact || 0,
      inherentLikelihood: risk.inherent_likelihood || 0,
      residualScore: risk.residual_score || 0,
      residualImpact: risk.residual_impact || 0,
      residualLikelihood: risk.residual_likelihood || 0,
      riskMagnitude: (risk.inherent_rating || "low").toLowerCase(),
      status: (risk.status || "draft").toLowerCase(),
      owner: ownerName,
      step: risk.step
    };
  });
}

function transformMeta(apiMeta: any) {
  const total = apiMeta?.total || 0;
  const page = apiMeta?.page || 1;
  const limit = apiMeta?.limit || 10;
  const totalPages = total > 0 ? Math.ceil(total / limit) : 1;

  return {
    total,
    page,
    limit,
    totalPages
  };
}

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    search?: string;
    category?: string;
    status?: string;
    page?: string;
    limit?: string;
  }>;
};

export default async function RisksPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const {
    search = "",
    category = "all",
    status = "all",
    page = "1",
    limit = "10"
  } = await searchParams;

  try {
    const response = await getRisksInRegister(id, {
      search: search || undefined,
      category: category !== "all" ? category : undefined,
      status: status !== "all" ? status : undefined,
      page: Number(page),
      limit: Number(limit)
    });

    if (!response?.data?.data) {
      return (
        <div className="space-y-6">
          <RisksPageHeader registerId={id} registerName="Manage and monitor organizational risks" />
          <RisksTable
            risks={[]}
            meta={{ total: 0, page: 1, limit: 10, totalPages: 1 }}
            registerId={id}
            currentSearch={search}
            currentCategory={category}
            currentStatus={status}
          />
        </div>
      );
    }

    const transformedRisks = transformRiskData(response.data.data);
    const transformedMeta = transformMeta(response.data);

    return (
      <div className="space-y-6">
        <RisksPageHeader registerId={id} registerName="Manage and monitor organizational risks" />
        <RisksTable
          risks={transformedRisks as unknown as any}
          meta={transformedMeta}
          registerId={id}
          currentSearch={search}
          currentCategory={category}
          currentStatus={status}
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading risks:", error);
    return (
      <div className="space-y-6">
        <RisksPageHeader registerId={id} registerName="Manage and monitor organizational risks" />
        <RisksTable
          risks={[]}
          meta={{ total: 0, page: 1, limit: 10, totalPages: 1 }}
          registerId={id}
          currentSearch={search}
          currentCategory={category}
          currentStatus={status}
        />
      </div>
    );
  }
}
