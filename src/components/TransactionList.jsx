import React from 'react';
import { Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';

export function TransactionList({ transactions, onDelete }) {

  if (transactions.length === 0) {
    return (
      <div className="card p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
          <ArrowUpRight size={32} />
        </div>
        <h3 className="text-lg font-semibold text-slate-900">
          No transactions yet
        </h3>
        <p className="text-slate-500 max-w-xs">
          Start tracking your finances by adding your first income or expense.
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">

      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">
          Recent Transactions
        </h2>
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">

          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-3 font-medium">Transaction</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Amount</th>
              <th className="px-6 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {transactions.map((t) => (
              <tr
                key={t.id}
                className="hover:bg-slate-50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">

                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        t.type === 'income'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {t.type === 'income' ? (
                        <ArrowUpRight size={16} />
                      ) : (
                        <ArrowDownLeft size={16} />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {t.description || t.category}
                      </p>
                      <p className="text-xs text-slate-500">
                        {t.type === 'income' ? 'Received' : 'Paid'}
                      </p>

                      {t.details && (
                        <p
                          className="text-[10px] text-slate-400 mt-1 italic max-w-[200px] truncate"
                          title={t.details}
                        >
                          {t.details}
                        </p>
                      )}
                    </div>

                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                    {t.category}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm text-slate-500">
                  {format(new Date(t.date), 'MMM dd, yyyy')}
                </td>

                <td
                  className={`px-6 py-4 text-sm font-bold ${
                    t.type === 'income'
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }`}
                >
                  {t.type === 'income' ? '+' : '-'}
                  {formatCurrency(t.amount)}
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onDelete(t.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>

    </div>
  );
}