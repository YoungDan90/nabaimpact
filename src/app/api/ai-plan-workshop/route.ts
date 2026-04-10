import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { NABA_CONTEXT } from '@/lib/config'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { title, category, audience, capacity, location, budget, notes } = await req.json()

  const prompt = `Design a full workshop plan for Naba Impact:

Title: ${title}
Category: ${category}
Audience: ${audience || 'Community members'}
Capacity: ${capacity || '20–30'} participants
Location: ${location || 'Community venue, Southend-on-Sea'}
Budget: £${budget || 'TBC'}
Goals: ${notes || 'Community engagement and creative development'}

ABOUT NABA IMPACT:
${NABA_CONTEXT}

Create a complete, practical workshop plan:

WORKSHOP OVERVIEW
A brief description of the workshop and its purpose.

LEARNING OBJECTIVES
3-5 specific, achievable objectives for participants.

TIMED AGENDA
A detailed, timed session breakdown for a 2–3 hour workshop. Include warm-up, main activities, breaks, and wrap-up.

FACILITATOR NOTES
Practical tips for running each section effectively. Include discussion prompts and contingency ideas.

MATERIALS & RESOURCES NEEDED
A practical list of everything required — equipment, stationery, printed materials, digital resources.

BUDGET BREAKDOWN
How to allocate £${budget || 'the available budget'} across the workshop needs.

ACCESSIBILITY CONSIDERATIONS
How to make this workshop inclusive and accessible to all participants.

IMPACT CAPTURE METHOD
How to gather feedback and measure the workshop's impact.

Write in clear, practical British English. Make it creative, community-centred, and true to Naba Impact's ethos.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const plan = message.content.filter(b => b.type === 'text').map(b => b.text).join('\n')
    return NextResponse.json({ plan })
  } catch {
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 })
  }
}
