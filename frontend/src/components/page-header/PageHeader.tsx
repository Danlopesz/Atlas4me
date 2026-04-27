import './PageHeader.css';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
}

export function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
    return (
        <div className="page-header">
            {icon && <div className="page-header-icon">{icon}</div>}
            <h1 className="page-header-title">{title}</h1>
            {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>
    );
}
