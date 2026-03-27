import React from 'react';
import { Charts } from './Charts';
import { formatCurrency } from '../lib/utils';
import { format, subMonths, eachMonthOfInterval, isSameMonth } from 'date-fns';
import { PieChart, BarChart, TrendingUp } from 'lucide-react';

export function AnalyticsPage({ transactions }) {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 
    ? ((totalIncome - totalExpenses) / totalIncome) * 100 
    : 0;

  const last6Months = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end: new Date(),
  });

  const monthlyData = last6Months.map(month => {
    const income = transactions
      .filter(t => t.type === 'income' && isSameMonth(new Date(t.date), month))
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense' && isSameMonth(new Date(t.date), month))
      .reduce((sum, t) => sum + t.amount, 0);

    return { month, income, expenses, balance: income - expenses };
  });

  const topCategories = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const sortedCategories = Object.entries(topCategories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4 bg-emerald-50/30 border-emerald-100">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-1">Total Income</p>
          <h3 className="text-xl font-bold text-emerald-700">{formatCurrency(totalIncome)}</h3>
        </div>

        <div className="card p-4 bg-rose-50/30 border-rose-100">
          <p className="text-xs font-medium text-rose-600 uppercase tracking-wider mb-1">Total Expenses</p>
          <h3 className="text-xl font-bold text-rose-700">{formatCurrency(totalExpenses)}</h3>
        </div>

        <div className="card p-4 bg-indigo-50/30 border-indigo-100">
          <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider mb-1">Net Balance</p>
          <h3 className="text-xl font-bold text-indigo-700">{formatCurrency(balance)}</h3>
        </div>

        <div className="card p-4 bg-amber-50/30 border-amber-100">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wider mb-1">Savings Rate</p>
          <h3 className="text-xl font-bold text-amber-700">{savingsRate.toFixed(1)}%</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Charts transactions={transactions} />

          <div className="card p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BarChart className="text-indigo-600" size={20} />
              Monthly Performance
            </h3>

            <div className="space-y-4">
              {monthlyData.map(({ month, income, expenses, balance }) => (
                <div key={month.toString()} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="w-16 font-bold text-slate-500 text-sm">
                    {format(month, 'MMM yyyy')}
                  </div>

                  <div className="flex-1 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Income</p>
                      <p className="text-sm font-bold text-emerald-600">{formatCurrency(income)}</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Expenses</p>
                      <p className="text-sm font-bold text-rose-600">{formatCurrency(expenses)}</p>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Net</p>
                      <p className={`text-sm font-bold ${balance >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                        {formatCurrency(balance)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <PieChart className="text-indigo-600" size={20} />
              Top Spending Categories
            </h3>

            <div className="space-y-4">
              {sortedCategories.length === 0 ? (
                <p className="text-center py-8 text-slate-400 text-sm italic">
                  No expense data yet.
                </p>
              ) : (
                sortedCategories.map(([category, amount]) => {
                  const percentage = (amount / totalExpenses) * 100;

                  return (
                    <div key={category} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{category}</span>
                        <span className="font-bold text-slate-900">{formatCurrency(amount)}</span>
                      </div>

                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>

                      <p className="text-[10px] text-slate-400 text-right">
                        {percentage.toFixed(1)}% of total expenses
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="card p-6 bg-indigo-600 text-white">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={20} />
              Financial Health
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <p className="text-xs text-indigo-100 uppercase font-bold mb-1">
                  Monthly Average Spending
                </p>
                <p className="text-xl font-bold">
                  {formatCurrency(totalExpenses / 6)}
                </p>
              </div>

              <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <p className="text-xs text-indigo-100 uppercase font-bold mb-1">
                  Estimated Yearly Savings
                </p>
                <p className="text-xl font-bold">
                  {formatCurrency(balance * 12)}
                </p>
              </div>

              <p className="text-xs text-indigo-100 italic">
                * Based on your current 6-month average performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}