/**
 * SharedExpensesContext - Estado global para gastos compartidos
 *
 * Maneja grupos, notificaciones y estado de carga
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { SharedService } from '@services/shared';
import type { SharedExpenseGroup, ActivityLog } from '@types/shared';
import toast from 'react-hot-toast';

// ============================================================================
// TYPES
// ============================================================================

interface SharedNotification {
  id: string;
  groupId: string;
  groupName: string;
  type: 'budget_added' | 'expense_added' | 'member_joined' | 'member_left';
  message: string;
  userName: string;
  amount?: number;
  timestamp: Date;
  read: boolean;
}

interface SharedExpensesContextType {
  // Data
  groups: SharedExpenseGroup[];
  notifications: SharedNotification[];
  unreadCount: number;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  reloadGroups: () => Promise<void>;
  addNotification: (notification: Omit<SharedNotification, 'id' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const SharedExpensesContext = createContext<SharedExpensesContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface SharedExpensesProviderProps {
  children: ReactNode;
}

export function SharedExpensesProvider({ children }: SharedExpensesProviderProps) {
  const { usuario } = useAuth();

  // State
  const [groups, setGroups] = useState<SharedExpenseGroup[]>([]);
  const [notifications, setNotifications] = useState<SharedNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load notifications from localStorage
  useEffect(() => {
    if (usuario) {
      const stored = localStorage.getItem(`shared_notifications_${usuario.id}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setNotifications(parsed.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          })));
        } catch {
          setNotifications([]);
        }
      }
    } else {
      setNotifications([]);
    }
  }, [usuario]);

  // Save notifications to localStorage
  useEffect(() => {
    if (usuario && notifications.length > 0) {
      localStorage.setItem(
        `shared_notifications_${usuario.id}`,
        JSON.stringify(notifications)
      );
    }
  }, [notifications, usuario]);

  // ============================================================================
  // FUNCTIONS
  // ============================================================================

  const reloadGroups = useCallback(async () => {
    if (!usuario) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await SharedService.getGroups();
      setGroups(data);
    } catch (err) {
      console.error('[SharedExpensesContext] Error loading groups:', err);
      setError('Error al cargar grupos compartidos');
      setGroups([]);
    } finally {
      setIsLoading(false);
    }
  }, [usuario]);

  // Load groups when user authenticates
  useEffect(() => {
    if (usuario) {
      reloadGroups();
    } else {
      setGroups([]);
    }
  }, [usuario, reloadGroups]);

  // Add notification
  const addNotification = useCallback((notification: Omit<SharedNotification, 'id' | 'read'>) => {
    const newNotification: SharedNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50

    // Show toast
    const icon = notification.type === 'budget_added' ? '💰' :
                 notification.type === 'expense_added' ? '🛒' :
                 notification.type === 'member_joined' ? '👋' : '👤';

    toast(notification.message, {
      icon,
      duration: 4000,
    });
  }, []);

  // Mark notification as read
  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  // Mark all as read
  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    if (usuario) {
      localStorage.removeItem(`shared_notifications_${usuario.id}`);
    }
  }, [usuario]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: SharedExpensesContextType = {
    groups,
    notifications,
    unreadCount,
    isLoading,
    error,
    reloadGroups,
    addNotification,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  };

  return (
    <SharedExpensesContext.Provider value={value}>
      {children}
    </SharedExpensesContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useSharedExpenses() {
  const context = useContext(SharedExpensesContext);
  if (!context) {
    throw new Error('useSharedExpenses must be used within SharedExpensesProvider');
  }
  return context;
}

// ============================================================================
// NOTIFICATION HELPERS
// ============================================================================

export function createBudgetNotification(
  groupId: string,
  groupName: string,
  userName: string,
  amount: number,
  currencySymbol: string
): Omit<SharedNotification, 'id' | 'read'> {
  return {
    groupId,
    groupName,
    type: 'budget_added',
    message: `${userName} aportó ${currencySymbol} ${amount.toLocaleString()} en "${groupName}"`,
    userName,
    amount,
    timestamp: new Date(),
  };
}

export function createExpenseNotification(
  groupId: string,
  groupName: string,
  userName: string,
  amount: number,
  currencySymbol: string,
  description: string
): Omit<SharedNotification, 'id' | 'read'> {
  return {
    groupId,
    groupName,
    type: 'expense_added',
    message: `${userName} gastó ${currencySymbol} ${amount.toLocaleString()} en ${description} - "${groupName}"`,
    userName,
    amount,
    timestamp: new Date(),
  };
}

export function createMemberJoinedNotification(
  groupId: string,
  groupName: string,
  userName: string
): Omit<SharedNotification, 'id' | 'read'> {
  return {
    groupId,
    groupName,
    type: 'member_joined',
    message: `${userName} se unió a "${groupName}"`,
    userName,
    timestamp: new Date(),
  };
}

export function createMemberLeftNotification(
  groupId: string,
  groupName: string,
  userName: string
): Omit<SharedNotification, 'id' | 'read'> {
  return {
    groupId,
    groupName,
    type: 'member_left',
    message: `${userName} salió de "${groupName}"`,
    userName,
    timestamp: new Date(),
  };
}
