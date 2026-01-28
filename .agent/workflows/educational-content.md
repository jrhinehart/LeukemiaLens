---
description: Educational content development for newly diagnosed patients
domain: frontend/src/EducationPages.tsx, frontend/src/LandingPage.tsx (education section)
owner: Education Content Agent
---

# Educational Content Development

## Scope & Ownership

This agent owns the **patient education section** of LeukemiaLens, focused on helping newly diagnosed patients understand their condition. The primary files are:

- `frontend/src/EducationPages.tsx` - All educational page components
- `frontend/src/LandingPage.tsx` - The "For Newly Diagnosed Patients" section (links only)

## Current Pages

| Topic | Route | Component | Status |
|-------|-------|-----------|--------|
| Blood Cell Production | `/learn/blood-cells` | `BloodCellProductionPage` | ✅ Complete (Expanded) |
| Mutations | `/learn/mutations` | `MutationsPage` | ✅ Complete (Expanded) |
| Risk Stratification | `/learn/risk` | `RiskStratificationPage` | ✅ Complete (Expanded) |
| Stem Cell Transplants | `/learn/transplant` | `StemCellTransplantPage` | ✅ Complete (Expanded) |
| Understanding Lab Results | `/learn/lab-results` | `LabResultsPage` | ✅ Complete |
| Clinical Trial Basics | `/learn/clinical-trials` | `ClinicalTrialsPage` | ✅ Complete |

## Planned Pages to Add

- [ ] Preparing for Treatment
- [ ] Living with Blood Cancer
- [ ] Nutrition During Treatment
- [ ] Managing Side Effects

## Content Guidelines

### Tone & Voice
- **Compassionate and reassuring** - Patients are often frightened and overwhelmed
- **Plain language** - Avoid medical jargon or always explain it with pronunciation guides
- **Empowering** - Help patients feel informed, not helpless
- **Accurate but hopeful** - Balance realism with hope

### Structure Pattern
Each education page should follow this structure:

```tsx
export const NewTopicPage: React.FC<EducationPageProps> = ({ onNavigateHome, onNavigateToLearn }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <PageHeader title="Page Title Here" onNavigateHome={onNavigateHome} />
            
            <main className="max-w-4xl mx-auto px-4 py-12 flex-1">
                {/* Introduction Card */}
                <section className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
                    <div className="flex items-start gap-4 mb-6">
                        <span className="text-4xl">🔬</span>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Main Heading</h2>
                            <p className="text-gray-600 text-lg">Brief intro paragraph.</p>
                        </div>
                    </div>
                    
                    {/* Content sections with h3 headers */}
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Section Title</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">Content...</p>
                </section>
                
                {/* Related Topics Navigation */}
                <RelatedTopics currentTopic="topic-key" onNavigate={onNavigateToLearn} />
            </main>
        </div>
    );
};
```

### Visual Elements
- Use emoji icons for visual interest (🩸, 🧬, 📊, 🏥, 💊)
- Include colored info cards for key concepts
- Use gradient backgrounds for emphasis sections
- Keep paragraphs short (3-4 sentences max)

### External Resources
Always link to authoritative external resources:
- **Blood Cancer United**: `https://bloodcancerunited.org/`
- **LLS (Leukemia & Lymphoma Society)**: `https://www.lls.org/`
- **NMDP (Be The Match)**: `https://www.nmdp.org/`
- **NCI (National Cancer Institute)**: `https://www.cancer.gov/`

Use the `ExternalLink` component for consistent styling:
```tsx
<ExternalLink href="https://example.org">Link Text</ExternalLink>
```

## How to Add a New Page

1. **Create the component** in `EducationPages.tsx` following the structure pattern above
2. **Export it** from `EducationPages.tsx`
3. **Add the route** in `App.tsx` in the routing logic
4. **Add navigation** from the LandingPage "For Newly Diagnosed Patients" section
5. **Update RelatedTopics** component with the new topic
6. **Update this workflow** with the new page status

## Testing Checklist

- [ ] Content is medically accurate (cross-reference authoritative sources)
- [ ] No unexplained jargon
- [ ] All external links work
- [ ] Mobile responsive
- [ ] Navigation works (back to home, related topics)
- [ ] Page renders correctly on refresh (route configured)
