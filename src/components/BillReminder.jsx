import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, Trash2, Calendar } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';

export function BillReminder({ bills, onAdd, onToggle, onDelete }) {

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title || !amount || !dueDate) return;

    onAdd({
      title,
      amount: parseFloat(amount),
      dueDate
    });

    setTitle('');
    setAmount('');
    setDueDate('');
    setIsAdding(false);
  };

  return (
    <div className="card h-full flex flex-col">

      {/* header */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-900">Bill Reminders</h2>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center hover:bg-indigo-100"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* content */}
      <div className="flex-1 overflow-y-auto p-6">

        {/* add form */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-50 rounded-xl space-y-3">

            <input
              type="text"
              placeholder="Bill Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field text-sm"
              required
            />

            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field text-sm"
                required
              />

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input-field text-sm"
                required
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="flex-1 btn-primary py-2 text-sm">
                Save Bill
              </button>

              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="btn-secondary py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* empty state */}
        {bills.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar size={24} />
            </div>
            <p className="text-sm text-slate-500">No upcoming bills</p>
          </div>
        ) : (

          /* bills list */
          <div className="space-y-3">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  bill.isPaid
                    ? 'bg-slate-50 border-transparent opacity-60'
                    : 'bg-white border-slate-100 shadow-sm'
                }`}
              >

                <button
                  onClick={() => onToggle(bill.id)}
                  className={bill.isPaid ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-500'}
                >
                  {bill.isPaid ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    bill.isPaid ? 'line-through text-slate-500' : 'text-slate-900'
                  }`}>
                    {bill.title}
                  </p>

                  <p className="text-xs text-slate-500">
                    Due {format(new Date(bill.dueDate), 'MMM dd')} • {formatCurrency(bill.amount)}
                  </p>
                </div>

                <button
                  onClick={() => onDelete(bill.id)}
                  className="p-1 text-slate-300 hover:text-rose-500"
                >
                  <Trash2 size={16} />
                </button>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}