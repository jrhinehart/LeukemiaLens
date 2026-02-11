/**
 * Disease Deep Dive Registry
 *
 * Maps disease groupId → deep dive component.
 * When a deep dive exists for a disease, DiseasePage renders the expanded
 * layout (intro → deep dive → tools). Otherwise it falls back to the
 * generic layout.
 *
 * To add a new disease deep dive:
 *   1. Create `disease-content/<Disease>DeepDive.tsx` (use AMLDeepDive as template)
 *   2. Import it here and add to the DISEASE_DEEP_DIVES map
 *   3. Optionally add `extendedDescription` to DISEASE_GROUPS in DiseasePage.tsx
 */
import React from 'react';
const AMLDeepDive = React.lazy(() => import('./AMLDeepDive'));
const ALLDeepDive = React.lazy(() => import('./ALLDeepDive'));
const MMDeepDive = React.lazy(() => import('./MMDeepDive'));
const CMLDeepDive = React.lazy(() => import('./CMLDeepDive'));
const MDSDeepDive = React.lazy(() => import('./MDSDeepDive'));
const CLLDeepDive = React.lazy(() => import('./CLLDeepDive'));
const MPNDeepDive = React.lazy(() => import('./MPNDeepDive'));
const MGUSDeepDive = React.lazy(() => import('./MGUSDeepDive'));
const SMMDeepDive = React.lazy(() => import('./SMMDeepDive'));

export const DISEASE_DEEP_DIVES: Record<string, React.FC> = {
    aml: AMLDeepDive,
    all: ALLDeepDive,
    mm: MMDeepDive,
    cml: CMLDeepDive,
    mds: MDSDeepDive,
    cll: CLLDeepDive,
    mpn: MPNDeepDive,
    mgus: MGUSDeepDive,
    smm: SMMDeepDive,
};
