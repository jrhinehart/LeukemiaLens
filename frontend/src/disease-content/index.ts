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
import ALLDeepDive from './ALLDeepDive';
import MMDeepDive from './MMDeepDive';
import CMLDeepDive from './CMLDeepDive';
import MDSDeepDive from './MDSDeepDive';
import CLLDeepDive from './CLLDeepDive';
import MPNDeepDive from './MPNDeepDive';
import MGUSDeepDive from './MGUSDeepDive';
import SMMDeepDive from './SMMDeepDive';

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
