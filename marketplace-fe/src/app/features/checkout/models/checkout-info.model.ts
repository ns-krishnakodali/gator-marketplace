export interface MeetupDetails {
  address: string
  date: string
  time: string
  priceProposal?: number
  additionalNotes?: string
}

export type PaymentMethod = 'cash' | 'venmo' | 'zelle'
