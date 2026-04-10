import { Role } from '@/types'

export const ROLES: Record<Role, { label: string; tabs: string[]; description: string }> = {
  director: { label: 'Director', tabs: ['dashboard', 'finder', 'workshops', 'applications', 'budget', 'building'], description: 'Full access' },
  coordinator: { label: 'Workshop Coordinator', tabs: ['dashboard', 'workshops', 'budget'], description: 'Workshops and budgets' },
  finance: { label: 'Finance', tabs: ['dashboard', 'applications', 'budget'], description: 'Applications and budgets' },
  volunteer: { label: 'Volunteer', tabs: ['workshops'], description: 'View workshops' },
}

export const TAB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard', finder: 'AI Grant Finder', workshops: 'Workshops',
  applications: 'Applications', budget: 'Budget Tracker', building: 'Building Grants',
}

export const WORKSHOP_CATEGORIES = ['Arts & Creativity','Music','Film & Media','Leadership','Faith & Wellbeing','Youth','Community','Other']
export const EXPENSE_CATEGORIES = ['Materials','Venue','Facilitator Fee','Equipment','Travel','Catering','Marketing','Other']
export const GRANT_TYPES = ['Programme','Building / Premises','Equipment','Capacity Building']

export const NABA_CONTEXT = `
Naba Studios is the parent company — a creative media and arts organisation based in Southend-on-Sea, Essex, led by people of Black British (Nigerian and Jamaican) heritage. Divisions: Naba Arts, Naba Creators, Naba Sounds, Naba Publishing, and Naba Impact.
Naba Impact is the community and social impact arm — it delivers workshops, community programmes and grants-funded activity for young people, families and diverse communities in Southend and Essex. All grant applications are made under Naba Impact as the community arm of Naba Studios.
Mission: community transformation through creativity, culture and the arts. Location: Southend-on-Sea, Essex.
`

export const BUILDING_CONTEXT = `
Naba Studios is seeking a permanent base in Southend-on-Sea — a building to serve as a creative studio, rehearsal space, production facility and community venue. This will give Naba Studios' divisions a professional home and enable Naba Impact to deliver community programmes from a permanent, accessible location.
`
