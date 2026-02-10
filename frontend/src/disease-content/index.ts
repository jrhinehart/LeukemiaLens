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
import AMLDeepDive from './AMLDeepDive';

export const DISEASE_DEEP_DIVES: Record<string, React.FC> = {
    aml: AMLDeepDive,
    // Future deep dives:
    // cml: CMLDeepDive,
    // all: ALLDeepDive,
    // cll: CLLDeepDive,
    // mds: MDSDeepDive,
    // mpn: MPNDeepDive,
    // mm: MMDeepDive,
};
