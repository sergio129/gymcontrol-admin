import { apiService } from './api';
import {
  LoginRequest,
  LoginResponse,
  Admin,
  Member,
  Payment,
  Alert,
  Dashboard,
  CreateMemberRequest,
  UpdateMemberRequest,
  CreatePaymentRequest,
  UpdatePaymentRequest,
  PaginatedResponse,
} from '../types';

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>('/auth/login', credentials);
    const { token, admin } = response.data;
    
    apiService.setAuthToken(token);
    localStorage.setItem('admin', JSON.stringify(admin));
    
    return response.data;
  }

  static async verify(): Promise<{ admin: Admin }> {
    const response = await apiService.get<{ admin: Admin }>('/auth/verify');
    return response.data;
  }

  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiService.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  static logout() {
    apiService.removeAuthToken();
    window.location.href = '/login';
  }

  static getStoredAdmin(): Admin | null {
    const adminData = localStorage.getItem('admin');
    return adminData ? JSON.parse(adminData) : null;
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
}

export class MemberService {
  static async getMembers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<Member>> {
    const response = await apiService.get<{
      members: Member[];
      pagination: PaginatedResponse<Member>['pagination'];
    }>('/members', params);
    
    return {
      data: response.data.members,
      pagination: response.data.pagination,
    };
  }

  static async getMember(id: string): Promise<Member> {
    const response = await apiService.get<Member>(`/members/${id}`);
    return response.data;
  }

  static async createMember(member: CreateMemberRequest): Promise<Member> {
    const response = await apiService.post<Member>('/members', member);
    return response.data;
  }

  static async updateMember(id: string, member: UpdateMemberRequest): Promise<Member> {
    const response = await apiService.put<Member>(`/members/${id}`, member);
    return response.data;
  }

  static async deleteMember(id: string): Promise<void> {
    await apiService.delete(`/members/${id}`);
  }

  static async toggleMemberStatus(id: string): Promise<Member> {
    const response = await apiService.patch<Member>(`/members/${id}/toggle-status`);
    return response.data;
  }
}

export class PaymentService {
  static async getPayments(params?: {
    page?: number;
    limit?: number;
    memberId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<Payment>> {
    const response = await apiService.get<{
      payments: Payment[];
      pagination: PaginatedResponse<Payment>['pagination'];
    }>('/payments', params);
    
    return {
      data: response.data.payments,
      pagination: response.data.pagination,
    };
  }

  static async getPayment(id: string): Promise<Payment> {
    const response = await apiService.get<Payment>(`/payments/${id}`);
    return response.data;
  }

  static async createPayment(payment: CreatePaymentRequest): Promise<Payment> {
    const response = await apiService.post<Payment>('/payments', payment);
    return response.data;
  }

  static async updatePayment(id: string, payment: UpdatePaymentRequest): Promise<Payment> {
    const response = await apiService.put<Payment>(`/payments/${id}`, payment);
    return response.data;
  }

  static async deletePayment(id: string): Promise<void> {
    await apiService.delete(`/payments/${id}`);
  }

  static async getMonthlyReport(year: number, month?: number): Promise<{
    totalAmount: number;
    totalPayments: number;
    paymentsByType: Record<string, number>;
    payments: Payment[];
  }> {
    const response = await apiService.get('/payments/reports/monthly', { year, month });
    return response.data;
  }
}

export class AlertService {
  static async getAlerts(params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
  }): Promise<PaginatedResponse<Alert>> {
    const response = await apiService.get<{
      alerts: Alert[];
      pagination: PaginatedResponse<Alert>['pagination'];
    }>('/alerts', params);
    
    return {
      data: response.data.alerts,
      pagination: response.data.pagination,
    };
  }

  static async markAsRead(id: string): Promise<Alert> {
    const response = await apiService.patch<Alert>(`/alerts/${id}/read`);
    return response.data;
  }

  static async markAllAsRead(): Promise<{ message: string; count: number }> {
    const response = await apiService.patch<{ message: string; count: number }>('/alerts/mark-all-read');
    return response.data;
  }

  static async deleteAlert(id: string): Promise<void> {
    await apiService.delete(`/alerts/${id}`);
  }

  static async deleteReadAlerts(): Promise<{ message: string; count: number }> {
    const response = await apiService.delete<{ message: string; count: number }>('/alerts/read/all');
    return response.data;
  }

  static async getAlertsSummary(): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
  }> {
    const response = await apiService.get('/alerts/summary');
    return response.data;
  }
}

export class DashboardService {
  static async getDashboard(): Promise<Dashboard> {
    const response = await apiService.get<Dashboard>('/dashboard');
    return response.data;
  }

  static async getMonthlyStats(year: number): Promise<{
    year: number;
    monthlyStats: Array<{
      month: number;
      monthName: string;
      revenue: number;
      paymentsCount: number;
      newMembers: number;
    }>;
  }> {
    const response = await apiService.get(`/dashboard/monthly-stats/${year}`);
    return response.data;
  }
}
