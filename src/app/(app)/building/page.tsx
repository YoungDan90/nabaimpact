'use client'

import { useState } from 'react'
import { FoundGrant } from '@/types'
import { Spinner, AIBar, Btn, Badge } from '@/components/ui'
import { Home, Sparkles, ExternalLink } from 'lucide-react'

const BUILDING_TAGS = [
  'Community Building', 'Church Premises', 'Capital Works',
  'Refurbishment', 'Accessibility', 'Heritage', 'Essex / Southend',
  'Faith Building', 'Community Hub',
]

export default function BuildingPage() {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(['Community Building', 'Church Premises', 'Capital Works'])
  )
  const [results, setResults] = useState<FoundGrant[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [draftGrant, setDraftGrant] = useState<FoundGrant | null>(null)
  const [draft, setDraft] = useState('')
  const [draftLoading, setDraftLoading] = useState(false)

  const toggle = (tag: string) => {
    setSelected(s => { const n = new Set(s); n.has(tag) ? n.delete(tag) : n.add(tag); return n })
  }

  const search = async () => {
    setLoading(true); setSearched(true)
    const res = await fetch('/api/find-grants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: Array.from(selected), grantType: 'building' }),
    })
    const { grants } = await res.json()
    setResults(grants ?? [])
    setLoading(false)
  }

  const generateDraft = async (grant: FoundGrant) => {
    setDraftGrant(grant); setDraft(''); setDraftLoading(true)
    const res = await fetch('/api/ai-draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grant: { ...grant, grant_type: 'Building / Premises' } }),
    })
    const { draft: d } = await res.json()
    setDraft(d ?? ''); setDraftLoading(false)
  }

  return (
    <div>
      {/* Hero */}
      <div className="bg-[var(--g1)] rounded-[14px] p-6 mb-6">
        <div className="text-[10px] font-bold text-[var(--g4)] uppercase tracking-[1px] mb-2">Premises & Capital Grants</div>
        <h1 className="font-syne text-[20px] font-bold text-white mb-1.5">Building & Property Grants</h1>
        <p className="text-[12px] text-white/60 mb-5 leading-relaxed max-w-xl">
          Find grants to help Naba Impact and Alignment Church secure and develop a permanent building — including
          capital works, refurbishment, accessibility, and community facilities.
        </p>

        <div className="flex flex-wrap gap-2 mb-5">
          {BUILDING_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => toggle(tag)}
              className={`px-3 py-1.5 rounded-full text-[11px] border transition-all ${
                selected.has(tag)
                  ? 'bg-white/90 text-[var(--g1)] border-transparent font-medium'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={search}
            disabled={loading || !selected.size}
            className="bg-white text-[var(--g1)] px-5 py-2.5 rounded-[8px] font-syne font-bold text-[13px] flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[var(--g5)] transition-colors"
          >
            {loading ? <Spinner size={14} /> : <Home size={14} />}
            {loading ? 'Searching…' : 'Search Building Grants'}
          </button>
          <span className="text-[11px] text-white/40">Capital, premises & faith building grants</span>
        </div>
      </div>

      {/* Context cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {[
          { title: 'Naba Impact Hub', desc: 'A permanent creative space for arts, music, film and community programmes in Southend-on-Sea.' },
          { title: 'Alignment Church', desc: 'A presence-centred church plant seeking its own premises — currently in pre-launch phase in Southend.' },
          { title: 'Community Facility', desc: 'A multi-use building serving Southend communities through workshops, events and pastoral support.' },
        ].map(c => (
          <div key={c.title} className="bg-[var(--g5)] rounded-[10px] p-4">
            <div className="font-syne text-[13px] font-bold text-[var(--g1)] mb-1.5">{c.title}</div>
            <div className="text-[12px] text-[var(--g2)] leading-relaxed">{c.desc}</div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-400 text-[13px] flex flex-col items-center gap-3">
          <Spinner size={20} />
          <div>Searching UK capital and building grant databases…</div>
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <div className="font-syne text-[14px] font-semibold mb-3">{results.length} building grant opportunities found</div>
          <div className="space-y-3">
            {results.map(g => (
              <div key={g.id} className="bg-white border border-black/[0.06] rounded-[10px] p-4 hover:border-[var(--a2)] transition-colors">
                <div className="flex items-start gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[14px]">{g.name}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{g.funder}</div>
                  </div>
                  <div className="font-bold text-[13px] text-[var(--g1)] shrink-0">{g.amount}</div>
                </div>

                <p className="text-[12px] text-gray-500 leading-relaxed mb-3">{g.description}</p>

                {g.building_note && (
                  <div className="bg-[var(--a3)] border border-[var(--a2)] rounded-[8px] px-3 py-2 text-[12px] text-[var(--a1)] mb-3 flex items-start gap-2">
                    <span className="mt-0.5 shrink-0">🏛</span>
                    <div><strong>Building note:</strong> {g.building_note}</div>
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge label={g.category} />
                  <span className="bg-[var(--a3)] text-[var(--a1)] text-[10px] font-medium px-2 py-0.5 rounded-full">
                    Deadline: {g.deadline}
                  </span>
                  <div className="ml-auto flex gap-2">
                    <Btn size="sm" onClick={() => generateDraft(g)}>
                      <Sparkles size={11} /> AI Draft
                    </Btn>
                    {g.url?.startsWith('http') && (
                      <Btn size="sm" variant="ghost" onClick={() => window.open(g.url, '_blank')}>
                        <ExternalLink size={11} /> View
                      </Btn>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-10 text-gray-400 text-[13px]">No results returned. Try different focus areas.</div>
      )}

      {/* Draft Panel */}
      {draftGrant && (
        <div
          className="fixed inset-0 bg-black/40 z-[200] flex items-start justify-center p-4 overflow-y-auto"
          onClick={e => { if (e.target === e.currentTarget) setDraftGrant(null) }}
        >
          <div className="bg-white rounded-[14px] p-5 w-full max-w-2xl my-auto">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-syne text-[16px] font-bold">Building Grant Application Draft</div>
                <div className="text-[12px] text-gray-400">{draftGrant.name}</div>
              </div>
              <button onClick={() => setDraftGrant(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <AIBar>
              This draft explains Naba Impact and Alignment Church's need for a permanent building, referencing your
              workshop programme as evidence of community demand.
            </AIBar>
            {draftLoading ? (
              <div className="flex items-center gap-2 justify-center py-16 text-gray-400 text-[13px]">
                <Spinner /> Writing building grant application…
              </div>
            ) : (
              <div className="bg-[#F8F7F4] border border-black/[0.06] rounded-[9px] p-3 ai-content max-h-[55vh] overflow-y-auto">
                {draft}
              </div>
            )}
            {!draftLoading && draft && (
              <div className="flex justify-end gap-2 mt-3">
                <Btn size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(draft)}>Copy</Btn>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
