export interface ICreateRental {
  gearId: string;
  startDate: string;
  endDate: string;
}

export interface IUpdateRentalStatus {
  status: string; // e.g., 'APPROVED', 'REJECTED', 'COMPLETED'
}
