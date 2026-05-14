"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";

interface Expense {
  id: string;
  type: string;
  amount: number;
  date: string;
  is_rd_related: boolean;
  description: string;
}

interface ExpenseChartsProps {
  expenses: Expense[];
}

export function ExpenseCharts({ expenses }: ExpenseChartsProps) {
  // Process data for time series chart
  const timeSeriesData = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];

    // Group expenses by month
    const monthlyData = expenses.reduce((acc, expense) => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          rdExpenses: 0,
          nonRdExpenses: 0,
          total: 0,
        };
      }

      if (expense.is_rd_related) {
        acc[monthKey].rdExpenses += expense.amount;
      } else {
        acc[monthKey].nonRdExpenses += expense.amount;
      }
      acc[monthKey].total += expense.amount;

      return acc;
    }, {} as Record<string, { month: string; rdExpenses: number; nonRdExpenses: number; total: number }>);

    // Convert to array and sort by month
    return Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((item) => ({
        ...item,
        monthLabel: new Date(item.month + "-01").toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
      }));
  }, [expenses]);

  // Process data for expense type breakdown
  const expenseTypeData = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];

    const typeData = expenses.reduce((acc, expense) => {
      const type = expense.type.charAt(0).toUpperCase() + expense.type.slice(1);
      
      if (!acc[type]) {
        acc[type] = {
          type,
          rdAmount: 0,
          nonRdAmount: 0,
          total: 0,
        };
      }

      if (expense.is_rd_related) {
        acc[type].rdAmount += expense.amount;
      } else {
        acc[type].nonRdAmount += expense.amount;
      }
      acc[type].total += expense.amount;

      return acc;
    }, {} as Record<string, { type: string; rdAmount: number; nonRdAmount: number; total: number }>);

    return Object.values(typeData).sort((a, b) => b.total - a.total);
  }, [expenses]);

  // Process data for pie chart
  const pieData = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];

    const rdTotal = expenses
      .filter((e) => e.is_rd_related)
      .reduce((sum, e) => sum + e.amount, 0);
    const nonRdTotal = expenses
      .filter((e) => !e.is_rd_related)
      .reduce((sum, e) => sum + e.amount, 0);

    return [
      { name: "R&D Expenses", value: rdTotal, color: "#10b981" },
      { name: "Non-R&D Expenses", value: nonRdTotal, color: "#64748b" },
    ];
  }, [expenses]);

  const totalRdExpenses = pieData.find((d) => d.name === "R&D Expenses")?.value || 0;
  const totalNonRdExpenses = pieData.find((d) => d.name === "Non-R&D Expenses")?.value || 0;
  const rdPercentage = totalRdExpenses + totalNonRdExpenses > 0
    ? ((totalRdExpenses / (totalRdExpenses + totalNonRdExpenses)) * 100).toFixed(1)
    : 0;

  if (!expenses || expenses.length === 0) {
    return (
      <Card className="bg-slate-900/50 border-slate-700 p-12 text-center">
        <p className="text-slate-400">No expense data available. Add expenses to see charts.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Time Series Chart */}
      <Card className="bg-slate-900/50 border-slate-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-xl font-bold text-white mb-4 sm:mb-6">Expenses Over Time</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={timeSeriesData}>
            <defs>
              <linearGradient id="colorRd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorNonRd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="monthLabel" stroke="#94a3b8" style={{ fontSize: "11px" }} />
            <YAxis stroke="#94a3b8" style={{ fontSize: "11px" }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
              formatter={(value: any) => `$${Number(value ?? 0).toLocaleString()}`}
            />
            <Legend wrapperStyle={{ paddingTop: "16px", fontSize: "12px" }} iconType="circle" />
            <Area type="monotone" dataKey="rdExpenses" name="R&D Expenses" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRd)" />
            <Area type="monotone" dataKey="nonRdExpenses" name="Non-R&D Expenses" stroke="#64748b" strokeWidth={2} fillOpacity={1} fill="url(#colorNonRd)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Expense Type Breakdown */}
        <Card className="bg-slate-900/50 border-slate-700 p-4 sm:p-6">
          <h3 className="text-base sm:text-xl font-bold text-white mb-4 sm:mb-6">Expenses by Type</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={expenseTypeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="type" stroke="#94a3b8" style={{ fontSize: "11px" }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: "11px" }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                formatter={(value: any) => `$${Number(value ?? 0).toLocaleString()}`}
              />
              <Legend wrapperStyle={{ paddingTop: "16px", fontSize: "12px" }} iconType="circle" />
              <Bar dataKey="rdAmount" name="R&D" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="nonRdAmount" name="Non-R&D" fill="#64748b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart */}
        <Card className="bg-slate-900/50 border-slate-700 p-4 sm:p-6">
          <h3 className="text-base sm:text-xl font-bold text-white mb-4 sm:mb-6">R&D vs Non-R&D Split</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                  formatter={(value: any) => `$${Number(value ?? 0).toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="text-center p-2.5 sm:p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <p className="text-xs text-slate-400 mb-1">R&D Expenses</p>
              <p className="text-lg sm:text-2xl font-bold text-emerald-400">${totalRdExpenses.toLocaleString()}</p>
              <p className="text-xs text-emerald-400 mt-1">{rdPercentage}% of total</p>
            </div>
            <div className="text-center p-2.5 sm:p-3 rounded-lg bg-slate-700/30 border border-slate-600">
              <p className="text-xs text-slate-400 mb-1">Non-R&D</p>
              <p className="text-lg sm:text-2xl font-bold text-slate-400">${totalNonRdExpenses.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">{(100 - Number(rdPercentage)).toFixed(1)}% of total</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
