import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { SearchSelectField } from "@/components/ui/search-select-field";
import { StepTwoData, RiskMatrix } from "@/lib/types/risk-type";
import { RiskSlider } from "../risk-slider";
import { RiskScoreDisplay } from "../risk-score-display";

interface StepTwoProps {
  data: StepTwoData;
  onChange: (data: Partial<StepTwoData>) => void;
  riskMatrices: RiskMatrix[];
  selectedMatrix: RiskMatrix | null;
  onMatrixChange: (matrixId: string) => void;
  likelihoodRange: { min: number; max: number };
  impactRange: { min: number; max: number };
  isLoading: boolean;
  loadingMatrices: boolean;
}

export function StepTwo({
  data,
  onChange,
  riskMatrices,
  selectedMatrix,
  onMatrixChange,
  likelihoodRange,
  impactRange,
  isLoading,
  loadingMatrices
}: StepTwoProps) {
  const inherentScore = data.inherent_likelihood * data.inherent_impact;

  return (
    <>
      <div className="space-y-4 rounded-lg border p-4">
        <h3 className="font-semibold">Inherent Risk Assessment</h3>
        <p className="text-muted-foreground text-sm">
          Assess the risk before considering any controls
        </p>

        <SearchSelectField
          label="Risk Matrix"
          required
          placeholder="Select risk matrix"
          options={riskMatrices}
          value={data.risk_matrix_id}
          onValueChange={onMatrixChange}
          isLoading={loadingMatrices}
          isDisabled={isLoading || loadingMatrices}
          classNames={{ wrapper: "max-w-full" }}
          descriptionText={
            selectedMatrix
              ? `Likelihood: ${selectedMatrix.likelihood_min || 1}-${selectedMatrix.likelihood_max || 5}, Impact: ${selectedMatrix.impact_min || 1}-${selectedMatrix.impact_max || 5}`
              : "Select a matrix to define risk assessment ranges"
          }
        />

        <div className="grid grid-cols-2 gap-4">
          <RiskSlider
            id="inherent_likelihood"
            label="Likelihood"
            value={data.inherent_likelihood}
            min={likelihoodRange.min}
            max={likelihoodRange.max}
            onChange={(value) => onChange({ inherent_likelihood: value })}
            disabled={isLoading || !data.risk_matrix_id}
            minLabel="Rare"
            maxLabel="Almost Certain"
          />
          <RiskSlider
            id="inherent_impact"
            label="Impact"
            value={data.inherent_impact}
            min={impactRange.min}
            max={impactRange.max}
            onChange={(value) => onChange({ inherent_impact: value })}
            disabled={isLoading || !data.risk_matrix_id}
            minLabel="Insignificant"
            maxLabel="Catastrophic"
          />
        </div>

        <RiskScoreDisplay
          score={inherentScore}
          likelihood={data.inherent_likelihood}
          impact={data.inherent_impact}
          label="Inherent"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="existing_controls">Existing Controls</Label>
        <Textarea
          id="existing_controls"
          placeholder="Describe current controls in place (optional)"
          rows={3}
          value={data.existing_controls}
          onChange={(e) => onChange({ existing_controls: e.target.value })}
          disabled={isLoading}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="control_effectiveness">Control Effectiveness</Label>
        <Select
          value={String(data.control_effectiveness)}
          onValueChange={(value) => onChange({ control_effectiveness: Number(value) })}
          disabled={isLoading}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 - Highly Effective</SelectItem>
            <SelectItem value="2">2 - Effective</SelectItem>
            <SelectItem value="3">3 - Partially Effective</SelectItem>
            <SelectItem value="4">4 - Ineffective</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
