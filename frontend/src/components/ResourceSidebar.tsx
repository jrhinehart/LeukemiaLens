import React, { useState } from 'react';

interface NavItem {
    id: string;
    label: string;
    icon?: string;
    path?: string;
    children?: NavItem[];
}

const NAV_TREE: NavItem[] = [
    {
        id: 'resources',
        label: 'Research Resources',
        icon: '🔗',
        path: '/resources'
    },
    {
        id: 'research',
        label: 'Research Hub',
        icon: '🔍',
        children: [
            { id: 'search', label: 'Search Articles', path: '/search' },
        ]
    },
    {
        id: 'diseases',
        label: 'Disease Information',
        icon: '🧬',
        children: [
            {
                id: 'myeloid-group',
                label: 'Myeloid Neoplasms',
                children: [
                    { id: 'myeloid', label: 'Overview', path: '/myeloid' },
                    { id: 'aml', label: 'AML', path: '/disease/aml' },
                    { id: 'mds', label: 'MDS', path: '/disease/mds' },
                    { id: 'cml', label: 'CML', path: '/disease/cml' },
                    { id: 'mpn', label: 'MPN', path: '/disease/mpn' },
                ]
            },
            {
                id: 'lymphoid-group',
                label: 'Lymphoid Neoplasms',
                children: [
                    { id: 'lymphoid', label: 'Overview', path: '/lymphoid' },
                    { id: 'all', label: 'ALL', path: '/disease/all' },
                    { id: 'cll', label: 'CLL', path: '/disease/cll' },
                ]
            },
            {
                id: 'plasma-group',
                label: 'Plasma Cell Disorders',
                children: [
                    { id: 'myeloma', label: 'Multiple Myeloma', path: '/myeloma' },
                    { id: 'mgus', label: 'MGUS', path: '/disease/mgus' },
                    { id: 'smm', label: 'Smoldering Myeloma', path: '/disease/smm' },
                    { id: 'mm', label: 'Active Myeloma', path: '/disease/mm' },
                ]
            }
        ]
    },
    {
        id: 'knowledge',
        label: 'Patient Knowledge Base',
        icon: '📚',
        children: [
            { id: 'blood-cells', label: 'Blood Production', icon: '🩸', path: '/learn/blood-cells' },
            { id: 'mutations', label: 'Mutations', icon: '🧬', path: '/learn/mutations' },
            { id: 'transplant', label: 'Transplants', icon: '🏥', path: '/learn/transplant' },
            { id: 'treatments', label: 'Treatments', icon: '💊', path: '/learn/treatments' },
            { id: 'medications', label: 'Medications', icon: '🧪', path: '/learn/medications' },
            { id: 'palliative', label: 'Supportive Care', icon: '🤝', path: '/learn/palliative' },
            { id: 'lab-results', label: 'Lab Results', icon: '🔬', path: '/learn/lab-results' },
            { id: 'clinical-trials', label: 'Clinical Trials', icon: '🏃', path: '/learn/clinical-trials' },
            { id: 'history', label: 'History of Leukemia', icon: '📜', path: '/learn/history' },
        ]
    },
    {
        id: 'site',
        label: 'Support & Info',
        icon: 'ℹ️',
        children: [
            { id: 'stats', label: 'Analytics & Stats', path: '/stats' },
            { id: 'about', label: 'About', path: '/about' },
            { id: 'contact', label: 'Contact', path: '/contact' },
        ]
    }
];

interface ResourceSidebarProps {
    activeId: string;
    onNavigate: (id: string, path: string) => void;
}

export const ResourceSidebar: React.FC<ResourceSidebarProps> = ({ activeId, onNavigate }) => {
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['diseases', 'knowledge', 'research']));

    const toggleGroup = (id: string) => {
        const next = new Set(expandedGroups);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedGroups(next);
    };

    const renderItem = (item: NavItem, depth = 0) => {
        const isExpanded = expandedGroups.has(item.id);
        const isActive = activeId === item.id;
        const hasChildren = item.children && item.children.length > 0;

        return (
            <div key={item.id} className="select-none">
                <div
                    onClick={() => {
                        if (hasChildren) {
                            toggleGroup(item.id);
                        } else if (item.path) {
                            onNavigate(item.id, item.path);
                        }
                    }}
                    className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm
                        ${depth === 0 ? 'font-bold mt-4 mb-1' : 'hover:bg-blue-50'}
                        ${isActive ? 'bg-blue-100 text-blue-800' : 'text-gray-600'}
                        ${depth > 0 ? 'ml-4' : ''}
                    `}
                >
                    {item.icon && <span className="text-lg">{item.icon}</span>}
                    <span className="flex-1">{item.label}</span>
                    {hasChildren && (
                        <span className={`text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                            ▶
                        </span>
                    )}
                </div>
                {hasChildren && isExpanded && (
                    <div className="space-y-1">
                        {item.children!.map(child => renderItem(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto hidden lg:block h-full">
            <div className="p-4">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
                    Resources & Education
                </h2>
                <nav className="space-y-0.5">
                    {NAV_TREE.map(item => renderItem(item))}
                </nav>
            </div>
        </aside>
    );
};
