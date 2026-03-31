# Heat Map — Dynamic Rating Levels

**Endpoint:** `GET /api/v1/risks/heatmap`  
**Backend:** Go · net/http · PostgreSQL

---

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `matrix_id` | UUID | No | Defaults to the org's `risk_matrices` row where `is_default = true` |
| `type` | string | No | `"inherent"` (default) or `"residual"` |
| `register_id` | UUID | No | Filter risks by a specific risk register |

---

## Response Shape

```json
{
  "type": "inherent",
  "register_id": null,

  "metadata": {
    "title": "Inherent Risk Heatmap",
    "description": "Risk distribution across the matrix",
    "register_name": "Enterprise Risk Register",
    "matrix_name": "Standard 5×5 Matrix",
    "likelihood_levels": 5,
    "impact_levels": 5,
    "date_range": {
      "start_date": "2026-01-01T00:00:00Z",
      "end_date": "2026-03-31T00:00:00Z"
    },
    "total_risks": 12,
    "generated_at": "2026-03-31T10:00:00Z"
  },

  "rating_levels": [
    {
      "id": "uuid",
      "name": "Low",
      "min_score": 1,
      "max_score": 6,
      "color_hex": "#22c55e",
      "description": "Acceptable risk level",
      "count": 3
    },
    {
      "id": "uuid",
      "name": "Medium",
      "min_score": 7,
      "max_score": 14,
      "color_hex": "#eab308",
      "description": "Monitor closely",
      "count": 5
    }
  ],

  "matrix": [
    {
      "likelihood": 3,
      "impact": 4,
      "likelihood_label": "Possible",
      "impact_label": "Major",
      "score": 12,
      "rating_level_id": "uuid",
      "rating_level_name": "Medium",
      "color_hex": "#eab308",
      "count": 2,
      "risks": [
        {
          "id": "uuid",
          "title": "Data breach vulnerability",
          "description": "Unpatched systems expose sensitive data",
          "category_name": "Cybersecurity",
          "department_name": "IT",
          "risk_owner_name": "John Doe",
          "status": "IDENTIFIED",
          "recurrence": "ONGOING",
          "risk_appetite_status": "ABOVE",
          "controls_count": 2,
          "mitigation_cost": 15000.00,
          "target_closing_date": "2026-06-30T00:00:00Z",
          "created_at": "2026-01-15T08:00:00Z",
          "updated_at": "2026-03-10T14:30:00Z"
        }
      ]
    }
  ],

  "summary": {
    "by_rating_level": [
      {
        "id": "uuid",
        "name": "Low",
        "min_score": 1,
        "max_score": 6,
        "color_hex": "#22c55e",
        "description": "Acceptable risk level",
        "count": 3
      }
    ],
    "average_score": 12.4,
    "highest_score": 25,
    "lowest_score": 4,
    "within_appetite_count": 7,
    "above_appetite_count": 5
  }
}
```

> **`matrix` must contain all N×M cells** — even cells with no risks (`count: 0`, `risks: []`). The frontend colors the full grid, including empty cells, using `color_hex`.
>
> **Remove from the old response:** `summary.low_count`, `summary.medium_count`, `summary.high_count`, `summary.very_high_count`, `matrix[].color` (string enum), `matrix[].rating` (string enum).

---

## Go Structs

```go
type RatingLevelSummary struct {
    ID          string `json:"id"`
    Name        string `json:"name"`
    MinScore    int    `json:"min_score"`
    MaxScore    int    `json:"max_score"`
    ColorHex    string `json:"color_hex"`
    Description string `json:"description"`
    Count       int    `json:"count"`
}

type HeatmapRisk struct {
    ID                 string    `json:"id"`
    Title              string    `json:"title"`
    Description        string    `json:"description"`
    CategoryName       string    `json:"category_name"`
    DepartmentName     string    `json:"department_name"`
    RiskOwnerName      string    `json:"risk_owner_name"`
    Status             string    `json:"status"`
    Recurrence         string    `json:"recurrence"`
    RiskAppetiteStatus string    `json:"risk_appetite_status"`
    ControlsCount      int       `json:"controls_count"`
    MitigationCost     float64   `json:"mitigation_cost"`
    TargetClosingDate  time.Time `json:"target_closing_date"`
    CreatedAt          time.Time `json:"created_at"`
    UpdatedAt          time.Time `json:"updated_at"`
}

type MatrixCell struct {
    Likelihood      int           `json:"likelihood"`
    Impact          int           `json:"impact"`
    LikelihoodLabel string        `json:"likelihood_label"`
    ImpactLabel     string        `json:"impact_label"`
    Score           int           `json:"score"`
    RatingLevelID   string        `json:"rating_level_id"`
    RatingLevelName string        `json:"rating_level_name"`
    ColorHex        string        `json:"color_hex"`
    Count           int           `json:"count"`
    Risks           []HeatmapRisk `json:"risks"`
}

type HeatmapSummary struct {
    ByRatingLevel       []RatingLevelSummary `json:"by_rating_level"`
    AverageScore        float64              `json:"average_score"`
    HighestScore        int                  `json:"highest_score"`
    LowestScore         int                  `json:"lowest_score"`
    WithinAppetiteCount int                  `json:"within_appetite_count"`
    AboveAppetiteCount  int                  `json:"above_appetite_count"`
}

type HeatmapMetadata struct {
    Title            string    `json:"title"`
    Description      string    `json:"description"`
    RegisterName     string    `json:"register_name"`
    MatrixName       string    `json:"matrix_name"`
    LikelihoodLevels int       `json:"likelihood_levels"`
    ImpactLevels     int       `json:"impact_levels"`
    DateRange        struct {
        StartDate time.Time `json:"start_date"`
        EndDate   time.Time `json:"end_date"`
    } `json:"date_range"`
    TotalRisks  int       `json:"total_risks"`
    GeneratedAt time.Time `json:"generated_at"`
}

type HeatmapResponse struct {
    Type         string               `json:"type"`
    RegisterID   *string              `json:"register_id"`
    Metadata     HeatmapMetadata      `json:"metadata"`
    RatingLevels []RatingLevelSummary `json:"rating_levels"`
    Matrix       []MatrixCell         `json:"matrix"`
    Summary      HeatmapSummary       `json:"summary"`
}
```

---

## Handler Logic

```go
func GetHeatmap(w http.ResponseWriter, r *http.Request) {
    matrixID    := r.URL.Query().Get("matrix_id")
    heatmapType := r.URL.Query().Get("type")
    registerID  := r.URL.Query().Get("register_id")

    // 1. Resolve matrix — fall back to org default
    if matrixID == "" {
        row := db.QueryRow(`
            SELECT id FROM risk_matrices
            WHERE organization_id = $1 AND is_default = true
            LIMIT 1
        `, orgID)
        if row == nil {
            http.Error(w, "no default matrix configured", http.StatusUnprocessableEntity)
            return
        }
        matrixID = row.ID
    }
    if heatmapType == "" {
        heatmapType = "inherent"
    }

    // 2. Load rating levels (sorted by min_score ASC)
    ratingLevels := db.Query(`
        SELECT id, name, min_score, max_score, color_hex, description
        FROM rating_levels
        WHERE matrix_id = $1
        ORDER BY min_score ASC
    `, matrixID)

    if len(ratingLevels) == 0 {
        respondJSON(w, emptyHeatmapResponse(matrixID))
        return
    }

    // 3. Load scale labels
    scales := db.Query(`
        SELECT scale_type, level, name
        FROM matrix_scales
        WHERE matrix_id = $1
        ORDER BY level ASC
    `, matrixID)

    likelihoodLabels := map[int]string{}
    impactLabels     := map[int]string{}
    for _, s := range scales {
        if s.ScaleType == "LIKELIHOOD" {
            likelihoodLabels[s.Level] = s.Name
        } else {
            impactLabels[s.Level] = s.Name
        }
    }
    likelihoodLevels := countScales(scales, "LIKELIHOOD")
    impactLevels     := countScales(scales, "IMPACT")

    // 4. Load risks for this matrix only
    likelihoodCol := "inherent_likelihood"
    impactCol     := "inherent_impact"
    if heatmapType == "residual" {
        likelihoodCol = "residual_likelihood"
        impactCol     = "residual_impact"
    }

    risks := db.Query(`
        SELECT
            r.id, r.title, r.description, r.status, r.recurrence,
            r.risk_appetite_status, r.controls_count, r.mitigation_cost,
            r.target_closing_date, r.created_at, r.updated_at,
            `+likelihoodCol+` AS likelihood,
            `+impactCol+`     AS impact,
            c.name                                   AS category_name,
            d.name                                   AS department_name,
            u.first_name || ' ' || u.last_name       AS risk_owner_name
        FROM risks r
        LEFT JOIN risk_categories c ON r.category_id   = c.id
        LEFT JOIN departments d     ON r.department_id  = d.id
        LEFT JOIN users u           ON r.risk_owner_id  = u.id
        WHERE r.organization_id = $1
          AND r.matrix_id       = $2
          AND r.likelihood IS NOT NULL
          AND r.impact     IS NOT NULL
        ORDER BY r.created_at DESC
    `, orgID, matrixID)

    // 5. Group risks by cell
    type cellKey struct{ L, I int }
    cellMap := map[cellKey][]Risk{}
    for _, risk := range risks {
        key := cellKey{risk.Likelihood, risk.Impact}
        cellMap[key] = append(cellMap[key], risk)
    }

    // 6. Emit ALL N×M cells (empty cells included — they still get a color)
    ratingLevelCounts := map[string]int{}
    var matrix []MatrixCell
    var allScores []int
    withinAppetite, aboveAppetite := 0, 0

    for l := 1; l <= likelihoodLevels; l++ {
        for i := 1; i <= impactLevels; i++ {
            score     := l * i
            level     := findRatingLevel(ratingLevels, score)
            cellRisks := cellMap[cellKey{l, i}]

            matrix = append(matrix, MatrixCell{
                Likelihood:      l,
                Impact:          i,
                LikelihoodLabel: likelihoodLabels[l],
                ImpactLabel:     impactLabels[i],
                Score:           score,
                RatingLevelID:   level.ID,
                RatingLevelName: level.Name,
                ColorHex:        level.ColorHex,
                Count:           len(cellRisks),
                Risks:           cellRisks,
            })

            ratingLevelCounts[level.ID] += len(cellRisks)
            if len(cellRisks) > 0 {
                allScores = append(allScores, score)
            }
            for _, risk := range cellRisks {
                if risk.RiskAppetiteStatus == "WITHIN" {
                    withinAppetite++
                } else {
                    aboveAppetite++
                }
            }
        }
    }

    // 7. Build summary
    byRatingLevel := []RatingLevelSummary{}
    for _, rl := range ratingLevels {
        byRatingLevel = append(byRatingLevel, RatingLevelSummary{
            ID: rl.ID, Name: rl.Name,
            MinScore: rl.MinScore, MaxScore: rl.MaxScore,
            ColorHex: rl.ColorHex, Description: rl.Description,
            Count: ratingLevelCounts[rl.ID],
        })
    }

    respondJSON(w, HeatmapResponse{
        Type:         heatmapType,
        RegisterID:   nilIfEmpty(registerID),
        Metadata:     buildMetadata(matrixID, heatmapType, likelihoodLevels, impactLevels, len(risks)),
        RatingLevels: byRatingLevel,
        Matrix:       matrix,
        Summary: HeatmapSummary{
            ByRatingLevel:       byRatingLevel,
            AverageScore:        average(allScores),
            HighestScore:        max(allScores),
            LowestScore:         min(allScores),
            WithinAppetiteCount: withinAppetite,
            AboveAppetiteCount:  aboveAppetite,
        },
    })
}

// findRatingLevel returns the matching rating level for a score.
// Clamps to the first level if below range, last level if above range.
func findRatingLevel(levels []RatingLevel, score int) RatingLevel {
    for _, l := range levels {
        if score >= l.MinScore && score <= l.MaxScore {
            return l
        }
    }
    if score < levels[0].MinScore {
        return levels[0]
    }
    return levels[len(levels)-1]
}
```

---

## Alternative: SQL-only Classification (LATERAL JOIN)

If you prefer to classify risks in SQL rather than Go:

```sql
SELECT
    r.id,
    r.inherent_likelihood                              AS likelihood,
    r.inherent_impact                                  AS impact,
    (r.inherent_likelihood * r.inherent_impact)        AS score,
    rl.id                                              AS rating_level_id,
    rl.name                                            AS rating_level_name,
    rl.color_hex,
    ls.name                                            AS likelihood_label,
    is_.name                                           AS impact_label
FROM risks r
JOIN LATERAL (
    SELECT id, name, color_hex
    FROM rating_levels
    WHERE matrix_id = $1
      AND (r.inherent_likelihood * r.inherent_impact) >= min_score
      AND (r.inherent_likelihood * r.inherent_impact) <= max_score
    ORDER BY min_score ASC
    LIMIT 1
) rl ON true
LEFT JOIN matrix_scales ls
    ON ls.matrix_id = $1 AND ls.scale_type = 'LIKELIHOOD'
   AND ls.level = r.inherent_likelihood
LEFT JOIN matrix_scales is_
    ON is_.matrix_id = $1 AND is_.scale_type = 'IMPACT'
   AND is_.level = r.inherent_impact
WHERE r.organization_id = $2
  AND r.matrix_id        = $1
  AND r.inherent_likelihood IS NOT NULL
  AND r.inherent_impact     IS NOT NULL;
```

> For scores outside all rating level ranges, use a `COALESCE` with a second lateral join: `ORDER BY min_score ASC LIMIT 1` for underflow, `ORDER BY max_score DESC LIMIT 1` for overflow.

---

## Error States

| Condition | Response |
|---|---|
| `matrix_id` omitted | Resolve to org's `is_default = true` matrix |
| No default matrix configured | `422 Unprocessable Entity` |
| `matrix_id` not found | `404 Not Found` |
| `matrix_id` belongs to a different org | `403 Forbidden` |
| No rating levels configured for matrix | `200` — `rating_levels: []`, `matrix: []`, zeroed summary |
| No risks for this matrix | `200` — `rating_levels` populated, `matrix` all cells with `count: 0` |

---

## Deliverables Checklist

- [ ] Resolve `matrix_id` from query param; fall back to org default (`is_default = true`)
- [ ] Filter risks with `WHERE r.matrix_id = $matrixId`
- [ ] Fetch `rating_levels` sorted by `min_score ASC`
- [ ] Fetch `matrix_scales` for `likelihood_label` / `impact_label` per cell
- [ ] Emit **all N×M cells** — loop `l = 1..likelihoodLevels`, `i = 1..impactLevels`
- [ ] Set `color_hex`, `rating_level_id`, `rating_level_name` on every cell via `findRatingLevel`
- [ ] Include top-level `rating_levels[]` array in the response
- [ ] Replace `summary.low_count/medium_count/high_count/very_high_count` with `summary.by_rating_level[]`
- [ ] Include `metadata.likelihood_levels`, `metadata.impact_levels`, `metadata.matrix_name`
- [ ] Handle all error states above
