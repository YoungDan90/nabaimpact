import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import { NABA_CONTEXT } from '@/lib/config'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { grant } = await req.json()

  // Fetch workshops to ground the application
  const { data: workshops } = await supabase
    .from('workshops')
    .select('title, category, audience, date, location, status, notes')

  const wsSummary = workshops?.length
    ? workshops.map(w =>
        `- "${w.title}" (${w.category}, audience: ${w.audience ?? 'community'}, ${w.date ?? 'date TBC'}, status: ${w.status}${w.notes ? `, notes: ${w.notes}` : ''})`
      ).join('\n')
    : 'Community arts workshops, music sessions, film/media production, youth leadership, and faith/wellbeing programmes.'

  const isBuilding = grant.grant_type === 'Building / Premises'

  const workshopContext = isBuilding
    ? `This is a BUILDING/PREMISES grant application. Naba Impact and Alignment Church are seeking a permanent community base in Southend-on-Sea. The building will serve as a creative hub, church, and community facility. Our workshop programme demonstrates the community need for a permanent space:
${wsSummary}`
    : `Our planned workshop programme (which this grant will fund):
${wsSummary}

The application MUST be grounded in and directly reference these actual workshops as concrete evidence of our delivery capacity and community need.`

  const prompt = `Write a full grant application for Naba Impact:

Grant: ${grant.name}
Funder: ${grant.funder}
Amount: ${grant.amount}
Category: ${grant.category}

ABOUT NABA IMPACT:
${NABA_CONTEXT}

${workshopContext}

Write a complete, compelling application with these sections:

1. ORGANISATION OVERVIEW
Who Naba Impact is, our mission, our roots and track record in Southend-on-Sea.

2. PROJECT DESCRIPTION
A compelling description of the project — ${isBuilding ? 'the building/premises project and what it will enable' : 'the workshop programme we will deliver'}, grounded in our actual activity.

3. AIMS & OBJECTIVES
4-5 specific, measurable objectives.

4. TARGET BENEFICIARIES
Who we will serve, why they need this, and how we will reach them.

5. DELIVERY PLAN
How we will deliver — referencing ${isBuilding ? 'the building development timeline' : 'our specific workshop programme'}.

6. BUDGET OVERVIEW
Realistic breakdown matching the grant amount of ${grant.amount}.

7. IMPACT & EVALUATION
How we will measure and report success.

8. CONCLUSION
Why Naba Impact is best placed to deliver this, and what difference this grant will make.

Write in formal British English. Be specific, authentic, and compelling. Tailor everything to ${grant.funder}'s priorities.`

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
