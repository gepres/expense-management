/**
 * Types for Shared Expenses feature
 */

// ============================================================================
// SHARED GROUP
// ============================================================================

export interface SharedMember {
  odId: string;
  email: string;
  name: string;
  photoURL?: string;
  role: 'creator' | 'member';
  joinedAt: Date;
}

export interface SharedExpenseGroup {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  createdBy: string;
  creatorName?: string;
  members: SharedMember[] | string[];
  targetAmount?: number;
  currency: string;
  status?: 'active' | 'completed' | 'archived';
  invitationToken?: string;
  invitationLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSharedGroupDto {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  targetAmount?: number;
  currency: string;
}

export interface UpdateSharedGroupDto {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  targetAmount?: number;
  status?: 'active' | 'completed' | 'archived';
}

// ============================================================================
// SHARED BUDGET (Aportes/Contribuciones)
// ============================================================================

export interface SharedBudget {
  id: string;
  groupId: string;
  odId: string;
  userName: string;
  userPhoto?: string;
  amount: number;
  description: string;
  paymentMethod?: string;
  type: 'contribution' | 'budget';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSharedBudgetDto {
  amount: number;
  description: string;
  paymentMethod?: string;
  type: 'contribution' | 'budget';
}

export interface UpdateSharedBudgetDto {
  amount?: number;
  description?: string;
  paymentMethod?: string;
}

// ============================================================================
// SHARED EXPENSE (Gastos del grupo)
// ============================================================================

export interface SharedExpense {
  id: string;
  groupId: string;
  odId: string;
  userName: string;
  userPhoto?: string;
  amount: number;
  description: string;
  category?: string;
  subcategory?: string;
  paymentMethod?: string;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSharedExpenseDto {
  amount: number;
  description: string;
  category?: string;
  subcategory?: string;
  paymentMethod?: string;
  date?: string;
  receiptUrl?: string;
}

export interface UpdateSharedExpenseDto {
  amount?: number;
  description?: string;
  category?: string;
  subcategory?: string;
  paymentMethod?: string;
  receiptUrl?: string;
}

// ============================================================================
// INVITATIONS
// ============================================================================

export interface GroupInvitation {
  id: string;
  groupId: string;
  groupName: string;
  createdBy: string;
  creatorName: string;
  token: string;
  type: 'single' | 'multiple';
  maxUses?: number;
  currentUses: number;
  expiresAt: Date;
  status: 'active' | 'expired' | 'revoked';
  createdAt: Date;
}

export interface CreateInvitationDto {
  type?: 'single' | 'multiple';
  maxUses?: number;
  expiresInDays?: number;
}

export interface InvitePreview {
  valid: boolean;
  groupName: string;
  groupIcon?: string;
  groupColor?: string;
  creatorName: string;
  membersCount: number;
  expiresAt: string;
}

// ============================================================================
// ACTIVITY LOG
// ============================================================================

export type ActivityAction =
  | 'joined'
  | 'left'
  | 'added_budget'
  | 'added_expense'
  | 'updated_budget'
  | 'updated_expense'
  | 'deleted_budget'
  | 'deleted_expense'
  | 'member_removed'
  | 'group_updated';

export interface ActivityLog {
  id: string;
  groupId: string;
  odId: string;
  userName: string;
  userPhoto?: string;
  action: ActivityAction;
  details: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// ============================================================================
// STATISTICS
// ============================================================================

export interface MemberStats {
  odId: string;
  name: string;
  photoURL?: string;
  contributed: number;
  spent: number;
  balance: number; // + debe recibir, - debe pagar
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percent: number;
  count: number;
}

export interface GroupStats {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentUsed: number;
  memberStats: MemberStats[];
  categoryBreakdown: CategoryBreakdown[];
  transactionsCount: number;
  avgExpenseAmount: number;
}

export interface Settlement {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
}

export interface SettlementResponse {
  settlements: Settlement[];
  isBalanced: boolean;
}

// ============================================================================
// AI INSIGHTS
// ============================================================================

export interface GroupInsight {
  type: 'tip' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  priority: number;
}

// ============================================================================
// SHARED CATEGORIES (default for shared expenses)
// ============================================================================

export const SHARED_CATEGORIES = [
  'Decoración',
  'Comida',
  'Bebidas',
  'Regalos',
  'Transporte',
  'Entretenimiento',
  'Alojamiento',
  'Servicios',
  'Otros',
] as const;

export type SharedCategory = (typeof SHARED_CATEGORIES)[number];
