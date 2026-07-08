import { RentalStatus } from '@prisma/client';

export interface ICreateRental {
  gearId: string;
  startDate: string;
  endDate: string;
}

export interface IUpdateRentalStatus {
  status: RentalStatus;
}

// Valid rental status flow
// PLACED → CANCELLED (customer/provider) or PICKED_UP (provider)
// PICKED_UP → RETURNED (provider)


