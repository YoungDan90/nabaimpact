'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ROLES, TAB_LABELS } from '@/lib/config'
import { Role } from '@/types'

export default function Shell({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('director')
  const pathname = usePathname()
  const cfg = ROLES[role]

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4]">
      {/* Topbar */}
      <header className="bg-[var(--g1)] flex items-center px-4 h-[52px] gap-3 sticky top-0 z-50">
        <div className="font-syne text-[15px] font-black text-white tracking-tight shrink-0">
          Naba <span className="text-[var(--g4)]">Impact</span>
        </div>

        <select
          value={role}
          onChange={e => setRole(e.target.value as Role)}
          className="bg-white/10 border border-white/20 rounded-md text-white font-[var(--font-dm)] text-[12px] px-2 py-1 outline-none cursor-pointer shrink-0"
        >
          {(Object.keys(ROLES) as Role[]).map(r => (
            <option key={r} value={r} className="bg-[#0A5C45]">{ROLES[r].label}</option>
          ))}
        </select>

        <nav className="flex gap-1 overflow-x-auto flex-1">
          {cfg.tabs.map(tab => {
            const href = `/${tab}`
            const active = pathname === href || (tab === 'dashboard' && pathname === '/')
            return (
              <Link
                key={tab}
                href={href}
                className={`px-3 py-1.5 rounded-md text-[12px] font-medium whitespace-nowrap transition-all ${
                  active
                    ? 'bg-white/[0.18] text-white'
                    : 'text-white/55 hover:bg-white/10 hover:text-white'
                }`}
              >
                {TAB_LABELS[tab]}
              </Link>
            )
          })}
        </nav>

        <div className="bg-[var(--g3)] text-[var(--g1)] text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
          AI Powered
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
