import React from "react";
import { Search, Plus, RotateCcw } from "lucide-react";

const TicketFilter = ({
  statusFilter,
  onStatusChange,
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityChange,
  onResetFilters,
  onOpenCreateModal,
}) => {
  const statuses = [
    { id: "All", label: "All Tickets" },
    { id: "Open", label: "Open" },
    { id: "In Progress", label: "In Progress" },
    { id: "Resolved", label: "Resolved" },
  ];

  return (
    <div className="bg-white rounded-[2px] p-3.5 border border-slate-200 shadow-xs mb-5 space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-[2px] overflow-x-auto text-xs font-medium border border-slate-200">
          {statuses.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onStatusChange(tab.id)}
              className={`px-3 py-1 rounded-[2px] whitespace-nowrap transition-colors duration-150 ${
                statusFilter === tab.id
                  ? "bg-white text-blue-700 font-semibold shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-[2px] shadow-xs transition-colors focus:outline-none whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Ticket</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-slate-100">
        <div className="sm:col-span-8 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Ticket ID, Customer, Subject, or Email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-[2px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder-slate-400"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-[2px] focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>

        <div className="sm:col-span-1">
          <button
            onClick={onResetFilters}
            title="Reset Filters"
            className="w-full h-full flex items-center justify-center p-1.5 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-[2px] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketFilter;
