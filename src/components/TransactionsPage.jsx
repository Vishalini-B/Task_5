import React from 'react';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export function TransactionsPage({ transactions, onDelete, onAdd }) {

  const income = transactions.filter(t => t.type === 'income');
  const expenses = transactions.filter(t => t.type === 'expense');

  const TransactionTable = ({ data, title, type }) => (
    <div className="card overflow-hidden h-full">

      <div className={`p-4 border-b border-slate-100 flex items-center justify-between ${
        type === 'income' ? 'bg-emerald-50/50' : 'bg-rose-50/50'
      }`}>
        <h2 className="font-bold text-slate-900 flex items-center gap-2">

          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            type === 'income'
              ? 'bg-emerald-100 text-emerald-600'
              : 'bg-rose-100 text-rose-600'
          }`}>
            {type === 'income'
              ? <ArrowUpRight size={18} />
              : <ArrowDownLeft size={18} />}
          </div>

          {title}
        </h2>

        <span className={`text-sm font-bold ${
          type === 'income' ? 'text-emerald-600' : 'text-rose-600'
        }`}>
          {formatCurrency(data.reduce((sum, t) => sum + t.amount, 0))}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">

          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider">
              <th className="px-4 py-2 font-medium">Details</th>
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 font-medium text-right">Amount</th>
              <th className="px-4 py-2 font-medium text-right"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">

            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-slate-400 text-sm italic">
                      No {type}s recorded yet.
                    </p>
                    <button
                      onClick={onAdd}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4"
                    >
                      Add your first {type}
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">
                      {t.description || t.category}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {t.category}
                    </p>

                    {t.details && (
                      <p
                        className="text-[9px] text-slate-400 mt-0.5 italic max-w-[200px]"
                        title={t.details}
                      >
                        {t.details}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-3 text-xs text-slate-500">
                    {format(new Date(t.date), 'MMM dd')}
                  </td>

                  <td
                    className={`px-4 py-3 text-sm font-bold text-right ${
                      type === 'income'
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {type === 'income' ? '+' : '-'}
                    {formatCurrency(t.amount)}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onDelete(t.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>

                </tr>
              ))
            )}

          </tbody>
        </table>
      </div>

    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="card p-4 bg-emerald-50/30 border-emerald-100">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-1">
            Total Income
          </p>
          <h3 className="text-xl font-bold text-emerald-700">
            {formatCurrency(income.reduce((sum, t) => sum + t.amount, 0))}
          </h3>
        </div>

        <div className="card p-4 bg-rose-50/30 border-rose-100">
          <p className="text-xs font-medium text-rose-600 uppercase tracking-wider mb-1">
            Total Expenses
          </p>
          <h3 className="text-xl font-bold text-rose-700">
            {formatCurrency(expenses.reduce((sum, t) => sum + t.amount, 0))}
          </h3>
        </div>

        <div className="card p-4 bg-indigo-50/30 border-indigo-100">
          <p className="text-xs font-medium text-indigo-600 uppercase tracking-wider mb-1">
            Net Balance
          </p>
          <h3 className="text-xl font-bold text-indigo-700">
            {formatCurrency(
              income.reduce((sum, t) => sum + t.amount, 0) -
              expenses.reduce((sum, t) => sum + t.amount, 0)
            )}
          </h3>
        </div>

      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">
          All Transactions
        </h2>

        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-slate-600">Income</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            <span className="text-slate-600">Expenses</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <TransactionTable
          data={income}
          title="Income History"
          type="income"
        />
        <TransactionTable
          data={expenses}
          title="Expense History"
          type="expense"
        />
      </div>

    </div>
  );
}