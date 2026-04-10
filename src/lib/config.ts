import { Role } from '@/types'

export const ROLES: Record<Role, { label: string; tabs: string[]; description: string }> = {
  director: {
    label: 'Director',
    tabs: ['dashboard', 'finder', 'workshops', 'applications', 'budget', 'building'],
    description: 'Full access to all platform features',
  },
  coordinator: {
    label: 'Workshop Coordinator',
    tabs: ['dashboard', 'workshops', 'budget'],
    description: 'Plan workshops, log expenses, view budgets',
  },
  finance: {
    label: 'Finance',
    tabs: ['dashboard', 'applications', 'budget'],
    description: 'Track applications, budgets and spending',
  },
  volunteer: {
    label: 'Volunteer',
    tabs: ['workshops'],
    description: 'View assigned workshops',
  },
}

export const TAB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  finder: 'AI Grant Finder',
  workshops: 'Workshops',
  applications: 'Applications',
  budget: 'Budget Tracker',
  building: 'Building Grants',
}

export const WORKSHOP_CATEGORIES = [
  'Arts & Creativity', 'Music', 'Film & Media', 'Leadership',
  'Faith & Wellbeing', 'Youth', 'Community', 'Other',
]

export const EXPENSE_CATEGORIES = [
  'Materials', 'Venue', 'Facilitator Fee', 'Equipment',
  'Travel', 'Catering', 'Marketing', 'Other',
]

export const GRANT_TYPES = [
  'Programme', 'Building / Premises', 'Equipment', 'Capacity Building',
]

export const NABA_CONTEXT = `
Naba Impact is a creative arts and community organisation based in Southend-on-Sea, Essex.
- Led by people of Black British (Nigerian and Jamaican) heritage
- Encompasses arts, music, film/media, creative production, community, and faith
- Includes Alignment Church: a presence-centred, Spirit-led church plant in Southend-on-Sea
- Divisions: Naba Arts, Naba Studios, Naba Creators, Naba Sounds, Naba Publishing
- Mission: community transformation through creativity, culture, and faith
- Target communities: young people, families, diverse communities in Southend and Essex
`
