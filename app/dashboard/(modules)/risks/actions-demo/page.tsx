import PageHeader from "@/components/page-header";
import { getActionFindings } from "@/app/_actions/risk-module-actions";
import { ActionFindingsDemo } from "@/app/dashboard/(modules)/risks/_components/action-findings-demo";

export const dynamic = "force-dynamic";

export default async function ActionsDemoPage() {
  // Fetch mock findings for risk 1 and 2
  const findings1Response = await getActionFindings("1");
  const findings2Response = await getActionFindings("2");

  const allFindings = [
    ...(findings1Response.success ? findings1Response.data : []),
    ...(findings2Response.success ? findings2Response.data : [])
  ];

  return (
    <main className="bg-background min-h-screen">
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <PageHeader
            title="Action Findings Demo"
            description="Complete workflow demonstration with realistic mock data scenarios"
            icon="FileText"
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <ActionFindingsDemo mockFindings={allFindings} />

        {/* Implementation Guide */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* How to Use */}
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-lg font-semibold mb-4">🚀 How to Test This Feature</h3>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 min-w-fit">1.</span>
                <span>Go to /dashboard/risks/actions to see actions assigned to you</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 min-w-fit">2.</span>
                <span>Click "Submit Findings" button on any open action</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 min-w-fit">3.</span>
                <span>Fill in the dialog with action description and optional evidence</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 min-w-fit">4.</span>
                <span>Submit and see the status change to PENDING_REVIEW</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 min-w-fit">5.</span>
                <span>View mock findings here to see complete workflow examples</span>
              </li>
            </ol>
          </div>

          {/* Key Features */}
          <div className="rounded-lg border bg-white p-6">
            <h3 className="text-lg font-semibold mb-4">✨ Key Features Implemented</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span>✅</span>
                <span>Action findings submission dialog with file upload</span>
              </li>
              <li className="flex gap-2">
                <span>✅</span>
                <span>Status tracking: OPEN → PENDING_REVIEW → COMPLETED/NEEDS_REVISION</span>
              </li>
              <li className="flex gap-2">
                <span>✅</span>
                <span>Reviewer assessment with score (0-10) and detailed feedback</span>
              </li>
              <li className="flex gap-2">
                <span>✅</span>
                <span>Mock data with realistic scenarios and evidence</span>
              </li>
              <li className="flex gap-2">
                <span>✅</span>
                <span>Evidence display with file attachment handling</span>
              </li>
              <li className="flex gap-2">
                <span>✅</span>
                <span>Comprehensive workflow visualization</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Status Legend */}
        <div className="mt-6 rounded-lg border bg-white p-6">
          <h3 className="text-lg font-semibold mb-4">📊 Status Legend</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-3 rounded border-l-4 border-yellow-500 bg-yellow-50">
              <p className="font-semibold text-sm">OPEN</p>
              <p className="text-xs text-gray-600">Action assigned, waiting for submission</p>
            </div>
            <div className="p-3 rounded border-l-4 border-blue-500 bg-blue-50">
              <p className="font-semibold text-sm">PENDING_REVIEW</p>
              <p className="text-xs text-gray-600">Evidence submitted, awaiting assessment</p>
            </div>
            <div className="p-3 rounded border-l-4 border-green-500 bg-green-50">
              <p className="font-semibold text-sm">COMPLETED</p>
              <p className="text-xs text-gray-600">Approved, risk mitigation confirmed</p>
            </div>
            <div className="p-3 rounded border-l-4 border-red-500 bg-red-50">
              <p className="font-semibold text-sm">NEEDS_REVISION</p>
              <p className="text-xs text-gray-600">Rejected, more action required</p>
            </div>
          </div>
        </div>

        {/* API Endpoints Reference */}
        <div className="mt-6 rounded-lg border bg-gray-50 p-6">
          <h3 className="text-lg font-semibold mb-4">🔌 API Endpoints (Mock Implementation)</h3>
          <div className="space-y-3 text-sm font-mono text-gray-700">
            <div>
              <p className="font-bold text-gray-900">Submit Action Findings</p>
              <p>POST /api/v1/action-findings</p>
              <p className="text-xs text-gray-500 mt-1">
                Creates ActionFindings record with PENDING_REVIEW status
              </p>
            </div>
            <div className="border-t pt-3">
              <p className="font-bold text-gray-900">Get Action Findings</p>
              <p>GET /api/v1/risks/{"{riskId}"}/findings</p>
              <p className="text-xs text-gray-500 mt-1">
                Returns all findings for a specific risk (filtered by mock data)
              </p>
            </div>
            <div className="border-t pt-3">
              <p className="font-bold text-gray-900">Assess Action Findings</p>
              <p>PUT /api/v1/action-findings/{"{findingsId}"}/assess</p>
              <p className="text-xs text-gray-500 mt-1">
                Updates status based on reviewer decision (APPROVE/REQUEST_CHANGES)
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4 italic">
            All endpoints currently use mock data. Connect to real API by updating
            risk-module-actions.ts
          </p>
        </div>
      </div>
    </main>
  );
}
