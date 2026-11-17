import React from 'react';
import { X, Calendar, Mail, User, Clock, AlertTriangle, Trash2, CheckCircle2 } from 'lucide-react';

const priorityColors = {
  High: 'bg-red-50 text-red-700 border-red-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-slate-100 text-slate-700 border-slate-200',
};

const statusColors = {
  Open: 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
  Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const formatFullDate = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const TicketDetailModal = ({
  ticket,
  isOpen,
  onClose,
  onChangeStatus,
  onDeleteTicket,
}) => {
  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
              {ticket.ticketId || `TCK-${ticket._id.slice(-4).toUpperCase()}`}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                priorityColors[ticket.priority] || 'bg-slate-100'
              }`}
            >
              {ticket.priority} Priority
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Subject & Status Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-snug">{ticket.subject}</h2>
              <p className="text-xs text-slate-400 mt-1">
                Database ID: <span className="font-mono">{ticket._id}</span>
              </p>
            </div>

            {/* Quick Status Updater */}
            <div className="shrink-0 flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600 uppercase">Status:</label>
              <select
                value={ticket.status}
                onChange={(e) => onChangeStatus(ticket, e.target.value)}
                className={`text-xs font-semibold rounded-lg px-3 py-1.5 border transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  statusColors[ticket.status] || 'bg-slate-50'
                }`}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* Customer Profile Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-xs font-medium text-slate-400 block mb-1">Customer Name</span>
              <div className="flex items-center gap-2 font-medium text-slate-800 text-sm">
                <User className="w-4 h-4 text-blue-500" />
                <span>{ticket.customerName}</span>
              </div>
            </div>
            <div>
              <span className="text-xs font-medium text-slate-400 block mb-1">Customer Email</span>
              <div className="flex items-center gap-2 font-mono text-slate-800 text-sm">
                <Mail className="w-4 h-4 text-indigo-500" />
                <a
                  href={`mailto:${ticket.customerEmail}`}
                  className="text-blue-600 hover:underline"
                >
                  {ticket.customerEmail}
                </a>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
              Description
            </h4>
            <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Created: {formatFullDate(ticket.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Last Updated: {formatFullDate(ticket.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onDeleteTicket(ticket);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Ticket</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;

