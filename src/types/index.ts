export type WorkshopStatus = 'Planning' | 'Confirmed' | 'Completed' | 'Cancelled'
export type AppStatus = 'Submitted' | 'In Review' | 'Awarded' | 'Rejected'
export type GrantType = 'Programme' | 'Building / Premises' | 'Equipment' | 'Capacity Building'
export type MatchScore = 'High' | 'Medium' | 'Low'
export type Role = 'director' | 'coordinator' | 'finance' | 'volunteer'

export interface Workshop {
  id: string
  created_at: string
  title: string
  category: string
  status: WorkshopStatus
  date: string | null
  location: string | null
  capacity: number | null
  facilitator: string | null
  assigned_to: string | null
  audience: string | null
  budget: number
  notes: string | null
  ai_plan: string | null
}

export interface Application {
  id: string
  created_at: string
  grant_name: string
  funder: string | null
  grant_type: GrantType
  date_submitted: string | null
  amount: number
  status: AppStatus
  notes: string | null
  ai_draft: string | null
  linked_workshop_ids: string[]
}

export interface Expense {
  id: string
  created_at: string
  workshop_id: string
  category: string
  amount: number
  description: string | null
  date: string | null
  paid_by: string | null
}

export interface FoundGrant {
  id: string
  created_at: string
  name: string
  funder: string
  description: string
  amount: string
  deadline: string
  category: string
  eligibility: string
  url: string
  grant_type: string
  workshop_match?: string
  match_score?: MatchScore
  building_note?: string
}

export interface DashboardStats {
  grantsFound: number
  applications: number
  workshops: number
  totalBudget: number
  totalSpent: number
  awarded: number
}
