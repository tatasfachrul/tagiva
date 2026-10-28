import type { CustomerRow } from '@/types/database';

export type Client = CustomerRow;

export interface ClientFormData {
  id?: string;
  name: string;
  company?: string;
  email?: string;
  address?: string;
}
