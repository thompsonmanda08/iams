import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface RiskSliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  minLabel?: string;
  maxLabel?: string;
}

export function RiskSlider({
  id,
  label,
  value,
  min,
  max,
  onChange,
  disabled = false,
  minLabel = "Rare",
  maxLabel = "Almost Certain"
}: RiskSliderProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>
        {label} ({`${min}-${max}`})
        <span className="text-muted-foreground ml-2 text-sm">{value}</span>
      </Label>
      <Slider
        id={id}
        min={min}
        max={max}
        step={1}
        value={[value]}
        onValueChange={(val) => onChange(val[0])}
        className="w-full"
        disabled={disabled}
      />
      <p className="text-muted-foreground text-xs">
        {min} = {minLabel}, {max} = {maxLabel}
      </p>
    </div>
  );
}
