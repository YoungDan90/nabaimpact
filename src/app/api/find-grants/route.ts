import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import { NABA_CONTEXT } from '@/lib/config'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { tags, grantType } = await req.json()

  // Fetch workshops to ground the search
  const { data: workshops } = await supabase.from('workshops').select('title, category, audience, status, date')
  const wsSummary = workshops?.length
    ? workshops.map(w => `- "${w.title}" (${w.category}, audience: ${w.audience ?? 'community'}, status: ${w.status})`).join('\n')
    : 'No workshops planned yet — but we deliver community arts, music, and creative programmes.'

  const isBuilding = grantType === 'building'

  const systemPrompt = isBuilding
    ? `You are a UK capital and premises grant specialist. Return ONLY a valid JSON array with no markdown, explanation, or preamble.`
    : `You are a UK grant research specialist for Naba Impact. ${NABA_CONTEXT} Return ONLY a valid JSON array with no markdown, explanation, or preamble.`

  const userPrompt = isBuilding
    ? `Find 5 current UK grants for building, premises, capital works, or community facility development.
Focus areas: ${tags.join(', ')}
Organisation: Naba Impact + Alignment Church, Southend-on-Sea, Essex. Black British-led faith and arts community organisation seeking a permanent community building.

Return JSON array:
[{"name":"","funder":"","description":"2-3 sentences","amount":"","deadline":"","category":"Building","eligibility":"","url":"","grant_type":"Building / Premises","building_note":"Specific guidance on how this applies to securing or developing church/community premises"}]`

    : `Find 5 current UK programme grant opportunities for: ${tags.join(', ')}.

Our planned workshop programme:
${wsSummary}

For each grant, assess how it matches our actual workshops. Return JSON array:
[{"name":"","funder":"","description":"2-3 sentences","amount":"","deadline":"","category":"","eligibility":"","url":"","grant_type":"Programme","workshop_match":"How this grant specifically matches our workshop programme","match_score":"High/Medium/Low"}]

Prioritise: Arts Council England, National Lottery, Essex funders, youth/arts trusts.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      // @ts-expect-error web_search tool type not yet in SDK types
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    })

    const text = response.content.filter(b => b.type === 'text').map(b => b.text).join('\n')
    const clean = text.replace(/```json|```/g, '').trim()
    const grants = JSON.parse(clean)

    // Save to Supabase
    const { data: saved } = await supabase
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
        workshop_match: g.workshop_match,
        match_score: g.match_score,
        building_note: g.building_note,
      })))
      .select()

    return NextResponse.json({ grants: saved ?? grants })
  } catch {
    return NextResponse.json({ error: 'Failed to find grants' }, { status: 500 })
  }
}
