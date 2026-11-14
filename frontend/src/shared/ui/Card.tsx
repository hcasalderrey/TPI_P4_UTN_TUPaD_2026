import type { HTMLAttributes } from 'react'

function Card({ className = '', children, ...resto }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-stone-200 bg-white shadow-sm ${className}`}
      {...resto}
    >
      {children}
    </div>
  )
}

export default Card
