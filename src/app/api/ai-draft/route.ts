export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import { NABA_CONTEXT } from '@/lib/config'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { grant } = await req.json()

  const { data: workshops } = await supabase
    .from('workshops')
    .select('title, category, audience, date, location, status, notes')

  const wsSummary = workshops?.length
    ? workshops.map(w =>
        `- "${w.title}" (${w.category}, audience: ${w.audience ?? 'community'}, ${w.date ?? 'date TBC'}, status: ${w.status})`
      ).join('\n')
    : 'Community arts workshops, music sessions, film/media production, youth leadership, and faith/wellbeing programmes.'

  const isBuilding = grant.grant_type === 'Building / Premises'

  const workshopContext = isBuilding
    ? `This is a BUILDING/PREMISES grant. Naba Impact and Alignment Church need a permanent base in Southend-on-Sea. Our workshop programme demonstrates community need:\n${wsSummary}`
    : `Our workshop programme (which this grant will fund):\n${wsSummary}\n\nReference these workshops directly as evidence of delivery capacity.`

  const prompt = `Write a full grant application for Naba Impact:

Grant: ${grant.name}
Funder: ${grant.funder}
Amount: ${grant.amount}
Category: ${grant.category}

ABOUT NABA IMPACT:
${NABA_CONTEXT}

${workshopContext}

Sections: 1. ORGANISATION OVERVIEW 2. PROJECT DESCRIPTION 3. AIMS & OBJECTIVES 4. TARGET BENEFICIARIES 5. DELIVERY PLAN 6. BUDGET OVERVIEW 7. IMPACT & EVALUATION 8. CONCLUSION

Formal British English. Tailored to ${grant.funder}.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })
    const draft = message.content.filter(b => b.type === 'text').map(b => b.text).join('\n')
    return NextResponse.json({ draft })
  } catch {
    return NextResponse.json({ error: 'Failed to generate draft' }, { status: 500 })
  }
}
