import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { format, eachMonthOfInterval, subMonths, isSameMonth } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function Charts({ transactions }) {

  // Expense by Category Data
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {}); // removed Record<string, number>

  const pieData = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        data: Object.values(expensesByCategory),
        backgroundColor: [
          '#6366f1',
          '#ec4899',
          '#f59e0b',
          '#10b981',
          '#3b82f6',
          '#8b5cf6',
          '#f43f5e',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Monthly Income vs Expense Data (Last 6 months)
  const last6Months = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end: new Date(),
  });

  const barData = {
    labels: last6Months.map(date => format(date, 'MMM')),
    datasets: [
      {
        label: 'Income',
        data: last6Months.map(month =>
          transactions
            .filter(t => t.type === 'income' && isSameMonth(new Date(t.date), month))
            .reduce((sum, t) => sum + t.amount, 0)
        ),
        backgroundColor: '#10b981',
        borderRadius: 6,
      },
      {
        label: 'Expenses',
        data: last6Months.map(month =>
          transactions
            .filter(t => t.type === 'expense' && isSameMonth(new Date(t.date), month))
            .reduce((sum, t) => sum + t.amount, 0)
        ),
        backgroundColor: '#f43f5e',
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Income vs Expenses</h3>
        <div className="h-[300px]">
          <Bar 
            data={barData} 
            options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom' } }
            }} 
          />
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6">Expenses by Category</h3>
        <div className="h-[300px] flex items-center justify-center">
          {Object.keys(expensesByCategory).length > 0 ? (
            <Pie 
              data={pieData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right' } }
              }} 
            />
          ) : (
            <p className="text-slate-400 text-sm italic">No expense data to display</p>
          )}
        </div>
      </div>
    </div>
  );
}