interface RiskScoreDisplayProps {
  score: number;
  likelihood: number;
  impact: number;
  label: string;
}

export function RiskScoreDisplay({ score, likelihood, impact, label }: RiskScoreDisplayProps) {
  const getRiskLevel = (score: number) => {
    if (score >= 15) return { label: "Critical", color: "text-red-600" };
    if (score >= 10) return { label: "High", color: "text-orange-600" };
    if (score >= 5) return { label: "Medium", color: "text-yellow-600" };
    return { label: "Low", color: "text-green-600" };
  };

  const riskLevel = getRiskLevel(score);

  return (
    <div className="bg-muted/50 flex items-center justify-between rounded-lg p-3">
      <div>
        <span className="text-sm font-medium">{label} Score:</span>
        <span className="ml-2 text-xl font-bold">{score}</span>
        <span className="text-muted-foreground ml-2 text-xs">
          ({impact}×{likelihood})
        </span>
      </div>
      <div>
        <span className="text-sm font-medium">Level:</span>
        <span className={`ml-2 font-semibold ${riskLevel.color}`}>{riskLevel.label}</span>
      </div>
    </div>
  );
}
