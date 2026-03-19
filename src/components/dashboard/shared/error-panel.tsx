export function ErrorPanel({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center border-y border-border py-16 text-sm text-[#ef4444] sm:rounded-xl sm:border-x">
      {label}
    </div>
  )
}
