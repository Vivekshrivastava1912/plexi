import React from 'react';
import { Eye, Trash2, ArrowUpDown, Calendar, Mail, User, AlertCircle } from 'lucide-react';

const priorityBadges = {
  High: 'bg-red-50 text-red-700 border-red-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-slate-100 text-slate-700 border-slate-200',
};

const statusBadges = {
  Open: 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
  Resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const TicketList = ({
  tickets,
  isLoading,
  onViewDetails,
  onChangeStatus,
  onDeleteTicket,
  onOpenCreateModal,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Loading tickets from database...</p>
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">No Tickets Found</h3>
        <p className="text-slate-500 text-sm max-w-md mx-auto mt-1 mb-6">
          There are no support tickets matching your current filter criteria, or none have been submitted yet.
        </p>
        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm"
        >
          Create First Ticket
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Desktop Table Layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-3.5">Ticket ID</th>
              <th scope="col" className="px-6 py-3.5">Customer</th>
              <th scope="col" className="px-6 py-3.5">Subject</th>
              <th scope="col" className="px-6 py-3.5">Priority</th>
              <th scope="col" className="px-6 py-3.5">Status</th>
              <th scope="col" className="px-6 py-3.5">Created Date</th>
              <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {tickets.map((ticket) => (
              <tr
                key={ticket._id}
                className="hover:bg-slate-50/80 transition-colors duration-150"
              >
                {/* Ticket ID */}
                <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-blue-600 text-xs">
                  <span className="bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                    {ticket.ticketId || `TCK-${ticket._id.slice(-4).toUpperCase()}`}
                  </span>
                </td>

                {/* Customer */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-slate-800">{ticket.customerName}</div>
                  <div className="text-xs text-slate-400 font-mono">{ticket.customerEmail}</div>
                </td>

                {/* Subject */}
                <td className="px-6 py-4 max-w-xs">
                  <div className="font-medium text-slate-800 truncate" title={ticket.subject}>
                    {ticket.subject}
                  </div>
                  <div className="text-xs text-slate-500 truncate" title={ticket.description}>
                    {ticket.description}
                  </div>
                </td>

                {/* Priority */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      priorityBadges[ticket.priority] || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {ticket.priority}
                  </span>
                </td>

                {/* Status Dropdown / Badge */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={ticket.status}
                    onChange={(e) => onChangeStatus(ticket, e.target.value)}
                    className={`text-xs font-semibold rounded-md px-2.5 py-1 border transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      statusBadges[ticket.status] || 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </td>

                {/* Created Date */}
                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                  {formatDate(ticket.createdAt)}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-1.5">
                  <button
                    onClick={() => onViewDetails(ticket)}
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Ticket Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteTicket(ticket)}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Ticket"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden divide-y divide-slate-200">
        {tickets.map((ticket) => (
          <div key={ticket._id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                {ticket.ticketId || `TCK-${ticket._id.slice(-4).toUpperCase()}`}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    priorityBadges[ticket.priority] || 'bg-slate-100'
                  }`}
                >
                  {ticket.priority}
                </span>
                <select
                  value={ticket.status}
                  onChange={(e) => onChangeStatus(ticket, e.target.value)}
                  className={`text-xs font-semibold rounded-md px-2 py-0.5 border ${
                    statusBadges[ticket.status] || 'bg-slate-50'
                  }`}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 text-base">{ticket.subject}</h4>
              <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{ticket.description}</p>
            </div>

            <div className="text-xs text-slate-500 flex flex-wrap gap-y-1 gap-x-4">
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{ticket.customerName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{ticket.customerEmail}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatDate(ticket.createdAt)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => onViewDetails(ticket)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Details</span>
              </button>
              <button
                onClick={() => onDeleteTicket(ticket)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketList;

