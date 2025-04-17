export interface MeetupDetails {
  address: string
  date: string
  time: string
  additionalNotes: string
}

export interface PaymentDetails {
  method: 'cash' | 'venmo' | 'zelle'
}
