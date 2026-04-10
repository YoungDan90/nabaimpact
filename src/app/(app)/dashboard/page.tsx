import { supabase } from '@/lib/supabase'
import { StatCard, Card, CardTitle, Badge, ProgressBar, Empty } from '@/components/ui'

export const revalidate = 0

async function getData() {
  const [{ data: workshops }, { data: applications }, { data: expenses }, { data: grants }] =
    await Promise.all([
      supabase.from('workshops').select('*').order('created_at', { ascending: false }),
      supabase.from('applications').select('*').order('created_at', { ascending: false }),
      supabase.from('expenses').select('*'),
      supabase.from('found_grants').select('id').limit(1),
    ])
  return { workshops: workshops ?? [], applications: applications ?? [], expenses: expenses ?? [], grantsFound: grants?.length ?? 0 }
}

export default async function DashboardPage() {
  const { workshops, applications, expenses, grantsFound } = await getData()

  const totalBudget = workshops.reduce((s, w) => s + (w.budget ?? 0), 0)
  const totalSpent = expenses.reduce((s, e) => s + (e.amount ?? 0), 0)
  const awarded = applications.filter(a => a.status === 'Awarded')
  const awardedValue = awarded.reduce((s, a) => s + (a.amount ?? 0), 0)

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-syne text-[20px] font-bold">Impact Dashboard</h1>
        <p className="text-[12px] text-gray-500 mt-0.5">Naba Impact — live overview across grants, workshops and budgets</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard label="Grants Found" value={grantsFound} sub="opportunities" accent="var(--g2)" />
        <StatCard label="Applications" value={applications.length} sub="submitted" accent="var(--b1)" />
        <StatCard label="Workshops" value={workshops.length} sub="planned" accent="var(--a1)" />
        <StatCard label="Value Awarded" value={`£${awardedValue.toLocaleString()}`} sub="total" accent="var(--c1)" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Recent Applications */}
        <Card>
          <CardTitle>Grant Applications</CardTitle>
          {applications.length === 0 ? (
            <Empty>No applications yet.</Empty>
          ) : (
            <div className="space-y-0">
              {applications.slice(0, 6).map(a => (
                <div key={a.id} className="flex items-center gap-3 py-2.5 border-b border-black/[0.05] last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate">{a.grant_name}</div>
                    <div className="text-[11px] text-gray-400">{a.grant_type}</div>
                  </div>
                  <div className="text-[12px] font-semibold text-[var(--g1)] shrink-0">
                    {a.amount ? `£${Number(a.amount).toLocaleString()}` : '—'}
                  </div>
                  <Badge label={a.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Workshops */}
        <Card>
          <CardTitle>Workshop Pipeline</CardTitle>
          {workshops.length === 0 ? (
            <Empty>No workshops yet.</Empty>
          ) : (
            <div className="space-y-2">
              {workshops.slice(0, 5).map(w => (
                <div key={w.id} className="bg-[var(--g5)] rounded-[8px] px-3 py-2.5">
                  <div className="text-[12px] font-semibold text-[var(--g1)]">{w.title}</div>
                  <div className="text-[11px] text-[var(--g2)] mt-0.5">
                    {w.date ? new Date(w.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date TBC'} · {w.location ?? 'Location TBC'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Budget Overview */}
      <Card>
        <CardTitle>
          Budget Overview
          <span className="text-[11px] text-gray-400 font-normal">
            £{totalSpent.toLocaleString()} spent of £{totalBudget.toLocaleString()} allocated
          </span>
        </CardTitle>
        {workshops.filter(w => w.budget > 0).length === 0 ? (
          <Empty>No workshop budgets set yet.</Empty>
        ) : (
          <div className="space-y-3">
            {workshops.filter(w => w.budget > 0).map(w => {
              const spent = expenses.filter(e => e.workshop_id === w.id).reduce((s, e) => s + (e.amount ?? 0), 0)
              const pct = w.budget ? Math.round((spent / w.budget) * 100) : 0
              const color = pct > 90 ? 'var(--c1)' : pct > 70 ? 'var(--a2)' : 'var(--g2)'
              return (
                <div key={w.id}>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="font-medium">{w.title}</span>
                    <span className="text-gray-400">£{spent.toLocaleString()} / £{Number(w.budget).toLocaleString()}</span>
                  </div>
                  <ProgressBar pct={pct} color={color} />
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
