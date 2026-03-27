import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export function SummaryCards({ totalIncome, totalExpenses, balance, budget }) {

  const isOverBudget = totalExpenses > budget;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
        </div>
        <p className="text-sm text-slate-500 mb-1">Total Income</p>
        <h3 className="text-2xl font-bold text-slate-900">
          {formatCurrency(totalIncome)}
        </h3>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
            <TrendingDown size={20} />
          </div>
          <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-full">+5%</span>
        </div>
        <p className="text-sm text-slate-500 mb-1">Total Expenses</p>
        <h3 className="text-2xl font-bold text-slate-900">
          {formatCurrency(totalExpenses)}
        </h3>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Wallet size={20} />
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-1">Total Balance</p>
        <h3 className="text-2xl font-bold text-slate-900">
          {formatCurrency(balance)}
        </h3>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Target size={20} />
          </div>

          {isOverBudget && (
            <span className="text-[10px] font-bold text-white bg-rose-500 px-2 py-1 rounded-full uppercase tracking-wider animate-pulse">
              Over Budget
            </span>
          )}
        </div>

        <p className="text-sm text-slate-500 mb-1">Monthly Budget</p>
        <h3 className="text-2xl font-bold text-slate-900">
          {formatCurrency(budget)}
        </h3>
      </div>

    </div>
  );
}