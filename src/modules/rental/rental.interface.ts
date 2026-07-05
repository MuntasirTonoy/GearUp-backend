export interface ICreateRental {
  gearId: string;
  startDate: string;
  endDate: string;
}

export interface IUpdateRentalStatus {
  status: 'CONFIRMED' | 'CANCELLED' | 'PICKED_UP' | 'RETURNED';
}

// Valid rental status flow
// PLACED → CONFIRMED (provider) or CANCELLED (customer/provider)
// CONFIRMED → PAID (payment)
// PAID → PICKED_UP (provider)
// PICKED_UP → RETURNED (provider)

export type RentalStatus = 'PLACED' | 'CONFIRMED' | 'CANCELLED' | 'PAID' | 'PICKED_UP' | 'RETURNED';
