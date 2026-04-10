'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ROLES, TAB_LABELS } from '@/lib/config'
import { Role } from '@/types'

export default function Shell({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null)
  const [name, setName] = useState('')
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const savedRole = localStorage.getItem('naba_role') as Role | null
    const savedName = localStorage.getItem('naba_name')
    if (!savedRole) { router.replace('/'); return }
    setRole(savedRole)
    setName(savedName ?? 'Team Member')
  }, [router])

  const logout = () => { localStorage.removeItem('naba_role'); localStorage.removeItem('naba_name'); router.replace('/') }

  if (!role) return <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-[#9FE1CB] border-t-[#1D9E75] animate-spin" /></div>

  const cfg = ROLES[role]
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4]">
      <header className="bg-[#0A5C45] flex items-center px-4 h-[52px] gap-3 sticky top-0 z-50">
        <Link href="/dashboard" className="font-syne text-[15px] font-black text-white tracking-tight shrink-0">Naba <span className="text-[#9FE1CB]">Impact</span></Link>
        <nav className="flex gap-1 overflow-x-auto flex-1">
          {cfg.tabs.map(tab => (
            <Link key={tab} href={`/${tab}`} className={`px-3 py-1.5 rounded-md text-[12px] font-medium whitespace-nowrap transition-all ${pathname === `/${tab}` ? 'bg-white/[0.18] text-white' : 'text-white/55 hover:bg-white/10 hover:text-white'}`}>{TAB_LABELS[tab]}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-[#5DCAA5] text-[#0A5C45] text-[10px] font-bold px-2 py-0.5 rounded-full hidden md:block">AI Powered</div>
          <button onClick={logout} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors rounded-full pl-1 pr-3 py-1" title="Sign out">
            <div className="w-6 h-6 rounded-full bg-[#9FE1CB] flex items-center justify-center text-[#0A5C45] text-[10px] font-bold shrink-0">{initials}</div>
            <span className="text-white text-[11px] font-medium hidden md:block">{name}</span>
            <span className="text-white/40 text-[10px] hidden md:block">· {ROLES[role].label}</span>
          </button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">{children}</main>
    </div>
  )
}
