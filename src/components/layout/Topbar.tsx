interface TopbarProps {
  title: string
  subtitle: string
}

export function Topbar({ title, subtitle }: TopbarProps): React.JSX.Element {
  return (
    <div className="topbar h-12 bg-white border-b border-gray-200 flex items-center px-5 gap-2 flex-shrink-0">
      <span className="topbar-title text-sm font-medium">{title}</span>
      <span className="topbar-sep text-gray-300">·</span>
      <span className="topbar-sub text-xs text-gray-600">{subtitle}</span>
    </div>
  )
}
