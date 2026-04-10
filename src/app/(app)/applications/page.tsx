'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Application, Workshop } from '@/types'
import { GRANT_TYPES } from '@/lib/config'
import {
  Badge, StatCard, Card, CardTitle, Modal, Btn, Field, Input, Select, Textarea,
  Spinner, Empty, Divider, AIBar,
} from '@/components/ui'
import { Plus, Trash2 } from 'lucide-react'

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [showModal, setShowModal] = useState(false)
  const [draftModal, setDraftModal] = useState<Application | null>(null)
  const [draftText, setDraftText] = useState('')
  const [draftLoading, setDraftLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    grant_name: '', funder: '', grant_type: 'Programme',
    date_submitted: '', amount: '', status: 'Submitted', notes: '',
    linked_workshop_ids: [] as string[],
  })

  const load = async () => {
    const [{ data: apps }, { data: ws }] = await Promise.all([
      supabase.from('applications').select('*').order('created_at', { ascending: false }),
      supabase.from('workshops').select('*').order('title'),
    ])
    setApplications(apps ?? [])
    setWorkshops(ws ?? [])
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.grant_name.trim()) return
    setSaving(true)
    await supabase.from('applications').insert({
      grant_name: form.grant_name,
      funder: form.funder || null,
      grant_type: form.grant_type,
      date_submitted: form.date_submitted || null,
      amount: form.amount ? parseFloat(form.amount) : 0,
      status: form.status,
      notes: form.notes || null,
      linked_workshop_ids: form.linked_workshop_ids,
    })
    setSaving(false)
    setShowModal(false)
    setForm({ grant_name: '', funder: '', grant_type: 'Programme', date_submitted: '', amount: '', status: 'Submitted', notes: '', linked_workshop_ids: [] })
    load()
  }

  const generateDraft = async (app: Application) => {
    setDraftModal(app)
    setDraftText('')
    setDraftLoading(true)
    const res = await fetch('/api/ai-draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grant: { name: app.grant_name, funder: app.funder, amount: app.amount, category: app.grant_type, grant_type: app.grant_type } }),
    })
    const { draft } = await res.json()
    setDraftText(draft ?? 'Could not generate draft.')
    setDraftLoading(false)
    // Save draft to DB
    await supabase.from('applications').update({ ai_draft: draft }).eq('id', app.id)
    load()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this application?')) return
    await supabase.from('applications').delete().eq('id', id)
    load()
  }

  const awarded = applications.filter(a => a.status === 'Awarded')
  const rate = applications.length ? Math.round((awarded.length / applications.length) * 100) : 0
  const awardedValue = awarded.reduce((s, a) => s + Number(a.amount), 0)

  const toggleWs = (id: string) => {
    setForm(f => ({
      ...f,
      linked_workshop_ids: f.linked_workshop_ids.includes(id)
        ? f.linked_workshop_ids.filter(x => x !== id)
        : [...f.linked_workshop_ids, id],
    }))
  }

  const statusColor: Record<string, string> = {
    Submitted: 'var(--b1)', 'In Review': 'var(--a1)', Awarded: 'var(--g2)', Rejected: 'var(--c1)',
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h1 className="font-syne text-[20px] font-bold">Applications</h1>
          <p className="text-[12px] text-gray-500 mt-0.5">All grant applications linked to the workshops they fund.</p>
        </div>
        <Btn onClick={() => setShowModal(true)}><Plus size={14} /> Log Application</Btn>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <StatCard label="Total Submitted" value={applications.length} accent="var(--g2)" />
        <StatCard label="Success Rate" value={`${rate}%`} accent="var(--b1)" />
        <StatCard label="Value Awarded" value={`£${awardedValue.toLocaleString()}`} accent="var(--a1)" />
      </div>

      {applications.length === 0 ? (
        <Empty>No applications yet. Log your first one above.</Empty>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px] data-table">
              <thead>
                <tr className="border-b border-black/[0.06]">
                  {['Grant', 'Type', 'Linked Workshops', 'Amount', 'Status', 'Date', ''].map(h => (
                    <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-[0.3px] py-2 px-3 bg-[#F8F7F4]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.map(a => {
                  const linked = workshops.filter(w => a.linked_workshop_ids?.includes(w.id))
                  return (
                    <tr key={a.id} className="border-b border-black/[0.04] last:border-0">
                      <td className="py-3 px-3">
                        <div className="font-medium">{a.grant_name}</div>
                        {a.funder && <div className="text-[11px] text-gray-400">{a.funder}</div>}
                        {a.ai_draft && <span className="text-[10px] text-[var(--g2)]">AI draft saved</span>}
                      </td>
                      <td className="py-3 px-3"><Badge label={a.grant_type} /></td>
                      <td className="py-3 px-3">
                        {linked.length > 0
                          ? <div className="flex flex-wrap gap-1">{linked.map(w => <span key={w.id} className="bg-[var(--g5)] text-[var(--g1)] text-[10px] px-1.5 py-0.5 rounded-full">{w.title}</span>)}</div>
                          : <span className="text-gray-400">—</span>
                        }
                      </td>
                      <td className="py-3 px-3 font-semibold text-[var(--g1)]">
                        {a.amount ? `£${Number(a.amount).toLocaleString()}` : '—'}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: statusColor[a.status] ?? 'gray' }} />
                          <Badge label={a.status} />
                        </div>
                      </td>
                      <td className="py-3 px-3 text-gray-400">
                        {a.date_submitted ? new Date(a.date_submitted).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex gap-1">
                          <Btn size="sm" variant="ghost" onClick={() => generateDraft(a)}>Draft</Btn>
                          <button onClick={() => del(a.id)} className="text-gray-300 hover:text-[var(--c1)] transition-colors p-1">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Log Application Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Log Application" width="max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <Field label="Grant Name"><Input value={form.grant_name} onChange={e => setForm(f => ({ ...f, grant_name: e.target.value }))} placeholder="Grant name" /></Field>
          </div>
          <Field label="Funder"><Input value={form.funder} onChange={e => setForm(f => ({ ...f, funder: e.target.value }))} placeholder="Funder organisation" /></Field>
          <Field label="Grant Type">
            <Select value={form.grant_type} onChange={e => setForm(f => ({ ...f, grant_type: e.target.value }))}>
              {GRANT_TYPES.map(t => <option key={t}>{t}</option>)}
            </Select>
          </Field>
          <Field label="Date Submitted"><Input type="date" value={form.date_submitted} onChange={e => setForm(f => ({ ...f, date_submitted: e.target.value }))} /></Field>
          <Field label="Amount (£)"><Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="5000" /></Field>
          <div className="md:col-span-2">
            <Field label="Status">
              <Select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {['Submitted', 'In Review', 'Awarded', 'Rejected'].map(s => <option key={s}>{s}</option>)}
              </Select>
            </Field>
          </div>
        </div>

        {workshops.length > 0 && (
          <div className="mb-3">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.4px] mb-1.5">Link to Workshops this grant funds</div>
            <div className="border border-black/[0.08] rounded-[7px] overflow-hidden max-h-40 overflow-y-auto">
              {workshops.map(w => (
                <label key={w.id} className="flex items-center gap-2.5 px-3 py-2 hover:bg-[#F8F7F4] cursor-pointer border-b border-black/[0.04] last:border-0">
                  <input
                    type="checkbox"
                    checked={form.linked_workshop_ids.includes(w.id)}
                    onChange={() => toggleWs(w.id)}
                    className="accent-[var(--g2)]"
                  />
                  <div>
                    <div className="text-[12px] font-medium">{w.title}</div>
                    <div className="text-[10px] text-gray-400">{w.category} · {w.status}</div>
                  </div>
                </label>
              ))}
            </div>
            {form.linked_workshop_ids.length > 0 && (
              <AIBar>
                This application will be AI-drafted to align with your selected workshops: <strong>{workshops.filter(w => form.linked_workshop_ids.includes(w.id)).map(w => w.title).join(', ')}</strong>
              </AIBar>
            )}
          </div>
        )}

        <Field label="Notes"><Textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></Field>
        <div className="flex gap-2 justify-end mt-2">
          <Btn variant="outline" onClick={() => setShowModal(false)}>Cancel</Btn>
          <Btn onClick={save} disabled={saving}>{saving ? <Spinner size={12} /> : null} Save</Btn>
        </div>
      </Modal>

      {/* AI Draft Modal */}
      <Modal open={!!draftModal} onClose={() => setDraftModal(null)} title={`Draft: ${draftModal?.grant_name ?? ''}`} width="max-w-2xl">
        {draftModal && (
          <>
            {draftModal.linked_workshop_ids?.length > 0 && (
              <AIBar>
                This draft is grounded in your linked workshops: <strong>{workshops.filter(w => draftModal.linked_workshop_ids.includes(w.id)).map(w => w.title).join(', ')}</strong>
              </AIBar>
            )}
            {draftLoading ? (
              <div className="flex items-center gap-2 justify-center py-16 text-gray-400 text-[13px]">
                <Spinner /> Generating application draft…
              </div>
            ) : (
              <div className="bg-[#F8F7F4] border border-black/[0.06] rounded-[9px] p-3 ai-content max-h-[60vh] overflow-y-auto">
                {draftText || draftModal.ai_draft || 'Click Draft to generate.'}
              </div>
            )}
            {!draftLoading && (draftText || draftModal.ai_draft) && (
              <div className="flex justify-end gap-2 mt-3">
                <Btn size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(draftText || draftModal.ai_draft || '')}>Copy</Btn>
                <Btn size="sm" onClick={() => generateDraft(draftModal)}>Regenerate</Btn>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  )
}
