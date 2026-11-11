export function ErrorMessage({ message }) {
  return <div className="border border-[#d8a39a] bg-[#f7e5df] px-4 py-3 text-sm text-[#7d342a]" role="alert">{message}</div>
}

export function EmptyState({ eyebrow = "Nothing here yet", title, body, action }) {
  return (
    <div className="border-t border-b hairline py-14 text-center">
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2 className="font-display text-3xl">{title}</h2>
      {body && <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#687087]">{body}</p>}
      {action}
    </div>
  )
}

export function LoadingRows({ count = 3 }) {
  return <div className="space-y-3" aria-label="Loading">
    {Array.from({ length: count }, (_, index) => <div key={index} className="h-20 animate-pulse bg-[#ece6dc]" />)}
  </div>
}
