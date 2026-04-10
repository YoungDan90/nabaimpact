'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Role } from '@/types'
import { ROLES } from '@/lib/config'

const icons: Record<Role, string> = { director: '🎯', coordinator: '📋', finance: '💰', volunteer: '🤝' }
const descs: Record<Role, string> = { director: 'Full access — grants, workshops, budgets, building', coordinator: 'Plan workshops, log expenses, track budgets', finance: 'Applications, awarded grants, budget overview', volunteer: 'View assigned workshops' }

export default function LoginPage() {
  const [selected, setSelected] = useState<Role | null>(null)
  const [name, setName] = useState('')
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('naba_role')
    if (saved) { router.replace('/dashboard') } else { setChecking(false) }
  }, [router])

  const enter = () => {
    if (!selected) return
    localStorage.setItem('naba_role', selected)
    localStorage.setItem('naba_name', name || 'Team Member')
    router.push('/dashboard')
  }

  if (checking) return <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-[#9FE1CB] border-t-[#1D9E75] animate-spin" /></div>

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0A5C45] mb-4">
            <span className="font-syne text-white text-[22px] font-black">N</span>
          </div>
          <h1 className="font-syne text-[28px] font-black text-[#0A5C45]">Naba <span className="text-[#1D9E75]">Impact</span></h1>
          <p className="text-[12px] text-gray-400 mt-1">Part of Naba Studios · Southend-on-Sea</p>
        </div>
        <div className="bg-white rounded-[16px] border border-black/[0.06] p-6 shadow-sm">
          <h2 className="font-syne text-[16px] font-bold mb-1">Who are you?</h2>
          <p className="text-[12px] text-gray-400 mb-5">Select your role to enter the platform</p>
          <div className="mb-4">
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-[0.4px] mb-1.5">Your Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && enter()} placeholder="e.g. Daniel Williams" className="w-full bg-[#F8F7F4] border border-black/[0.08] rounded-[8px] px-3 py-2.5 text-[13px] outline-none focus:border-[#1D9E75] transition-colors" />
          </div>
          <div className="space-y-2 mb-6">
            {(Object.keys(ROLES) as Role[]).map(r => (
              <button key={r} onClick={() => setSelected(r)} className={`w-full text-left px-4 py-3 rounded-[10px] border transition-all ${selected === r ? 'border-[#1D9E75] bg-[#E1F5EE]' : 'border-black/[0.06] bg-[#F8F7F4] hover:border-[#9FE1CB]'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-[20px]">{icons[r]}</span>
                  <div className="flex-1">
                    <div className={`text-[13px] font-semibold ${selected === r ? 'text-[#0A5C45]' : 'text-gray-700'}`}>{ROLES[r].label}</div>
                    <div className="text-[11px] text-gray-400">{descs[r]}</div>
                  </div>
                  {selected === r && <div className="w-5 h-5 rounded-full bg-[#1D9E75] flex items-center justify-center"><svg width="10" height="10" fi

cat > ~/Downloads/naba-impact/src/components/Shell.tsx << 'EOF'
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
