export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex min-w-0 flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {children && <div className="flex max-w-full flex-wrap items-center gap-2">{children}</div>}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, text, children }) {
  return (
    <div className="glass rounded-2xl px-6 py-14 text-center">
      {Icon && <Icon size={30} className="mx-auto mb-3 text-slate-500" />}
      <p className="font-medium text-white">{title}</p>
      {text && <p className="mx-auto mt-1 max-w-sm text-sm text-slate-400">{text}</p>}
      {children && <div className="mt-4 flex justify-center">{children}</div>}
    </div>
  )
}
