export interface ICreateProvider {
  businessName: string;
  description: string;
  address: string;
}

export interface IUpdateProvider {
  businessName?: string;
  description?: string;
  address?: string;
}
