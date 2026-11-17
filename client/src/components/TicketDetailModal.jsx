import React from "react";
import { X, Calendar, Mail, User, Clock, Trash2 } from "lucide-react";

const priorityColors = {
  High: "bg-red-50 text-red-700 border-red-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-slate-100 text-slate-700 border-slate-200",
};

const statusColors = {
  Open: "bg-blue-50 text-blue-700 border-blue-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const formatFullDate = (dateString) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-[2px] shadow-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-[2px] border border-blue-100">
              {ticket.ticketId || `TCK-${String(ticket._id).slice(-4).toUpperCase()}`}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-[2px] border ${
                priorityColors[ticket.priority] || "bg-slate-100"
              }`}
            >
              {ticket.priority} Priority
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-[2px] hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-snug">{ticket.subject}</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                ID: <span className="font-mono">{ticket._id}</span>
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Status:</label>
              <select
                value={ticket.status}
                onChange={(e) => onChangeStatus(ticket, e.target.value)}
                className={`text-xs font-semibold rounded-[2px] px-2.5 py-1 border transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  statusColors[ticket.status] || "bg-slate-50"
                }`}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-[2px] border border-slate-200 text-xs">
            <div>
              <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Customer Name</span>
              <div className="flex items-center gap-1.5 font-medium text-slate-800">
                <User className="w-3.5 h-3.5 text-blue-500" />
                <span>{ticket.customerName}</span>
              </div>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 block mb-0.5">Customer Email</span>
              <div className="flex items-center gap-1.5 font-mono text-slate-800">
                <Mail className="w-3.5 h-3.5 text-indigo-500" />
                <a href={`mailto:${ticket.customerEmail}`} className="text-blue-600 hover:underline">
                  {ticket.customerEmail}
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Description
            </h4>
            <div className="bg-slate-50/60 p-3 rounded-[2px] border border-slate-200 text-slate-700 text-xs whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Created: {formatFullDate(ticket.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Updated: {formatFullDate(ticket.updatedAt)}</span>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onDeleteTicket(ticket);
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-[2px] border border-transparent hover:border-red-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Ticket</span>
          </button>

          <button
            onClick={onClose}
            className="px-3.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-[2px] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;
