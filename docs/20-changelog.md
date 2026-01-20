# 20 - Changelog

## Version 2.0 (Current)

**Release Date:** January 2026

### Major Features

#### Report Builder Enhancements
- Complete report status synchronization between UI and database
- Smart template merging with section preservation
- Fixed report ID persistence after template merge
- Conditional UI based on report status (hide Save Draft for published reports)
- Full cache revalidation strategy (server + client)
- Feature parity between report details page and audit plan report tab

#### Component Updates
- StatusBadge component integration across all modules
- CustomAlert component for error messaging
- Improved report export error handling
- PDF export optimization

#### Documentation
- Complete documentation restructure (20 sequential files)
- Concise, focused documentation per module
- Clear navigation and cross-referencing
- Updated troubleshooting guide with common issues

### Bug Fixes
- Fixed "Report ID is required" error when saving/publishing reports
- Fixed status out of sync between report_content and database
- Fixed UI not refreshing after save/publish operations
- Fixed Save Draft button visibility for published reports

### Technical Improvements
- Enhanced cache invalidation with comprehensive query revalidation
- Explicit status and ID override after template merging
- Improved mutation hooks with router.refresh()
- Better error handling in report operations

### Code Cleanup
- Removed duplicate template-service.ts files
- Deleted redundant documentation (19 files)
- Consolidated report templates
- Cleaned up old implementation guides

---

## Version 1.9

**Release Date:** December 2025

### Features
- ISO 27001:2022 framework support
- Risk heat map visualization
- Workflow approval system
- Screen lock security feature
- Multi-factor authentication (MFA)

### Improvements
- Performance optimizations
- Database query optimization
- React Query integration
- Zustand state management

---

## Version 1.8

**Release Date:** November 2025

### Features
- Report builder with drag-and-drop
- PDF export functionality
- Dynamic report sections
- Template system

### Bug Fixes
- Fixed finding severity display
- Resolved audit plan filtering issues
- Fixed user role permissions

---

## Version 1.7

**Release Date:** October 2025

### Features
- Audit plan management
- Findings tracking
- Workpapers module
- Control reference support

### Improvements
- UI/UX enhancements
- Mobile responsiveness
- Loading state improvements

---

## Version 1.6

**Release Date:** September 2025

### Features
- Risk register
- Risk assessment matrix
- Treatment plans
- KRI tracking

### Bug Fixes
- Fixed risk score calculation
- Resolved date picker issues

---

## Version 1.5

**Release Date:** August 2025

### Features
- User management
- Role-based access control
- System settings
- Branding customization

### Security
- Row-Level Security implementation
- Enhanced authentication
- Session management improvements

---

## Version 1.0

**Release Date:** June 2025

### Initial Release
- Basic audit management
- Simple risk tracking
- User authentication
- Database setup
- Core UI components

---

## Upcoming (Roadmap)

### Version 2.1 (Q2 2026)
- [ ] Advanced analytics dashboard
- [ ] AI-powered finding suggestions
- [ ] Bulk import/export
- [ ] Custom report templates builder
- [ ] Integration with ticketing systems

### Version 2.2 (Q3 2026)
- [ ] Real-time collaboration
- [ ] Version control for reports
- [ ] Advanced workflow automation
- [ ] Mobile app
- [ ] API webhooks

### Version 3.0 (Q4 2026)
- [ ] Compliance dashboard
- [ ] Risk forecasting with ML
- [ ] Integration marketplace
- [ ] White-label support
- [ ] Multi-tenancy improvements

---

## Migration Guides

### Upgrading to 2.0

**Critical Changes:**

1. **Report Status Sync:**
   - Reports now use explicit status from database
   - Update components to pass `reportStatus` prop

2. **Cache Revalidation:**
   - All mutations now require comprehensive cache invalidation
   - Update mutation hooks to use new pattern

3. **Template Merging:**
   - Report ID and status now explicitly overridden after merge
   - Update any custom template merge logic

**Migration Steps:**

```bash
# 1. Backup database
pg_dump > backup.sql

# 2. Pull latest code
git pull origin main

# 3. Install dependencies
npm install

# 4. Update environment variables (if needed)
# Check .env.example for new variables

# 5. Run type check
npm run type-check

# 6. Test locally
npm run dev

# 7. Deploy
vercel --prod
```

### Upgrading from 1.x to 2.0

**Breaking Changes:**

- Report content structure updated
- Status management changed
- Template service refactored
- Some API endpoints modified

**Required Actions:**

1. Review [09-reports-module.md](09-reports-module.md) for new patterns
2. Update custom report components
3. Test all report workflows
4. Verify PDF export functionality
5. Check cache invalidation in custom hooks

---

## Deprecations

### Version 2.0
- Deprecated: Old report template format (removed in 2.0)
- Deprecated: Direct status updates to report_content (use database status)
- Deprecated: Manual cache revalidation (use new strategy)

### Version 1.9
- Deprecated: Old workflow API (removed in 2.0)
- Deprecated: Legacy finding format (removed in 2.0)

---

## Security Advisories

### 2026-01-15
**Report Status Bypass**
- **Severity:** Medium
- **Fixed in:** 2.0
- **Description:** Status in report_content could override database status
- **Mitigation:** Upgrade to 2.0, explicit status override implemented

### 2025-12-10
**Cache Invalidation Issue**
- **Severity:** Low
- **Fixed in:** 2.0
- **Description:** UI not refreshing after mutations
- **Mitigation:** Upgrade to 2.0, comprehensive revalidation added

---

## Contributors

- Development Team
- Security Team
- Documentation Team
- QA Team

---

## License

Proprietary - INFRATEL IAMS
Copyright © 2025-2026 INFRATEL

---

**End of Changelog**

← Return to [README.md](README.md)
