import React from 'react';
import { Layers, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

const TicketSummary = ({ summary, activeStatus, onSelectStatus }) => {
  const cards = [
    {
      id: 'All',
      title: 'Total Tickets',
      count: summary?.total ?? 0,
      icon: Layers,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      activeRing: 'ring-2 ring-blue-500',
      badge: 'All statuses',
    },
    {
      id: 'Open',
      title: 'Open Tickets',
      count: summary?.open ?? 0,
      icon: AlertCircle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      activeRing: 'ring-2 ring-amber-500',
      badge: 'Awaiting Action',
    },
    {
      id: 'In Progress',
      title: 'In Progress Tickets',
      count: summary?.inProgress ?? 0,
      icon: Clock,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      activeRing: 'ring-2 ring-indigo-500',
      badge: 'Being Worked On',
    },
    {
      id: 'Resolved',
      title: 'Resolved Tickets',
      count: summary?.resolved ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      activeRing: 'ring-2 ring-emerald-500',
      badge: 'Completed',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeStatus === card.id;

        return (
          <div
            key={card.id}
            onClick={() => onSelectStatus(card.id)}
            className={`cursor-pointer bg-white rounded-xl p-5 border transition-all duration-200 shadow-sm hover:shadow-md ${
              isActive ? `${card.activeRing} border-transparent` : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {card.title}
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                  {card.count}
                </h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bgColor} ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Click to filter</span>
              <span className={`font-medium ${card.color}`}>{card.badge}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TicketSummary;

