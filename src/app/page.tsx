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
                  {selected === r && <div className="w-5 h-5 rounded-full bg-[#1D9E75] flex items-center justify-center"><svg width="10" height="10" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>}
                </div>
              </button>
            ))}
          </div>
          <button onClick={enter} disabled={!selected} className="w-full bg-[#0A5C45] text-white font-syne font-bold text-[14px] py-3 rounded-[10px] disabled:opacity-40 hover:bg-[#1D9E75] transition-colors">Enter Platform →</button>
        </div>
        <p className="text-center text-[11px] text-gray-300 mt-4">Naba Studios · Grant & Workshop Management</p>
      </div>
    </div>
  )
}
