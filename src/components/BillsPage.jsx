import React from 'react';
import { BillReminder } from './BillReminder';
import { formatCurrency } from '../lib/utils';
import { format, isBefore, addDays } from 'date-fns';
import { Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';

export function BillsPage({ bills, onAdd, onToggle, onDelete }) {

  const upcomingBills = bills
    .filter(b => !b.isPaid)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const paidBills = bills
    .filter(b => b.isPaid)
    .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));

  const totalUpcoming = upcomingBills.reduce((sum, b) => sum + b.amount, 0);

  const overdueCount = upcomingBills.filter(b =>
    isBefore(new Date(b.dueDate), new Date())
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="card p-4 bg-amber-50/30 border-amber-100">
          <p className="text-xs font-medium text-amber-600 uppercase mb-1">Upcoming Bills</p>
          <h3 className="text-xl font-bold text-amber-700">
            {formatCurrency(totalUpcoming)}
          </h3>
        </div>

        <div className="card p-4 bg-rose-50/30 border-rose-100">
          <p className="text-xs font-medium text-rose-600 uppercase mb-1">Overdue</p>
          <h3 className="text-xl font-bold text-rose-700">
            {overdueCount} Bills
          </h3>
        </div>

        <div className="card p-4 bg-emerald-50/30 border-emerald-100">
          <p className="text-xs font-medium text-emerald-600 uppercase mb-1">Paid This Month</p>
          <h3 className="text-xl font-bold text-emerald-700">
            {paidBills.length} Bills
          </h3>
        </div>

      </div>

      {/* main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* left side */}
        <div className="lg:col-span-1">
          <BillReminder
            bills={bills}
            onAdd={onAdd}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        </div>

        {/* right side */}
        <div className="lg:col-span-2 space-y-6">

          {/* calendar view */}
          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Calendar className="text-indigo-600" size={20} />
              Bill Calendar View
            </h3>

            <div className="space-y-4">
              {upcomingBills.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed">
                  <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={32} />
                  <p className="text-slate-600 font-medium">All caught up!</p>
                  <p className="text-slate-400 text-sm">No upcoming bills.</p>
                </div>
              ) : (
                upcomingBills.map(bill => {
                  const isOverdue = isBefore(new Date(bill.dueDate), new Date());
                  const isDueSoon =
                    !isOverdue &&
                    isBefore(new Date(bill.dueDate), addDays(new Date(), 3));

                  return (
                    <div
                      key={bill.id}
                      className="flex items-center gap-4 p-4 rounded-xl border hover:border-indigo-100"
                    >

                      {/* date box */}
                      <div
                        className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center text-xs font-bold ${
                          isOverdue
                            ? 'bg-rose-100 text-rose-600'
                            : isDueSoon
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <span>{format(new Date(bill.dueDate), 'MMM')}</span>
                        <span className="text-lg">{format(new Date(bill.dueDate), 'dd')}</span>
                      </div>

                      {/* details */}
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900">{bill.title}</h4>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-600">
                            {formatCurrency(bill.amount)}
                          </span>

                          {isOverdue && (
                            <span className="flex items-center gap-1 text-xs font-bold text-rose-600">
                              <AlertCircle size={10} /> Overdue
                            </span>
                          )}

                          {isDueSoon && (
                            <span className="text-xs font-bold text-amber-600">
                              Due Soon
                            </span>
                          )}
                        </div>
                      </div>

                      {/* action */}
                      <button
                        onClick={() => onToggle(bill.id)}
                        className="btn-secondary text-xs py-1.5"
                      >
                        Mark as Paid
                      </button>

                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* paid bills */}
          {paidBills.length > 0 && (
            <div className="card p-6">

              <h3 className="text-lg font-bold mb-4">Recently Paid</h3>

              <div className="space-y-3">
                {paidBills.slice(0, 5).map(bill => (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50"
                  >

                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="text-emerald-500" size={18} />

                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {bill.title}
                        </p>

                        <p className="text-xs text-slate-500">
                          Paid on {format(new Date(bill.dueDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>

                    <span className="text-sm font-bold text-slate-900">
                      {formatCurrency(bill.amount)}
                    </span>

                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}