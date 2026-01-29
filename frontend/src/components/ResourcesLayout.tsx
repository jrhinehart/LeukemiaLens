import React from 'react';
import { PageHeader } from './PageHeader';
import { ResourceSidebar } from './ResourceSidebar';

interface ResourcesLayoutProps {
    children: React.ReactNode;
    title: string;
    activeNavId: string;
    onNavigateHome: () => void;
    onNavigate: (id: string, path: string) => void;
}

export const ResourcesLayout: React.FC<ResourcesLayoutProps> = ({
    children,
    title,
    activeNavId,
    onNavigateHome,
    onNavigate
}) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 h-[100vh]">
            <PageHeader title={title} onNavigateHome={onNavigateHome} />

            <div className="flex-1 flex overflow-hidden">
                <ResourceSidebar activeId={activeNavId} onNavigate={onNavigate} />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-5xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
