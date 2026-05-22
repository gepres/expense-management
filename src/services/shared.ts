/**
 * Service for Shared Expenses API calls
 */

import { getAuth } from 'firebase/auth';
import type {
  SharedExpenseGroup,
  CreateSharedGroupDto,
  UpdateSharedGroupDto,
  SharedBudget,
  CreateSharedBudgetDto,
  UpdateSharedBudgetDto,
  SharedExpense,
  CreateSharedExpenseDto,
  UpdateSharedExpenseDto,
  GroupInvitation,
  CreateInvitationDto,
  InvitePreview,
  ActivityLog,
  GroupStats,
  SettlementResponse,
  GroupInsight,
  ExtractReceiptRequest,
  ExtractedReceipt,
} from '@app-types/shared';

export class ProRequiredError extends Error {
  constructor(message = 'Esta función requiere una cuenta PRO') {
    super(message);
    this.name = 'ProRequiredError';
  }
}

export class AiQuotaExceededError extends Error {
  readonly resetAt?: string;
  constructor(message = 'Alcanzaste tu límite mensual de IA', resetAt?: string) {
    super(message);
    this.name = 'AiQuotaExceededError';
    this.resetAt = resetAt;
  }
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const getHeaders = async () => {
  const auth = getAuth();
  const token = await auth.currentUser?.getIdToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const SharedService = {
  // ============================================================================
  // GROUPS
  // ============================================================================

  async getGroups(): Promise<SharedExpenseGroup[]> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/shared-groups`, { headers });
    if (!response.ok) throw new Error('Error fetching shared groups');
    return response.json();
  },

  async getGroup(id: string): Promise<SharedExpenseGroup> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/shared-groups/${id}`, { headers });
    if (!response.ok) throw new Error('Error fetching shared group');
    return response.json();
  },

  async createGroup(data: CreateSharedGroupDto): Promise<SharedExpenseGroup> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/shared-groups`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error creating shared group');
    return response.json();
  },

  async updateGroup(id: string, data: UpdateSharedGroupDto): Promise<SharedExpenseGroup> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/shared-groups/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error updating shared group');
    return response.json();
  },

  async deleteGroup(id: string): Promise<void> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/shared-groups/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Error deleting shared group');
  },

  // ============================================================================
  // MEMBERS
  // ============================================================================

  async removeMember(groupId: string, odId: string): Promise<void> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/shared-groups/${groupId}/members/${odId}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Error removing member');
  },

  async leaveGroup(groupId: string): Promise<void> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/shared-groups/${groupId}/leave`, {
      method: 'POST',
      headers,
    });
    if (!response.ok) throw new Error('Error leaving group');
  },

  // ============================================================================
  // BUDGETS (Aportes)
  // ============================================================================

  async getBudgets(groupId: string): Promise<SharedBudget[]> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/shared-groups/${groupId}/budgets`, { headers });
    if (!response.ok) throw new Error('Error fetching budgets');
    return response.json();
  },

  async createBudget(groupId: string, data: CreateSharedBudgetDto): Promise<SharedBudget> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/shared-groups/${groupId}/budgets`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error creating budget');
    return response.json();
  },

  async updateBudget(groupId: string, budgetId: string, data: UpdateSharedBudgetDto): Promise<SharedBudget> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/shared-groups/${groupId}/budgets/${budgetId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error updating budget');
    return response.json();
  },

  async deleteBudget(groupId: string, budgetId: string): Promise<void> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/shared-groups/${groupId}/budgets/${budgetId}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Error deleting budget');
  },

  // ============================================================================
  // EXPENSES (Gastos)
  // ============================================================================

  async getExpenses(groupId: string): Promise<SharedExpense[]> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/shared-groups/${groupId}/expenses`, { headers });
    if (!response.ok) throw new Error('Error fetching expenses');
    return response.json();
  },

  async createExpense(groupId: string, data: CreateSharedExpenseDto): Promise<SharedExpense> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/shared-groups/${groupId}/expenses`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error creating expense');
    return response.json();
  },

  async updateExpense(groupId: string, expenseId: string, data: UpdateSharedExpenseDto): Promise<SharedExpense> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/shared-groups/${groupId}/expenses/${expenseId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error updating expense');
    return response.json();
  },

  async deleteExpense(groupId: string, expenseId: string): Promise<void> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/shared-groups/${groupId}/expenses/${expenseId}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Error deleting expense');
  },

  // ============================================================================
  // RECEIPT EXTRACTION (PRO)
  // ============================================================================

  async extractReceipt(
    groupId: string,
    body: ExtractReceiptRequest,
  ): Promise<ExtractedReceipt> {
    const headers = await getHeaders();
    const response = await fetch(
      `${API_URL}/shared-groups/${groupId}/extract-receipt`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      },
    );

    if (response.status === 403) {
      throw new ProRequiredError();
    }
    if (response.status === 429) {
      const data = await response.json().catch(() => ({}));
      throw new AiQuotaExceededError(
        data?.message || 'Cuota IA mensual excedida',
        data?.resetAt,
      );
    }
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.message || 'Error al extraer datos del comprobante');
    }
    return response.json();
  },

  // ============================================================================
  // INVITATIONS
  // ============================================================================

  async getInvitations(groupId: string): Promise<GroupInvitation[]> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/shared-groups/${groupId}/invitations`, { headers });
    if (!response.ok) throw new Error('Error fetching invitations');
    return response.json();
  },

  async createInvitation(groupId: string, data?: CreateInvitationDto): Promise<{ invitation: GroupInvitation; link: string }> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/shared-groups/${groupId}/invitations`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data || {}),
    });
    if (!response.ok) throw new Error('Error creating invitation');
    return response.json();
  },

  async verifyInvitation(token: string): Promise<InvitePreview> {
    const response = await fetch(`${API_URL}/shared-groups/invitations/${token}/verify`);
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Invitación no válida');
    }
    return response.json();
  },

  async acceptInvitation(token: string): Promise<{ success: boolean; groupId: string; groupName: string; message: string }> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/shared-groups/invitations/${token}/accept`, {
      method: 'POST',
      headers,
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Error al aceptar invitación');
    }
    return response.json();
  },

  async revokeInvitation(groupId: string, invitationId: string): Promise<void> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/shared-groups/${groupId}/invitations/${invitationId}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) throw new Error('Error revoking invitation');
  },

  // ============================================================================
  // ACTIVITY
  // ============================================================================

  async getActivity(groupId: string, limit?: number): Promise<ActivityLog[]> {
    const headers = await getHeaders();
    const url = limit
      ? `${API_URL}/shared-groups/${groupId}/activity?limit=${limit}`
      : `${API_URL}/shared-groups/${groupId}/activity`;
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error('Error fetching activity');
    return response.json();
  },

  // ============================================================================
  // STATISTICS & AI
  // ============================================================================

  async getStats(groupId: string): Promise<GroupStats> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/shared-groups/${groupId}/stats`, { headers });
    if (!response.ok) throw new Error('Error fetching stats');
    return response.json();
  },

  async getSettlement(groupId: string): Promise<SettlementResponse> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/shared-groups/${groupId}/settlement`, { headers });
    if (!response.ok) throw new Error('Error fetching settlement');
    return response.json();
  },

  async getInsights(groupId: string): Promise<GroupInsight[]> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/shared-groups/${groupId}/insights`, { headers });
    if (!response.ok) throw new Error('Error fetching insights');
    return response.json();
  },

  // ============================================================================
  // EXPORT
  // ============================================================================

  async exportGroup(groupId: string, format: 'json' | 'excel'): Promise<void> {
    const headers = await getHeaders();
    const response = await fetch(`${API_URL}/shared-groups/${groupId}/export?format=${format}`, {
      headers,
    });

    if (!response.ok) throw new Error('Error exporting group');

    if (format === 'json') {
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grupo_${groupId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gastos_grupo_${groupId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  },
};
