# Infratel Audit Report System - Implementation Plan

## Project Overview
Multi-tenant audit reporting system with real-time collaboration, data visualization, and PDF export capabilities built with Go backend and React frontend.

---

## Phase 1: Foundation & Architecture (Week 1-2)

### 1.1 Technology Stack Selection

#### Backend
- **Go 1.21+**: Core API server
- **Gin/Echo**: HTTP framework (Gin recommended for performance)
- **GORM**: ORM for database operations
- **PostgreSQL**: Primary database (multi-tenancy support)
- **Redis**: Caching and session management
- **JWT**: Authentication and authorization
- **go-pdf**: PDF generation library
- **websocket**: Real-time collaboration

#### Frontend
- **React 18+**: UI framework
- **TypeScript**: Type safety
- **Recharts/Chart.js**: Data visualization
- **TanStack Query**: API state management
- **Zustand**: Client state management
- **TailwindCSS**: Styling
- **Axios**: HTTP client
- **Socket.io-client**: WebSocket client
- **jsPDF/pdfmake**: Client-side PDF preview

#### Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Local development
- **Nginx**: Reverse proxy
- **MinIO/S3**: Document storage
- **GitHub Actions**: CI/CD

### 1.2 Database Schema Design

```sql
-- Core Tables

-- 1. Multi-tenancy
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    settings JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Users with multi-tenant support
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- admin, auditor, reviewer, viewer
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Report Templates
CREATE TABLE report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- internal-audit, iso-audit, risk-report, audit-log
    version VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Report Template Sections
CREATE TABLE report_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES report_templates(id) ON DELETE CASCADE,
    section_key VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    section_type VARCHAR(50) NOT NULL, -- dynamic, system, configurable, ignore
    display_order INT NOT NULL,
    is_required BOOLEAN DEFAULT false,
    config JSONB, -- Field definitions, validation rules
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Report Instances
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    template_id UUID REFERENCES report_templates(id),
    report_number VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    quarter VARCHAR(10),
    year INT,
    status VARCHAR(50) NOT NULL, -- draft, in-review, pending-approval, approved, closed
    created_by UUID REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Report Section Data
CREATE TABLE report_section_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    section_id UUID REFERENCES report_sections(id),
    field_data JSONB NOT NULL, -- Dynamic field values
    system_generated_data JSONB, -- Auto-calculated data
    version INT DEFAULT 1,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. Findings/Issues
CREATE TABLE findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    finding_number VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    risk_rating VARCHAR(20) NOT NULL, -- High, Medium, Low
    criteria TEXT,
    condition TEXT,
    root_cause TEXT,
    impact TEXT,
    recommendation TEXT,
    management_comment TEXT,
    commitment_date DATE,
    status VARCHAR(50), -- open, in-progress, closed
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. Risk Register
CREATE TABLE risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    report_id UUID REFERENCES reports(id),
    risk_title VARCHAR(255) NOT NULL,
    risk_category VARCHAR(100),
    inherent_risk INT NOT NULL,
    residual_risk INT NOT NULL,
    risk_appetite INT,
    mitigation_actions TEXT,
    risk_owner UUID REFERENCES users(id),
    implementation_timeline DATE,
    status VARCHAR(50), -- open, monitoring, closed
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 9. Audit Log Tracking
CREATE TABLE audit_log_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    finding_id UUID REFERENCES findings(id),
    issue_title VARCHAR(255) NOT NULL,
    days_overdue INT DEFAULT 0,
    assurance_type VARCHAR(100),
    corrective_action TEXT,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 10. Charts/Visualizations Config
CREATE TABLE report_charts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    section_id UUID REFERENCES report_sections(id),
    chart_type VARCHAR(50) NOT NULL, -- pie, bar, line, table
    chart_config JSONB NOT NULL, -- Chart.js/Recharts config
    data_source JSONB NOT NULL, -- Query or static data
    display_order INT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 11. Collaboration/Comments
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    section_id UUID REFERENCES report_sections(id),
    finding_id UUID REFERENCES findings(id),
    user_id UUID REFERENCES users(id),
    comment_text TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 12. Document Attachments
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    finding_id UUID REFERENCES findings(id),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 13. Audit Trail
CREATE TABLE audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    entity_type VARCHAR(50) NOT NULL, -- report, finding, risk
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- created, updated, deleted, approved
    user_id UUID REFERENCES users(id),
    changes JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 14. Export History
CREATE TABLE export_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES reports(id),
    export_type VARCHAR(20) NOT NULL, -- pdf, docx, excel
    file_path VARCHAR(500),
    exported_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_reports_org ON reports(organization_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_findings_report ON findings(report_id);
CREATE INDEX idx_risks_org ON risks(organization_id);
CREATE INDEX idx_audit_trail_entity ON audit_trail(entity_type, entity_id);
CREATE INDEX idx_users_org ON users(organization_id);
```

### 1.3 Project Structure

```
infratel-audit-system/
├── backend/
│   ├── cmd/
│   │   └── api/
│   │       └── main.go
│   ├── internal/
│   │   ├── config/
│   │   │   └── config.go
│   │   ├── middleware/
│   │   │   ├── auth.go
│   │   │   ├── tenant.go
│   │   │   └── logger.go
│   │   ├── models/
│   │   │   ├── organization.go
│   │   │   ├── user.go
│   │   │   ├── report.go
│   │   │   ├── finding.go
│   │   │   └── risk.go
│   │   ├── repository/
│   │   │   ├── organization_repo.go
│   │   │   ├── user_repo.go
│   │   │   ├── report_repo.go
│   │   │   ├── finding_repo.go
│   │   │   └── risk_repo.go
│   │   ├── service/
│   │   │   ├── auth_service.go
│   │   │   ├── report_service.go
│   │   │   ├── finding_service.go
│   │   │   ├── risk_service.go
│   │   │   ├── chart_service.go
│   │   │   └── pdf_service.go
│   │   ├── handler/
│   │   │   ├── auth_handler.go
│   │   │   ├── report_handler.go
│   │   │   ├── finding_handler.go
│   │   │   ├── risk_handler.go
│   │   │   ├── chart_handler.go
│   │   │   └── export_handler.go
│   │   ├── websocket/
│   │   │   └── hub.go
│   │   └── utils/
│   │       ├── pdf_generator.go
│   │       ├── validator.go
│   │       └── helpers.go
│   ├── pkg/
│   │   ├── database/
│   │   │   └── postgres.go
│   │   ├── cache/
│   │   │   └── redis.go
│   │   └── storage/
│   │       └── s3.go
│   ├── migrations/
│   ├── go.mod
│   └── go.sum
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios-config.ts
│   │   │   ├── auth.api.ts
│   │   │   ├── reports.api.ts
│   │   │   ├── findings.api.ts
│   │   │   └── risks.api.ts
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── reports/
│   │   │   ├── charts/
│   │   │   └── pdf/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
└── README.md
```

---

## Phase 2: Core Backend Development (Week 3-4)

### 2.1 Setup Go Project

```bash
# Initialize project
mkdir infratel-audit-system && cd infratel-audit-system
mkdir backend && cd backend
go mod init github.com/infratel/audit-system

# Install dependencies
go get -u github.com/gin-gonic/gin
go get -u gorm.io/gorm
go get -u gorm.io/driver/postgres
go get -u github.com/golang-jwt/jwt/v5
go get -u github.com/redis/go-redis/v9
go get -u github.com/gorilla/websocket
go get -u github.com/jung-kurt/gofpdf
go get -u github.com/signintech/gopdf
go get -u github.com/google/uuid
go get -u golang.org/x/crypto/bcrypt
```

### 2.2 Database Connection & Migration

**File: `pkg/database/postgres.go`**

```go
package database

import (
    "fmt"
    "log"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
    "gorm.io/gorm/logger"
)

type Config struct {
    Host     string
    Port     string
    User     string
    Password string
    DBName   string
    SSLMode  string
}

func NewPostgresDB(config Config) (*gorm.DB, error) {
    dsn := fmt.Sprintf(
        "host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
        config.Host, config.Port, config.User, config.Password, config.DBName, config.SSLMode,
    )

    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
        Logger: logger.Default.LogMode(logger.Info),
    })

    if err != nil {
        return nil, fmt.Errorf("failed to connect to database: %w", err)
    }

    log.Println("Database connection established")
    return db, nil
}
```

### 2.3 Multi-Tenancy Middleware

**File: `internal/middleware/tenant.go`**

```go
package middleware

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

func TenantMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        // Extract organization ID from JWT claims
        orgID, exists := c.Get("organization_id")
        if !exists {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Organization context required"})
            c.Abort()
            return
        }

        // Set tenant context for all subsequent operations
        c.Set("tenant_id", orgID)
        c.Next()
    }
}

// Inject tenant filter into GORM queries
func ApplyTenantScope(db *gorm.DB, c *gin.Context) *gorm.DB {
    if orgID, exists := c.Get("organization_id"); exists {
        return db.Where("organization_id = ?", orgID)
    }
    return db
}
```

### 2.4 Authentication & Authorization

**File: `internal/service/auth_service.go`**

```go
package service

import (
    "errors"
    "time"
    "github.com/golang-jwt/jwt/v5"
    "golang.org/x/crypto/bcrypt"
)

type Claims struct {
    UserID         string `json:"user_id"`
    Email          string `json:"email"`
    OrganizationID string `json:"organization_id"`
    Role           string `json:"role"`
    jwt.RegisteredClaims
}

type AuthService struct {
    jwtSecret []byte
}

func NewAuthService(secret string) *AuthService {
    return &AuthService{jwtSecret: []byte(secret)}
}

func (s *AuthService) GenerateToken(userID, email, orgID, role string) (string, error) {
    claims := Claims{
        UserID:         userID,
        Email:          email,
        OrganizationID: orgID,
        Role:           role,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(s.jwtSecret)
}

func (s *AuthService) ValidateToken(tokenString string) (*Claims, error) {
    token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
        return s.jwtSecret, nil
    })

    if err != nil {
        return nil, err
    }

    if claims, ok := token.Claims.(*Claims); ok && token.Valid {
        return claims, nil
    }

    return nil, errors.New("invalid token")
}

func (s *AuthService) HashPassword(password string) (string, error) {
    bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
    return string(bytes), err
}

func (s *AuthService) CheckPassword(password, hash string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err == nil
}
```

---

## Phase 3: Report Management API (Week 5-6)

### 3.1 Report Service with Real-time Updates

**File: `internal/service/report_service.go`**

```go
package service

import (
    "context"
    "encoding/json"
    "fmt"
    "github.com/google/uuid"
    "gorm.io/gorm"
)

type ReportService struct {
    db      *gorm.DB
    cache   *redis.Client
    wsHub   *websocket.Hub
}

type CreateReportRequest struct {
    TemplateID  string `json:"template_id" binding:"required"`
    Title       string `json:"title" binding:"required"`
    Department  string `json:"department"`
    Quarter     string `json:"quarter"`
    Year        int    `json:"year"`
}

func (s *ReportService) CreateReport(ctx context.Context, orgID string, req CreateReportRequest) (*Report, error) {
    report := &Report{
        ID:             uuid.New().String(),
        OrganizationID: orgID,
        TemplateID:     req.TemplateID,
        ReportNumber:   s.generateReportNumber(orgID, req.Year, req.Quarter),
        Title:          req.Title,
        Department:     req.Department,
        Quarter:        req.Quarter,
        Year:           req.Year,
        Status:         "draft",
    }

    if err := s.db.Create(report).Error; err != nil {
        return nil, err
    }

    // Initialize report sections from template
    if err := s.initializeReportSections(report.ID, req.TemplateID); err != nil {
        return nil, err
    }

    // Broadcast to connected clients
    s.wsHub.Broadcast <- WebSocketMessage{
        Type:    "report_created",
        Payload: report,
    }

    return report, nil
}

func (s *ReportService) UpdateReportSection(ctx context.Context, reportID, sectionID string, data map[string]interface{}) error {
    sectionData := &ReportSectionData{
        ReportID:  reportID,
        SectionID: sectionID,
        FieldData: data,
    }

    if err := s.db.Save(sectionData).Error; err != nil {
        return err
    }

    // Cache the update
    cacheKey := fmt.Sprintf("report:%s:section:%s", reportID, sectionID)
    jsonData, _ := json.Marshal(data)
    s.cache.Set(ctx, cacheKey, jsonData, 1*time.Hour)

    // Broadcast update to collaborators
    s.wsHub.BroadcastToRoom(reportID, WebSocketMessage{
        Type: "section_updated",
        Payload: map[string]interface{}{
            "report_id":  reportID,
            "section_id": sectionID,
            "data":       data,
        },
    })

    return nil
}

func (s *ReportService) GetReportWithSections(ctx context.Context, reportID string) (*ReportResponse, error) {
    // Try cache first
    cacheKey := fmt.Sprintf("report:%s:full", reportID)
    if cached, err := s.cache.Get(ctx, cacheKey).Result(); err == nil {
        var response ReportResponse
        json.Unmarshal([]byte(cached), &response)
        return &response, nil
    }

    // Fetch from database
    var report Report
    err := s.db.Preload("Sections.Data").
        Preload("Findings").
        Preload("Charts").
        First(&report, "id = ?", reportID).Error

    if err != nil {
        return nil, err
    }

    response := s.buildReportResponse(&report)

    // Cache the result
    jsonData, _ := json.Marshal(response)
    s.cache.Set(ctx, cacheKey, jsonData, 30*time.Minute)

    return response, nil
}
```

### 3.2 Findings Management

**File: `internal/service/finding_service.go`**

```go
package service

type FindingService struct {
    db *gorm.DB
}

type CreateFindingRequest struct {
    ReportID        string `json:"report_id" binding:"required"`
    Title           string `json:"title" binding:"required"`
    RiskRating      string `json:"risk_rating" binding:"required,oneof=High Medium Low"`
    Criteria        string `json:"criteria"`
    Condition       string `json:"condition"`
    RootCause       string `json:"root_cause"`
    Impact          string `json:"impact"`
    Recommendation  string `json:"recommendation"`
}

func (s *FindingService) CreateFinding(orgID string, req CreateFindingRequest) (*Finding, error) {
    finding := &Finding{
        ID:             uuid.New().String(),
        ReportID:       req.ReportID,
        FindingNumber:  s.generateFindingNumber(req.ReportID),
        Title:          req.Title,
        RiskRating:     req.RiskRating,
        Criteria:       req.Criteria,
        Condition:      req.Condition,
        RootCause:      req.RootCause,
        Impact:         req.Impact,
        Recommendation: req.Recommendation,
        Status:         "open",
    }

    if err := s.db.Create(finding).Error; err != nil {
        return nil, err
    }

    return finding, nil
}

func (s *FindingService) UpdateManagementResponse(findingID, comment string, commitmentDate time.Time) error {
    return s.db.Model(&Finding{}).
        Where("id = ?", findingID).
        Updates(map[string]interface{}{
            "management_comment": comment,
            "commitment_date":    commitmentDate,
            "updated_at":         time.Now(),
        }).Error
}
```

---

## Phase 4: Chart & Visualization Service (Week 7)

### 4.1 Chart Data Service

**File: `internal/service/chart_service.go`**

```go
package service

type ChartService struct {
    db *gorm.DB
}

type ChartData struct {
    Labels  []string               `json:"labels"`
    Datasets []ChartDataset        `json:"datasets"`
}

type ChartDataset struct {
    Label           string   `json:"label"`
    Data            []float64 `json:"data"`
    BackgroundColor []string `json:"backgroundColor,omitempty"`
}

func (s *ChartService) GetRiskDistributionChart(orgID, reportID string) (*ChartData, error) {
    var results []struct {
        RiskRating string
        Count      int64
    }

    err := s.db.Model(&Finding{}).
        Select("risk_rating, COUNT(*) as count").
        Where("report_id = ?", reportID).
        Group("risk_rating").
        Scan(&results).Error

    if err != nil {
        return nil, err
    }

    labels := make([]string, 0)
    data := make([]float64, 0)
    colors := []string{"#EF4444", "#F59E0B", "#10B981"} // Red, Yellow, Green

    for _, r := range results {
        labels = append(labels, r.RiskRating)
        data = append(data, float64(r.Count))
    }

    return &ChartData{
        Labels: labels,
        Datasets: []ChartDataset{
            {
                Label:           "Risk Distribution",
                Data:            data,
                BackgroundColor: colors,
            },
        },
    }, nil
}

func (s *ChartService) GetAuditClosureRateChart(orgID string) (*ChartData, error) {
    var results []struct {
        Category    string
        Closed      int64
        Total       int64
        ClosureRate float64
    }

    query := `
        SELECT 
            category,
            COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed,
            COUNT(*) as total,
            (COUNT(CASE WHEN status = 'closed' THEN 1 END)::float / COUNT(*)::float * 100) as closure_rate
        FROM audit_log_items
        WHERE organization_id = ?
        GROUP BY category
    `

    err := s.db.Raw(query, orgID).Scan(&results).Error
    if err != nil {
        return nil, err
    }

    labels := make([]string, 0)
    data := make([]float64, 0)

    for _, r := range results {
        labels = append(labels, r.Category)
        data = append(data, r.ClosureRate)
    }

    return &ChartData{
        Labels: labels,
        Datasets: []ChartDataset{
            {
                Label: "Closure Rate (%)",
                Data:  data,
            },
        },
    }, nil
}
```

---

## Phase 5: PDF Export Service (Week 8)

### 5.1 PDF Generation with gopdf

**File: `internal/service/pdf_service.go`**

```go
package service

import (
    "fmt"
    "github.com/signintech/gopdf"
)

type PDFService struct {
    reportService *ReportService
    chartService  *ChartService
}

func (s *PDFService) GenerateReportPDF(reportID string) ([]byte, error) {
    // Get full report data
    report, err := s.reportService.GetReportWithSections(context.Background(), reportID)
    if err != nil {
        return nil, err
    }

    pdf := gopdf.GoPdf{}
    pdf.Start(gopdf.Config{PageSize: *gopdf.PageSizeA4})

    // Add fonts
    pdf.AddTTFFont("regular", "/fonts/DejaVuSans.ttf")
    pdf.AddTTFFont("bold", "/fonts/DejaVuSans-Bold.ttf")

    // Cover Page
    s.addCoverPage(&pdf, report)

    // Table of Contents
    s.addTableOfContents(&pdf, report)

    // Executive Summary
    pdf.AddPage()
    s.addSection(&pdf, "Executive Summary", report.ExecutiveSummary)

    // Sections
    for _, section := range report.Sections {
        pdf.AddPage()
        s.addSection(&pdf, section.Title, section.Content)

        // Add fields
        for key, value := range section.FieldData {
            s.addField(&pdf, key, value)
        }
    }

    // Findings
    if len(report.Findings) > 0 {
        pdf.AddPage()
        s.addFindingsSection(&pdf, report.Findings)
    }

    // Charts
    for _, chart := range report.Charts {
        pdf.AddPage()
        s.addChart(&pdf, chart)
    }

    // Signatures
    pdf.AddPage()
    s.addSignatures(&pdf, report)

    // Write to buffer
    var buf bytes.Buffer
    pdf.WriteTo(&buf)

    return buf.Bytes(), nil
}

func (s *PDFService) addCoverPage(pdf *gopdf.GoPdf, report *ReportResponse) {
    pdf.AddPage()
    
    // Logo
    pdf.Image("/assets/logo.png", 50, 50, &gopdf.Rect{W: 150, H: 75})

    // Title
    pdf.SetFont("bold", "", 24)
    pdf.SetY(200)
    pdf.Cell(nil, report.Title)

    // Report Details
    pdf.SetFont("regular", "", 12)
    pdf.SetY(250)
    pdf.Cell(nil, fmt.Sprintf("Report Number: %s", report.ReportNumber))
    pdf.SetY(270)
    pdf.Cell(nil, fmt.Sprintf("Department: %s", report.Department))
    pdf.SetY(290)
    pdf.Cell(nil, fmt.Sprintf("Period: Q%s %d", report.Quarter, report.Year))
    pdf.SetY(310)
    pdf.Cell(nil, fmt.Sprintf("Date: %s", report.CreatedAt.Format("02 January 2006")))
}

func (s *PDFService) addFindingsSection(pdf *gopdf.GoPdf, findings []Finding) {
    pdf.SetFont("bold", "", 16)
    pdf.Cell(nil, "Detailed Findings")
    pdf.Br(20)

    for i, finding := range findings {
        pdf.SetFont("bold", "", 14)
        pdf.Cell(nil, fmt.Sprintf("%d. %s", i+1, finding.Title))
        pdf.Br(10)

        // Risk Rating with color
        pdf.SetFont("bold", "", 12)
        s.setRiskColor(pdf, finding.RiskRating)
        pdf.Cell(nil, fmt.Sprintf("Risk Rating: %s", finding.RiskRating))
        pdf.SetTextColor(0, 0, 0) // Reset to black
        pdf.Br(10)

        // Finding details
        pdf.SetFont("regular", "", 10)
        s.addLabeledText(pdf, "Criteria:", finding.Criteria)
        s.addLabeledText(pdf, "Condition:", finding.Condition)
        s.addLabeledText(pdf, "Root Cause:", finding.RootCause)
        s.addLabeledText(pdf, "Impact:", finding.Impact)
        s.addLabeledText(pdf, "Recommendation:", finding.Recommendation)
        
        if finding.ManagementComment != "" {
            s.addLabeledText(pdf, "Management Comment:", finding.ManagementComment)
        }
        
        if !finding.CommitmentDate.IsZero() {
            pdf.Cell(nil, fmt.Sprintf("Commitment Date: %s", finding.Comm