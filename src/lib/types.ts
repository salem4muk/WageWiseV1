export interface Employee {
  id: string; // uuid
  name: string;
  employeeId: string; // user-provided ID
  department: string;
}

export interface ProductionLog {
  id: string; // uuid
  employeeId: string; // The Employee.id, not the user-provided one
  date: string; // ISO string
  count: number;
  containerSize: 'large' | 'small';
  processType: 'blown' | 'rolled';
  cost: number;
}

export interface SalaryPayment {
  id: string; // uuid
  employeeId: string;
  date: string; // ISO string
  amount: number;
  notes?: string;
}
