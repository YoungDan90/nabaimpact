'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { X } from 'lucide-react'

// BADGE
const badgeMap: Record<string, string> = {
  Awarded: 'bg-[var(--g5)] text-[var(--g1)]',
  Confirmed: 'bg-[var(--g5)] text-[var(--g1)]',
  Completed: 'bg-[var(--g5)] text-[var(--g1)]',
  'In Review': 'bg-[var(--a3)] text-[var(--a1)]',
  Planning: 'bg-[var(--a3)] text-[var(--a1)]',
  Submitted: 'bg-[var(--b2)] text-[var(--b1)]',
  Identified: 'bg-[var(--b2)] text-[var(--b1)]',
  Rejected: 'bg-[var(--c2)] text-[var(--c1)]',
  Cancelled: 'bg-[var(--c2)] text-[var(--c1)]',
  Programme: 'bg-[var(--p2)] text-[var(--p1)]',
  'Building / Premises': 'bg-[var(--a3)] text-[var(--a1)]',
  High: 'bg-[var(--g5)] text-[var(--g1)]',
  Medium: 'bg-[var(--a3)] text-[var(--a1)]',
  Low: 'bg-[var(--b2)] text-[var(--b1)]',
}

export function Badge({ label }: { label: string }) {
  const cls = badgeMap[label] ?? 'bg-[var(--b2)] text-[var(--b1)]'
  return (
    <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${cls}`}>
      {label}
    </span>
  )
}

// STAT CARD
export function StatCard({
  label, value, sub, accent,
}: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div
      className="bg-white border border-black/[0.06] rounded-[10px] p-3"
      style={{ borderLeft: `3px solid ${accent ?? 'var(--g2)'}` }}
    >
      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.4px] mb-1.5">{label}</div>
      <div className="font-syne text-[24px] font-bold leading-none">{value}</div>
      {sub && <div className="text-[11px] text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}

// CARD
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-black/[0.06] rounded-[11px] p-4 ${className}`}>
      {children}
    </div>
  )
}

// CARD TITLE
export function CardTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="font-syne text-[13px] font-semibold mb-3 flex items-center justify-between">
      {children}
      {action}
    </div>
  )
}

// MODAL
export function Modal({
  open, onClose, title, children, width = 'max-w-xl',
}: { open: boolean; onClose: () => void; title: string; children: ReactNode; width?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) ref.current?.focus()
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-black/40 z-[200] flex items-start justify-center p-4 overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={ref}
        tabIndex={-1}
        className={`bg-white rounded-[14px] p-5 w-full ${width} my-auto outline-none`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="font-syne text-[17px] font-bold">{title}</div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// BUTTON
export function Btn({
  children, onClick, disabled, variant = 'primary', size = 'md', type = 'button', className = '',
}: {
  children: ReactNode; onClick?: () => void; disabled?: boolean;
  variant?: 'primary' | 'outline' | 'ghost' | 'blue'; size?: 'sm' | 'md';
  type?: 'button' | 'submit'; className?: string
}) {
  const sizes = { sm: 'px-3 py-1.5 text-[11px]', md: 'px-4 py-2 text-[12px]' }
  const variants = {
    primary: 'bg-[var(--g1)] text-white hover:bg-[var(--g2)] border-transparent',
    outline: 'bg-transparent text-[var(--g1)] border-[var(--g2)] hover:bg-[var(--g5)]',
    ghost: 'bg-transparent text-gray-400 border-transparent hover:bg-[#F8F7F4] hover:text-gray-700',
    blue: 'bg-[var(--b1)] text-white hover:opacity-90 border-transparent',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`border rounded-[7px] font-medium inline-flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

// FORM FIELD
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-[0.4px] mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full bg-[#F8F7F4] border border-black/[0.08] rounded-[7px] px-3 py-2 text-[13px] outline-none focus:border-[var(--g2)] focus:bg-white transition-colors'

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ''}`} />
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputCls} cursor-pointer ${props.className ?? ''}`} />
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} resize-y ${props.className ?? ''}`} />
}

// SPINNER
export function Spinner({ size = 14 }: { size?: number }) {
  return (
    <div
      className="rounded-full border-2 border-[var(--g4)] border-t-[var(--g2)] animate-spin shrink-0"
      style={{ width: size, height: size }}
    />
  )
}

// EMPTY STATE
export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="text-center py-10 text-gray-400 text-[13px]">{children}</div>
  )
}

// PROGRESS BAR
export function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-2 bg-black/[0.06] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full budget-bar"
        style={{ width: `${Math.min(100, pct)}%`, background: color }}
      />
    </div>
  )
}

// SECTION DIVIDER
export function Divider() {
  return <div className="h-px bg-black/[0.06] my-3" />
}

// AI INFO BAR
export function AIBar({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[var(--g5)] border border-[var(--g4)] rounded-[8px] px-3 py-2 text-[12px] text-[var(--g1)] mb-3 flex items-start gap-2">
      <span className="mt-0.5 shrink-0">⚡</span>
      <div>{children}</div>
    </div>
  )
}
