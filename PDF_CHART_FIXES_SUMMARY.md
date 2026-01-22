# PDF Chart Rendering Fixes

## Summary
Fixed two critical issues in PDF chart rendering:
1. **Bar Chart Error**: Fixed Math.max() error by handling both flat and nested data structures
2. **Pie Chart Visualization**: Replaced horizontal bars with actual SVG pie chart rendering

## Changes Made

### 1. Bar Chart Widget - Data Structure Conversion

**File**: `components/reports/pdf-react/pdf-document.tsx` (lines 440-475)

**Problem**:
The bar chart code expected data in nested format `{label, series: [{label, value, color}]}`, but the API returns flat format `{categories: string[], series: [{label, data: [], color}]}`. This caused `Math.max()` to fail on empty arrays.

**Solution**:
Added data structure detection and conversion logic (matching the implementation in `bar-chart-widget.tsx`):

```typescript
// Detect if using flat structure (from API) or nested structure (legacy)
const isFlatStructure = Array.isArray(rawCategories) &&
  typeof rawCategories[0] === 'string' &&
  seriesData;

// Convert flat structure to nested for rendering if needed
const categories = isFlatStructure
  ? (rawCategories as string[]).map((catLabel, catIndex) => ({
      label: catLabel,
      series: (seriesData || []).map((s: any) => ({
        label: s.label,
        value: s.data?.[catIndex] || 0,
        color: s.color
      }))
    }))
  : Array.isArray(rawCategories)
  ? rawCategories
  : [];
```

### 2. Defensive Null Checks - Bar Chart

**Changes**:
- Added validation for empty categories before rendering: `if (!categories || categories.length === 0)`
- Used optional chaining in series iteration: `(category?.series || [])`
- Added minimum height for bars: `height: barHeight > 0 ? barHeight : 2`
- Added fallback colors: `backgroundColor: series.color || "#ccc"`
- Protected legend generation with conditional rendering: `{categories && categories.length > 0 && (...)}`

### 3. Pie Chart Widget - SVG Implementation

**File**: `components/reports/pdf-react/pdf-document.tsx` (lines 367-483)

**Problem**:
Pie chart was rendering as horizontal bars with only labels and values visible, not as an actual pie chart visualization.

**Solution**:
Implemented SVG-based pie chart with:
- **Mathematical pie path generation**: Calculates SVG arc paths using trigonometry for each slice
- **Arc calculation**: Uses SVG arc command (A) with proper parameters for smooth pie rendering
- **Color mapping**: Each slice gets its own color from the data
- **Side legend**: Shows label, value count, and percentage next to pie chart
- **Responsive layout**: Pie chart and legend arranged horizontally with proper spacing

**Key implementation**:
```typescript
const generatePieChart = () => {
  const radius = 50;
  const centerX = 60;
  const centerY = 60;
  let currentAngle = -Math.PI / 2; // Start from top

  slices.forEach((slice: any, idx: number) => {
    const sliceAngle = (slice.value / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;

    // Calculate arc endpoints
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    // Use large-arc-flag for slices > 180 degrees
    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    // Build SVG path: Move to center, line to start, arc to end, close path
    const pathData = [
      `M${centerX},${centerY}`,
      `L${x1},${y1}`,
      `A${radius},${radius} 0 ${largeArc},1 ${x2},${y2}`,
      'Z'
    ].join(' ');

    paths.push({
      d: pathData,
      fill: slice.color || '#ccc',
      label: slice.label || 'Unknown',
      value: slice.value,
      percentage: ((slice.value / total) * 100).toFixed(1)
    });

    currentAngle = endAngle;
  });

  return paths;
};
```

## Testing Recommendations

1. **Bar Chart**: Test with both vertical and horizontal orientations
   - Verify no Math.max() errors
   - Check that categories and series render correctly
   - Ensure legend shows all series labels

2. **Pie Chart**: Verify visual representation
   - Check that pie segments display with correct colors
   - Verify percentages are calculated correctly
   - Test with varying data distributions (skewed vs. even)
   - Test with single slice and multiple slices

3. **Edge Cases**:
   - Empty data arrays
   - Single category/slice
   - All zero values
   - Very large/very small value differences

## Compatibility Notes

- Code maintains backward compatibility with both flat and nested data structures
- No API changes required
- All changes are defensive (null checks added throughout)
- SVG pie chart works with @react-pdf/renderer's SVG support

## Files Modified

1. `components/reports/pdf-react/pdf-document.tsx`
   - Pie chart section: Added SVG pie chart implementation
   - Bar chart section: Added data structure conversion and defensive checks
   - Legend rendering: Added null safety checks for both chart types
