export interface Admin {
  id: string;
  email: string;
  name: string;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  document: string;
  email?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  registrationDate: string;
  membershipType: 'MONTHLY' | 'ANNUAL';
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  isActive: boolean;
  monthlyFee: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  payments?: Payment[];
  _count?: {
    payments: number;
  };
}

export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  paymentDate: string;
  paymentType: PaymentType;
  description?: string;
  createdAt: string;
  updatedAt: string;
  member?: {
    id: string;
    firstName: string;
    lastName: string;
    document: string;
  };
}

export type PaymentType = 'MONTHLY' | 'ANNUAL' | 'REGISTRATION' | 'PENALTY' | 'OTHER';

export interface Alert {
  id: string;
  memberId: string;
  alertType: AlertType;
  message: string;
  isRead: boolean;
  alertDate: string;
  createdAt: string;
}

export type AlertType = 'PAYMENT_DUE_SOON' | 'PAYMENT_OVERDUE' | 'MEMBER_INACTIVE';

export interface Dashboard {
  stats: {
    totalMembers: number;
    activeMembers: number;
    inactiveMembers: number;
    membersWithPaymentsDue: number;
    membersWithOverduePayments: number;
    monthlyRevenue: number;
    totalPaymentsThisMonth: number;
    unreadAlerts: number;
  };
  paymentsByType: {
    type: PaymentType;
    amount: number;
    count: number;
  }[];
  alerts: {
    membersDueSoon: MemberAlert[];
    membersOverdue: MemberAlert[];
  };
  recentPayments: Payment[];
}

export interface MemberAlert {
  id: string;
  firstName: string;
  lastName: string;
  document: string;
  nextPaymentDate?: string;
  monthlyFee: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  admin: Admin;
}

export interface CreateMemberRequest {
  firstName: string;
  lastName: string;
  document: string;
  email?: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  registrationDate?: string;
  membershipType?: 'MONTHLY' | 'ANNUAL';
  monthlyFee?: number;
  notes?: string;
}

export interface UpdateMemberRequest extends CreateMemberRequest {
  isActive?: boolean;
}

export interface CreatePaymentRequest {
  memberId: string;
  amount: number;
  paymentType?: PaymentType;
  paymentDate?: string;
  description?: string;
}

export interface UpdatePaymentRequest {
  amount?: number;
  paymentType?: PaymentType;
  description?: string;
}
