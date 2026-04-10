'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Workshop, Expense } from '@/types'
import { StatCard, Card, Modal, Btn, Field, Input, Select, Spinner, Empty, ProgressBar } from '@/components/ui'
import { Plus } from 'lucide-react'

export default function BudgetPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [expModal, setExpModal] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    workshop_id: '', category: 'Materials', amount: '', description: '', date: '', paid_by: '',
  })

  const load = async () => {
    const [{ data: ws }, { data: ex }] = await Promise.all([
      supabase.from('workshops').select('*').order('title'),
      supabase.from('expenses').select('*').order('created_at', { ascending: false }),
    ])
    setWorkshops(ws ?? [])
    setExpenses(ex ?? [])
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.workshop_id || !form.amount) return
    setSaving(true)
    await supabase.from('expenses').insert({
      workshop_id: form.workshop_id,
      category: form.category,
      amount: parseFloat(form.amount),
      description: form.description || null,
      date: form.date || null,
      paid_by: form.paid_by || null,
    })
    setSaving(false)
    setExpModal(null)
    setForm({ workshop_id: '', category: 'Materials', amount: '', description: '', date: '', paid_by: '' })
    load()
  }

  const openExpModal = (wsId?: string) => {
    if (wsId) setForm(f => ({ ...f, workshop_id: wsId }))
    setExpModal('open')
  }

  const delExpense = async (id: string) => {
    await supabase.from('expenses').delete().eq('id', id)
    load()
  }

  const totalAlloc = workshops.reduce((s, w) => s + Number(w.budget ?? 0), 0)
  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const totalRem = totalAlloc - totalSpent

  const budgetedWs = workshops.filter(w => Number(w.budget) > 0)

  return (
    <div>
      <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h1 className="font-syne text-[20px] font-bold">Budget Tracker</h1>
          <p className="text-[12px] text-gray-500 mt-0.5">Track spending per workshop against awarded grant budgets.</p>
        </div>
        <Btn onClick={() => openExpModal()}><Plus size={14} /> Log Expense</Btn>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard label="Total Allocated" value={`£${totalAlloc.toLocaleString()}`} accent="var(--g2)" />
        <StatCard label="Total Spent" value={`£${totalSpent.toLocaleString()}`} accent="var(--c1)" />
        <StatCard label="Remaining" value={`£${totalRem.toLocaleString()}`} accent={totalRem < 0 ? 'var(--c1)' : 'var(--b1)'} />
      </div>

      {budgetedWs.length === 0 ? (
        <Empty>No workshop budgets yet. Add a budget when planning a workshop.</Empty>
      ) : (
        <div className="space-y-4">
          {budgetedWs.map(w => {
            const wExp = expenses.filter(e => e.workshop_id === w.id)
            const spent = wExp.reduce((s, e) => s + Number(e.amount), 0)
            const rem = Number(w.budget) - spent
            const pct = w.budget ? Math.round((spent / Number(w.budget)) * 100) : 0
            const color = pct > 90 ? 'var(--c1)' : pct > 70 ? 'var(--a2)' : 'var(--g2)'

            // Category breakdown
            const cats: Record<string, number> = {}
            wExp.forEach(e => { cats[e.category] = (cats[e.category] ?? 0) + Number(e.amount) })

            return (
              <div key={w.id} className="bg-white border border-black/[0.06] rounded-[11px] overflow-hidden">
                {/* Header */}
                <div className="bg-[var(--a3)] px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className="font-syne text-[13px] font-bold text-[var(--a1)]">{w.title}</div>
                    <div className="text-[10px] text-[var(--a2)] mt-0.5">{w.category}</div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <div className="text-[11px] text-[var(--a1)]">Spent</div>
                      <div className="font-syne text-[15px] font-bold text-[var(--a1)]">£{spent.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-[var(--a1)]">{rem < 0 ? 'Over by' : 'Remaining'}</div>
                      <div className="font-syne text-[15px] font-bold" style={{ color: rem < 0 ? 'var(--c1)' : 'var(--g1)' }}>
                        £{Math.abs(rem).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-3">
                  {/* Progress */}
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span className="text-gray-500">Budget: £{Number(w.budget).toLocaleString()}</span>
                    <span className="font-medium" style={{ color }}>{pct}% used</span>
                  </div>
                  <ProgressBar pct={pct} color={color} />

                  {/* Category grid */}
                  {Object.keys(cats).length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 mb-4">
                      {Object.entries(cats).map(([cat, val]) => (
                        <div key={cat} className="bg-[#F8F7F4] rounded-[8px] px-3 py-2">
                          <div className="text-[10px] text-gray-400">{cat}</div>
                          <div className="font-syne text-[15px] font-bold text-[var(--g1)]">£{val.toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Expense list */}
                  {wExp.length > 0 && (
                    <div className="overflow-x-auto mb-3">
                      <table className="w-full text-[12px]">
                        <thead>
                          <tr className="border-b border-black/[0.06]">
                            {['Category', 'Description', 'Amount', 'Date', 'Paid By', ''].map(h => (
                              <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-[0.3px] pb-2 pr-4">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {wExp.map(e => (
                            <tr key={e.id} className="border-b border-black/[0.04] last:border-0">
                              <td className="py-2 pr-4">{e.category}</td>
                              <td className="py-2 pr-4 text-gray-500">{e.description ?? '—'}</td>
                              <td className="py-2 pr-4 font-semibold text-[var(--g1)]">£{Number(e.amount).toLocaleString()}</td>
                              <td className="py-2 pr-4 text-gray-400">{e.date ? new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}</td>
                              <td className="py-2 pr-4 text-gray-400">{e.paid_by ?? '—'}</td>
                              <td className="py-2">
                                <button onClick={() => delExpense(e.id)} className="text-gray-300 hover:text-[var(--c1)] text-[11px] transition-colors">×</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <Btn size="sm" variant="outline" onClick={() => openExpModal(w.id)}>
                    <Plus size={12} /> Log Expense
                  </Btn>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Expense Modal */}
      <Modal open={expModal === 'open'} onClose={() => setExpModal(null)} title="Log Expense">
        <Field label="Workshop">
          <Select value={form.workshop_id} onChange={e => setForm(f => ({ ...f, workshop_id: e.target.value }))}>
            <option value="">Select a workshop…</option>
            {workshops.filter(w => Number(w.budget) > 0).map(w => (
              <option key={w.id} value={w.id}>{w.title}</option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {['Materials', 'Venue', 'Facilitator Fee', 'Equipment', 'Travel', 'Catering', 'Marketing', 'Other'].map(c => <option key={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Amount (£)">
            <Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" />
          </Field>
        </div>
        <Field label="Description"><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What was this for?" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date"><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></Field>
          <Field label="Paid By"><Input value={form.paid_by} onChange={e => setForm(f => ({ ...f, paid_by: e.target.value }))} placeholder="Name" /></Field>
        </div>
        <div className="flex gap-2 justify-end mt-3">
          <Btn variant="outline" onClick={() => setExpModal(null)}>Cancel</Btn>
          <Btn onClick={save} disabled={saving || !form.workshop_id}>{saving ? <Spinner size={12} /> : null} Log Expense</Btn>
        </div>
      </Modal>
    </div>
  )
}
