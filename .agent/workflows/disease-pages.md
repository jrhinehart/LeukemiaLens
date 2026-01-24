---
description: Disease-specific resource page development
domain: frontend/src/DiseasePage.tsx, workers/api (news endpoint)
owner: Disease Content Agent
---

# Disease Page Development

## Scope & Ownership

This agent owns the **disease-specific resource pages** that provide curated information for each blood cancer group. Primary files:

- `frontend/src/DiseasePage.tsx` - Disease page component and `DISEASE_GROUPS` data
- `workers/api/src/index.ts` - News API endpoint (if expanding news sources)

## Current Disease Groups

| Group | ID | Diseases Covered | Route |
|-------|----|-----------------:|-------|
| Myeloid Neoplasms | `myeloid` | AML, MDS, CML, MPN | `/myeloid` |
| Lymphoid Neoplasms | `lymphoid` | ALL, CLL | `/lymphoid` |
| Multiple Myeloma | `myeloma` | MGUS, SMM, MM | `/myeloma` |

## Data Structure

Each disease group is defined in the `DISEASE_GROUPS` object:

```typescript
interface DiseaseInfo {
    id: string;                    // URL route identifier
    name: string;                  // Display name
    headerQuestion: string;        // "What are X?"
    description: string;           // Overview paragraph
    subDiseases: SubDiseaseInfo[]; // Individual disease details
    treatments: TreatmentInfo[];   // Common treatments with links
    diseases: string[];            // Disease codes for search filtering
    clinicalTrialsQuery: string;   // Query for ClinicalTrials.gov
}

interface SubDiseaseInfo {
    abbrev: string;      // e.g., "AML"
    name: string;        // e.g., "Acute Myeloid Leukemia"
    description: string; // 2-3 sentence explanation
}

interface TreatmentInfo {
    name: string;  // Treatment name
    url: string;   // Link to authoritative source
}
```

## Content Guidelines

### Disease Descriptions
- **Explain in patient terms** - What is it? How does it differ from similar conditions?
- **Include key differentiators** - What makes AML different from CML?
- **Mention progression/prognosis context** - Without being alarmist
- **Keep to 2-4 sentences** per sub-disease

### Treatment Links
- Link to **Blood Cancer United** or **LLS** pages, not drug manufacturer sites
- Group treatments logically (chemo, targeted therapy, transplant, etc.)
- Include both drug names AND protocol names where relevant (e.g., "7+3 regimen")

### External Resources Required
Every disease page should link to:
- [ ] Treatment options (Blood Cancer United)
- [ ] Clinical trials (ClinicalTrials.gov with query)
- [ ] Patient support (LLS Caregiver Support)
- [ ] Financial assistance (LLS Financial Support)

## Expansion Ideas

### Additional Disease Groups to Add
- [ ] Hodgkin Lymphoma
- [ ] Non-Hodgkin Lymphoma (NHL)
- [ ] Rare Blood Cancers (Hairy Cell Leukemia, etc.)

### Enhanced Features
- [ ] Link to relevant LeukemiaLens article searches per disease
- [ ] Patient stories/testimonials section
- [ ] Doctor locator integration
- [ ] Support group finder

## Live News Feed

The news feed currently fetches from `/api/news/{diseaseGroup}`. If expanding news sources:

1. Add source configuration in the API worker
2. Consider RSS feeds from:
   - Blood Cancer Journal
   - ASH (American Society of Hematology)
   - LLS News
   - NCI Cancer Currents

## How to Add a New Disease Group

1. **Add to `DISEASE_GROUPS`** in `DiseasePage.tsx` with full data structure
2. **Add route handling** in `App.tsx` (likely already dynamic via `groupId`)
3. **Add navigation card** in `LandingPage.tsx` disease cards section
4. **Add news source** in API worker if group-specific news needed
5. **Update this workflow** with new group status

## Testing Checklist

- [ ] All external links work
- [ ] ClinicalTrials.gov link returns relevant results
- [ ] News feed loads (or shows graceful empty state)
- [ ] Scientific search button pre-filters correctly
- [ ] Mobile responsive layout
- [ ] Page renders correctly on refresh
