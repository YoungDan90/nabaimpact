export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import { NABA_CONTEXT } from '@/lib/config'

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 })
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const { tags, grantType } = await req.json()
  const isBuilding = grantType === 'building'

  const { data: workshops } = await supabase
    .from('workshops')
    .select('title, category, audience, status')

  const wsSummary = workshops?.length
    ? workshops.map(w => `- "${w.title}" (${w.category}, ${w.audience ?? 'community'})`).join('\n')
    : 'Community arts, music, film/media, youth and faith programmes in Southend-on-Sea.'

  const prompt = isBuilding
    ? `List 5 real UK grants for building/premises/capital works for a faith and arts community organisation.
Focus: ${tags.join(', ')}
Organisation: Naba Impact + Alignment Church, Southend-on-Sea, Essex. Black British-led.

Return ONLY a raw JSON array, no markdown, no explanation:
[{"name":"","funder":"","description":"2 sentences","amount":"£X - £X","deadline":"Rolling or Month YYYY","category":"Building","eligibility":"1 sentence","url":"https://...","grant_type":"Building / Premises","building_note":"1 sentence on relevance to church/community premises"}]`

    : `List 5 real UK grants for a creative arts and community organisation.
Focus areas: ${tags.join(', ')}
Organisation: Naba Impact, Southend-on-Sea, Essex. Black British-led arts, music, film, community and faith org.
Our workshops: ${wsSummary}

Return ONLY a raw JSON array, no markdown, no explanation:
[{"name":"","funder":"","description":"2 sentences","amount":"£X - £X","deadline":"Rolling or Month YYYY","category":"Arts & Culture","eligibility":"1 sentence","url":"https://...","grant_type":"Programme","workshop_match":"1 sentence on how this matches our workshops","match_score":"High"}]

Include real grants from: Arts Council England, National Lottery Community Fund, Essex Cultural Diversity Project, Youth Music, Paul Hamlyn Foundation, Garfield Weston.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n')

    const match = text.match(/\[[\s\S]*\]/)
    if (!match) {
      return NextResponse.json({ error: 'No JSON returned', raw: text }, { status: 500 })
    }

    const grants = JSON.parse(match[0])

    const { data: saved, error: dbErr } = await supabase
      .from('found_grants')
      .insert(grants.map((g: Record<string, string>) => ({
        name: g.name,
        funder: g.funder,
        description: g.description,
        amount: g.amount,
        deadline: g.deadline,
        category: g.category,
        eligibility: g.eligibility,
        url: g.url,
        grant_type: g.grant_type ?? (isBuilding ? 'Building / Premises' : 'Programme'),
        workshop_match: g.workshop_match ?? null,
        match_score: g.match_score ?? null,
        building_note: g.building_note ?? null,
      })))
      .select()

    if (dbErr) console.error('DB error:', dbErr)

    return NextResponse.json({ grants: saved ?? grants })
  } catch (err) {
    console.error('find-grants error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
