'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Workshop, Expense } from '@/types'
import { WORKSHOP_CATEGORIES } from '@/lib/config'
import {
  Badge, Card, CardTitle, Modal, Btn, Field, Input, Select, Textarea,
  Spinner, Empty, ProgressBar, Divider, AIBar,
} from '@/components/ui'
import { Plus, Sparkles, FileText, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

export default function WorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [applications, setApplications] = useState<{ linked_workshop_ids: string[]; grant_name: string }[]>([])
  const [showModal, setShowModal] = useState(false)
  const [planModal, setPlanModal] = useState<Workshop | null>(null)
  const [expModal, setExpModal] = useState<Workshop | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiPlan, setAiPlan] = useState('')
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    title: '', category: 'Arts & Creativity', status: 'Planning',
    date: '', location: '', capacity: '', facilitator: '',
    assigned_to: '', audience: '', budget: '', notes: '',
  })

  const [expForm, setExpForm] = useState({
    category: 'Materials', amount: '', description: '', date: '', paid_by: '',
  })

  const load = async () => {
    const [{ data: ws }, { data: ex }, { data: ap }] = await Promise.all([
      supabase.from('workshops').select('*').order('created_at', { ascending: false }),
      supabase.from('expenses').select('*'),
      supabase.from('applications').select('linked_workshop_ids, grant_name'),
    ])
    setWorkshops(ws ?? [])
    setExpenses(ex ?? [])
    setApplications(ap ?? [])
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    await supabase.from('workshops').insert({
      ...form,
      capacity: form.capacity ? parseInt(form.capacity) : null,
      budget: form.budget ? parseFloat(form.budget) : 0,
    })
    setSaving(false)
    setShowModal(false)
    setForm({ title: '', category: 'Arts & Creativity', status: 'Planning', date: '', location: '', capacity: '', facilitator: '', assigned_to: '', audience: '', budget: '', notes: '' })
    load()
  }

  const generatePlan = async () => {
    setAiLoading(true)
    setAiPlan('')
    const res = await fetch('/api/ai-plan-workshop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: form.title, category: form.category, audience: form.audience, capacity: form.capacity, location: form.location, budget: form.budget, notes: form.notes }),
    })
    const { plan } = await res.json()
    setAiPlan(plan ?? 'Could not generate plan.')
    setAiLoading(false)
  }

  const saveWithPlan = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    await supabase.from('workshops').insert({
      ...form,
      capacity: form.capacity ? parseInt(form.capacity) : null,
      budget: form.budget ? parseFloat(form.budget) : 0,
      ai_plan: aiPlan,
    })
    setSaving(false)
    setShowModal(false)
    setAiPlan('')
    setForm({ title: '', category: 'Arts & Creativity', status: 'Planning', date: '', location: '', capacity: '', facilitator: '', assigned_to: '', audience: '', budget: '', notes: '' })
    load()
  }

  const saveExpense = async () => {
    if (!expModal || !expForm.amount) return
    await supabase.from('expenses').insert({
      workshop_id: expModal.id,
      category: expForm.category,
      amount: parseFloat(expForm.amount),
      description: expForm.description || null,
      date: expForm.date || null,
      paid_by: expForm.paid_by || null,
    })
    setExpModal(null)
    setExpForm({ category: 'Materials', amount: '', description: '', date: '', paid_by: '' })
    load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this workshop?')) return
    await supabase.from('workshops').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h1 className="font-syne text-[20px] font-bold">Workshops</h1>
          <p className="text-[12px] text-gray-500 mt-0.5">Plan and manage community workshops. AI generates full plans and budgets.</p>
        </div>
        <Btn onClick={() => { setShowModal(true); setAiPlan('') }}>
          <Plus size={14} /> Plan Workshop
        </Btn>
      </div>

      {workshops.length === 0 && <Empty>No workshops yet. Plan your first one above.</Empty>}

      <div className="space-y-3">
        {workshops.map(w => {
          const wExp = expenses.filter(e => e.workshop_id === w.id)
          const spent = wExp.reduce((s, e) => s + Number(e.amount), 0)
          const pct = w.budget ? Math.round((spent / w.budget) * 100) : 0
          const color = pct > 90 ? 'var(--c1)' : pct > 70 ? 'var(--a2)' : 'var(--g2)'
          const linkedGrants = applications.filter(a => a.linked_workshop_ids?.includes(w.id))
          const open = expanded === w.id

          return (
            <div key={w.id} className="bg-white border border-black/[0.06] rounded-[11px] overflow-hidden">
              {/* Header */}
              <div className="bg-[var(--g5)] px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="font-syne text-[13px] font-bold text-[var(--g1)]">{w.title}</div>
                  <div className="text-[10px] text-[var(--g2)] mt-0.5">{w.category}</div>
                </div>
                <div className="flex items-center gap-2">
                  {linkedGrants.length > 0 && (
                    <span className="bg-[var(--b2)] text-[var(--b1)] text-[10px] font-medium px-2 py-0.5 rounded-full">
                      {linkedGrants.length} grant{linkedGrants.length > 1 ? 's' : ''}
                    </span>
                  )}
                  <Badge label={w.status} />
                  {w.ai_plan && (
                    <button onClick={() => setPlanModal(w)} className="text-[var(--g1)] hover:opacity-70 transition-opacity" title="View AI Plan">
                      <FileText size={14} />
                    </button>
                  )}
                  <button onClick={() => setExpanded(open ? null : w.id)} className="text-gray-400 hover:text-gray-600">
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button onClick={() => del(w.id)} className="text-gray-300 hover:text-[var(--c1)] transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 py-3 border-b border-black/[0.04]">
                {[
                  ['Date', w.date ? new Date(w.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBC'],
                  ['Location', w.location ?? 'TBC'],
                  ['Facilitator', w.facilitator ?? '—'],
                  ['Assigned To', w.assigned_to ?? '—'],
                ].map(([l, v]) => (
                  <div key={l}>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.3px] mb-0.5">{l}</div>
                    <div className="text-[12px] font-medium">{v}</div>
                  </div>
                ))}
              </div>

              {/* Budget bar always visible if set */}
              {w.budget > 0 && (
                <div className="px-4 py-3 border-b border-black/[0.04]">
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span className="text-gray-500">Budget spent</span>
                    <span className="font-semibold" style={{ color }}>
                      £{spent.toLocaleString()} / £{Number(w.budget).toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <ProgressBar pct={pct} color={color} />
                </div>
              )}

              {/* Expanded: expenses + linked grants */}
              {open && (
                <div className="px-4 pb-4 pt-2">
                  {linkedGrants.length > 0 && (
                    <div className="mb-3">
                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.3px] mb-1.5">Linked Grant Applications</div>
                      <div className="flex flex-wrap gap-1.5">
                        {linkedGrants.map((g, i) => (
                          <span key={i} className="bg-[var(--b2)] text-[var(--b1)] text-[11px] px-2 py-0.5 rounded-full">{g.grant_name}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {wExp.length > 0 && (
                    <div className="mb-3">
                      <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.3px] mb-1.5">Expenses</div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[12px]">
                          <thead>
                            <tr className="border-b border-black/[0.06]">
                              {['Category', 'Description', 'Amount', 'Date', 'Paid By'].map(h => (
                                <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase pb-1.5 pr-3">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {wExp.map(e => (
                              <tr key={e.id} className="border-b border-black/[0.04] last:border-0">
                                <td className="py-1.5 pr-3">{e.category}</td>
                                <td className="py-1.5 pr-3 text-gray-500">{e.description ?? '—'}</td>
                                <td className="py-1.5 pr-3 font-semibold text-[var(--g1)]">£{Number(e.amount).toLocaleString()}</td>
                                <td className="py-1.5 pr-3 text-gray-400">{e.date ? new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}</td>
                                <td className="py-1.5 text-gray-400">{e.paid_by ?? '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <Btn size="sm" variant="outline" onClick={() => setExpModal(w)}>
                    <Plus size={12} /> Log Expense
                  </Btn>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Plan Workshop Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Plan a Workshop" width="max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <Field label="Workshop Title">
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Creative Writing for Young People" />
            </Field>
          </div>
          <Field label="Category">
            <Select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {WORKSHOP_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {['Planning', 'Confirmed', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Date"><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></Field>
          <Field label="Location"><Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Venue name" /></Field>
          <Field label="Capacity"><Input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} placeholder="30" /></Field>
          <Field label="Budget (£)"><Input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} placeholder="500" /></Field>
          <Field label="Facilitator"><Input value={form.facilitator} onChange={e => setForm(f => ({ ...f, facilitator: e.target.value }))} placeholder="Lead name" /></Field>
          <Field label="Assigned To"><Input value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))} placeholder="Team member" /></Field>
          <div className="md:col-span-2">
            <Field label="Target Audience"><Input value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))} placeholder="e.g. Young people aged 14–25" /></Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Goals / Notes for AI"><Textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="What should this workshop achieve?" /></Field>
          </div>
        </div>

        <Divider />
        <div className="flex gap-2 justify-end">
          <Btn variant="outline" onClick={() => setShowModal(false)}>Cancel</Btn>
          <Btn variant="ghost" onClick={generatePlan} disabled={!form.title || aiLoading}>
            {aiLoading ? <Spinner size={12} /> : <Sparkles size={12} />}
            AI Plan
          </Btn>
          <Btn onClick={save} disabled={saving}>
            {saving ? <Spinner size={12} /> : null} Save Workshop
          </Btn>
        </div>

        {aiLoading && (
          <div className="mt-4 flex items-center gap-2 text-[12px] text-gray-400">
            <Spinner /> Generating workshop plan…
          </div>
        )}

        {aiPlan && (
          <>
            <Divider />
            <AIBar>AI has generated a full workshop plan below. Save with plan to attach it to the workshop.</AIBar>
            <div className="bg-[#F8F7F4] border border-black/[0.06] rounded-[9px] p-3 ai-content max-h-64 overflow-y-auto mb-3">
              {aiPlan}
            </div>
            <div className="flex gap-2 justify-end">
              <Btn size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(aiPlan)}>Copy Plan</Btn>
              <Btn size="sm" onClick={saveWithPlan} disabled={saving}>Save with Plan</Btn>
            </div>
          </>
        )}
      </Modal>

      {/* View AI Plan Modal */}
      <Modal open={!!planModal} onClose={() => setPlanModal(null)} title={`Plan: ${planModal?.title ?? ''}`} width="max-w-2xl">
        <div className="bg-[#F8F7F4] border border-black/[0.06] rounded-[9px] p-3 ai-content max-h-[60vh] overflow-y-auto">
          {planModal?.ai_plan}
        </div>
        <div className="flex justify-end mt-3">
          <Btn size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(planModal?.ai_plan ?? '')}>Copy</Btn>
        </div>
      </Modal>

      {/* Log Expense Modal */}
      <Modal open={!!expModal} onClose={() => setExpModal(null)} title={`Log Expense: ${expModal?.title ?? ''}`}>
        <Field label="Category">
          <Select value={expForm.category} onChange={e => setExpForm(f => ({ ...f, category: e.target.value }))}>
            {['Materials', 'Venue', 'Facilitator Fee', 'Equipment', 'Travel', 'Catering', 'Marketing', 'Other'].map(c => <option key={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Amount (£)"><Input type="number" value={expForm.amount} onChange={e => setExpForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" /></Field>
        <Field label="Description"><Input value={expForm.description} onChange={e => setExpForm(f => ({ ...f, description: e.target.value }))} placeholder="What was this for?" /></Field>
        <Field label="Date"><Input type="date" value={expForm.date} onChange={e => setExpForm(f => ({ ...f, date: e.target.value }))} /></Field>
        <Field label="Paid By"><Input value={expForm.paid_by} onChange={e => setExpForm(f => ({ ...f, paid_by: e.target.value }))} placeholder="Name" /></Field>
        <div className="flex gap-2 justify-end mt-3">
          <Btn variant="outline" onClick={() => setExpModal(null)}>Cancel</Btn>
          <Btn onClick={saveExpense}>Log Expense</Btn>
        </div>
      </Modal>
    </div>
  )
}
