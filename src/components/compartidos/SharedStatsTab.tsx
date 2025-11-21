/**
 * Tab de Estadísticas del grupo con gráficos
 */

import { useState, useEffect, useMemo } from 'react';
import { SharedService } from '@services/shared';
import type { GroupStats, GroupInsight, SharedBudget, SharedExpense } from '@app-types/shared';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Lightbulb, TrendingUp, Users, Receipt } from 'lucide-react';

interface Props {
  groupId: string;
  stats: GroupStats | null;
  budgets: SharedBudget[];
  expenses: SharedExpense[];
  groupColor?: string;
  currencySymbol: string;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

export default function SharedStatsTab({
  groupId,
  stats,
  budgets,
  expenses,
  currencySymbol,
}: Props) {
  const [insights, setInsights] = useState<GroupInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Calcular estadísticas locales
  const localStats = useMemo(() => {
    const totalBudget = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);
    const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const avgExpense = expenses.length > 0 ? totalSpent / expenses.length : 0;

    // Agrupar gastos por categoría
    const categoryMap = new Map<string, number>();
    expenses.forEach(e => {
      const cat = e.category || 'Sin categoría';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + e.amount);
    });

    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalBudget,
      totalSpent,
      remaining: totalBudget - totalSpent,
      transactionsCount: budgets.length + expenses.length,
      avgExpenseAmount: avgExpense,
      categoryBreakdown,
    };
  }, [budgets, expenses]);

  useEffect(() => {
    loadInsights();
  }, [groupId]);

  const loadInsights = async () => {
    setLoadingInsights(true);
    try {
      const data = await SharedService.getInsights(groupId);
      setInsights(data);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };

  // Prepare data for charts
  const memberChartData = (stats?.memberStats || []).map((member, index) => ({
    name: (member.name || 'Usuario').split(' ')[0], // First name only
    value: member.contributed || 0,
    color: COLORS[index % COLORS.length],
  }));

  // Use local category breakdown if API stats not available
  const categoryChartData = (stats?.categoryBreakdown || localStats.categoryBreakdown).map((cat, index) => ({
    name: cat.category || 'Sin categoría',
    amount: cat.amount || 0,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Receipt className="h-4 w-4" />
            <span className="text-xs">Transacciones</span>
          </div>
          <p className="text-2xl font-bold">{localStats.transactionsCount}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">Promedio</span>
          </div>
          <p className="text-2xl font-bold">
            {currencySymbol} {localStats.avgExpenseAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Budget Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Aportado</p>
          <p className="text-sm font-bold text-green-600">
            {currencySymbol} {localStats.totalBudget.toLocaleString()}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Gastado</p>
          <p className="text-sm font-bold text-red-600">
            {currencySymbol} {localStats.totalSpent.toLocaleString()}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Disponible</p>
          <p className={`text-sm font-bold ${localStats.remaining >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {currencySymbol} {localStats.remaining.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Contributions by Member (Pie Chart) */}
      {memberChartData.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Aportes por persona
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={memberChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {memberChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${currencySymbol} ${value.toLocaleString()}`, 'Aportó']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {memberChartData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5 text-xs">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span>{entry.name}</span>
                <span className="text-muted-foreground">
                  ({localStats.totalBudget ? Math.round((entry.value / localStats.totalBudget) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses by Category (Bar Chart) */}
      {categoryChartData.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h4 className="font-medium mb-4">Gastos por categoría</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value: number) => [`${currencySymbol} ${value.toLocaleString()}`, 'Gastado']}
                />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Consejos IA
          </h4>
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border ${
                insight.type === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : insight.type === 'success'
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-primary/10 border-primary/30'
              }`}
            >
              <p className="font-medium text-sm">{insight.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{insight.message}</p>
            </div>
          ))}
        </div>
      )}

      {loadingInsights && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          Cargando consejos...
        </div>
      )}
    </div>
  );
}
