import React, { useState } from 'react';
import { Target, Edit2, Check, X } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export function BudgetManager({ 
  budget, 
  onUpdate, 
  totalExpenses, 
  budgetWarnings = true 
}) {

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(budget.toString());

  const progress = Math.min((totalExpenses / budget) * 100, 100);
  const isOver = totalExpenses > budget;
  const isNearLimit = totalExpenses >= budget * 0.8;

  const handleSave = () => {
    onUpdate(parseFloat(value) || 0);
    setIsEditing(false);
  };

  return (
    <div className="card p-6">

      {/* header */}
      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Target size={20} />
          </div>

          <div>
            <h3 className="font-bold text-slate-900">Monthly Budget</h3>
            <p className="text-xs text-slate-500">Control your spending</p>
          </div>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-1">

            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-24 px-2 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              autoFocus
            />

            <button
              onClick={handleSave}
              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg"
            >
              <Check size={18} />
            </button>

            <button
              onClick={() => setIsEditing(false)}
              className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg"
            >
              <X size={18} />
            </button>

          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
          >
            <Edit2 size={16} />
          </button>
        )}
      </div>

      {/* content */}
      <div className="space-y-4">

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-1">Spent so far</p>

            <p className="text-xl font-bold text-slate-900">
              {formatCurrency(totalExpenses)}{" "}
              <span className="text-sm font-normal text-slate-400">
                / {formatCurrency(budget)}
              </span>
            </p>
          </div>

          <p className={`text-sm font-bold ${isOver ? 'text-rose-600' : 'text-indigo-600'}`}>
            {progress.toFixed(0)}%
          </p>
        </div>

        {/* progress bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isOver
                ? 'bg-rose-500'
                : progress > 80
                ? 'bg-amber-500'
                : 'bg-indigo-600'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* warnings */}
        {budgetWarnings && (
          <>
            {isOver && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
                <p className="text-xs text-rose-700 font-bold flex items-center gap-2">
                  <X size={14} />
                  Budget Exceeded: You are ₹
                  {(totalExpenses - budget).toLocaleString()} over limit.
                </p>
              </div>
            )}

            {!isOver && isNearLimit && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs text-amber-700 font-bold flex items-center gap-2">
                  <Target size={14} />
                  Budget Warning: You have used {progress.toFixed(0)}% of your limit.
                </p>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}