import bannerImage from '../assets/LL-logo-banner.jpg'

export interface PageHeaderProps {
    title: string
    onNavigateHome?: () => void
}

export const PageHeader = ({ title, onNavigateHome }: PageHeaderProps) => {
    return (
        <div className="relative bg-gradient-to-r from-blue-950 via-blue-700 to-blue-500 text-white shadow-md">
            {/* Top Navigation */}
            <nav className="absolute top-4 right-4 sm:right-8 flex gap-6 text-sm font-medium z-10">
                {[
                    { label: 'About', path: '/about' },
                    { label: 'Contact', path: '/contact' },
                    { label: 'Resources', path: '/resources' },
                    { label: 'Stats', path: '/stats' }
                ].map((link) => (
                    <a
                        key={link.path}
                        href={link.path}
                        onClick={(e) => {
                            e.preventDefault();
                            window.history.pushState({}, '', link.path);
                            window.dispatchEvent(new PopStateEvent('popstate'));
                        }}
                        className="text-blue-100 hover:text-white transition-colors cursor-pointer"
                    >
                        {link.label}
                    </a>
                ))}
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center gap-6">
                {/* Logo - clickable to go home */}
                <div className="flex-shrink-0">
                    <a
                        href="/"
                        onClick={(e) => {
                            e.preventDefault();
                            if (onNavigateHome) {
                                onNavigateHome()
                            } else {
                                window.location.href = '/'
                            }
                        }}
                        className="cursor-pointer"
                        title="Back to Home"
                    >
                        <img src={bannerImage} alt="LeukemiaLens" className="h-16 object-contain hover:opacity-90 transition-opacity" />
                    </a>
                </div>

                {/* Page Title */}
                <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
                </div>
            </div>
        </div>
    )
}
