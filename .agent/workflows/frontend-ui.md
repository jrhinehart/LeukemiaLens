---
description: Frontend UI components and styling
domain: frontend/src/components/*, frontend/src/*.css, frontend/src/App.tsx
owner: Frontend UI Agent
---

# Frontend UI Development

## Scope & Ownership

This agent owns **shared UI components, styling, and core app structure**. Primary files:

- `frontend/src/components/*` - Reusable components
- `frontend/src/App.tsx` - Main app structure and routing
- `frontend/src/index.css` - Global styles
- `frontend/src/App.css` - App-specific styles

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: TailwindCSS
- **State**: React useState/useEffect (no Redux)
- **HTTP**: Axios

## Component Library

### Filter Components
| Component | Purpose | File |
|-----------|---------|------|
| `SimpleListFilter` | Multi-select for discrete categories | `SimpleListFilter.tsx` |
| `SearchableListFilter` | Searchable filter with counts | `SearchableListFilter.tsx` |
| `GroupedMutationFilter` | Hierarchical mutation filter | `GroupedMutationFilter.tsx` |
| `DateRangeFilter` | Date boundary selection | `DateRangeFilter.tsx` |
| `TextSearchFilter` | Keyword search input | `TextSearchFilter.tsx` |

### AI Components
| Component | Purpose | File |
|-----------|---------|------|
| `SmartSearchInput` | NLP query parsing | `SmartSearchInput.tsx` |
| `ResearchInsights` | AI-generated summaries | `ResearchInsights.tsx` |

### Layout Components
| Component | Purpose | File |
|-----------|---------|------|
| `PageHeader` | Consistent page headers | `PageHeader.tsx` |
| `ErrorModal` | Error display modal | `ErrorModal.tsx` |

## Design System

### Colors (TailwindCSS)
```
Primary:     blue-600, blue-700
Secondary:   indigo-600, purple-600
Success:     green-600
Warning:     amber-600
Error:       red-600
Background:  gray-50
Card:        white
Text:        gray-900, gray-700, gray-500
```

### Spacing
- Cards: `p-6` or `p-8`
- Sections: `py-12` vertical, `px-4 sm:px-6 lg:px-8` horizontal
- Max width: `max-w-7xl mx-auto`

### Border Radius
- Cards: `rounded-2xl` or `rounded-3xl`
- Buttons: `rounded-xl` or `rounded-2xl`
- Tags: `rounded-lg` or `rounded-full`

### Shadows
- Cards: `shadow-sm` base, `shadow-xl` on hover
- Elevated: `shadow-2xl`

## Component Patterns

### Filter Component Template
```tsx
interface FilterProps {
    label: string;
    options: Array<{ value: string; label: string; count?: number }>;
    selected: string[];
    onChange: (selected: string[]) => void;
}

export const NewFilter: React.FC<FilterProps> = ({
    label, options, selected, onChange
}) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">{label}</h3>
            {/* Filter content */}
        </div>
    );
};
```

### Page Template
```tsx
export const NewPage: React.FC<PageProps> = ({ onNavigateHome }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <PageHeader title="Page Title" onNavigateHome={onNavigateHome} />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
                {/* Page content */}
            </main>
            
            <footer className="bg-white border-t border-gray-200 py-12">
                {/* Footer content */}
            </footer>
        </div>
    );
};
```

## Accessibility Requirements

- [ ] All interactive elements keyboard accessible
- [ ] Proper `aria-label` on icon buttons
- [ ] Color contrast meets WCAG AA
- [ ] Form inputs have labels
- [ ] Focus states visible

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Small tablets |
| `md` | 768px | Tablets, sidebar visible |
| `lg` | 1024px | Laptops, 3-column layouts |
| `xl` | 1280px | Desktops |

### Mobile-First Pattern
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

## Animation Guidelines

- Transitions: `transition-all` or `transition-colors`
- Hover states: `hover:-translate-y-1`, `hover:shadow-xl`
- Duration: default (150ms) or `duration-300`
- Avoid excessive animation

## Adding New Components

1. Create component file in `frontend/src/components/`
2. Export from `frontend/src/components/index.ts`
3. Follow existing patterns for props interface
4. Add to this workflow's component table
5. Test on mobile viewport

## Local Development

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

## Testing Checklist

- [ ] Component renders without errors
- [ ] Props are properly typed
- [ ] Responsive on mobile/tablet/desktop
- [ ] Keyboard navigation works
- [ ] No console warnings
- [ ] Matches design system colors/spacing
