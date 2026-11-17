import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import TicketSummary from '../components/TicketSummary';
import TicketFilter from '../components/TicketFilter';
import TicketList from '../components/TicketList';
import CreateTicketModal from '../components/CreateTicketModal';
import TicketDetailModal from '../components/TicketDetailModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { ticketAPI } from '../services/api';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

const DashboardPage = () => {
  // State
  const [tickets, setTickets] = useState([]);
  const [summary, setSummary] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Temporary Toast message
  const showFeedback = (msg, type = 'success') => {
    setFeedbackMessage({ msg, type });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  // Fetch tickets & summary from backend
  const fetchTickets = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);
    setApiError(null);

    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (priorityFilter !== 'All') params.priority = priorityFilter;
      if (searchQuery.trim() !== '') params.search = searchQuery.trim();

      const response = await ticketAPI.getAll(params);

      if (response.success) {
        setTickets(response.data || []);
        if (response.summary) {
          setSummary(response.summary);
        }
      } else {
        setApiError(response.message || 'Failed to fetch tickets.');
      }
    } catch (err) {
      setApiError(
        err.response?.data?.message || err.message || 'Unable to connect to the ticket server.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [statusFilter, priorityFilter, searchQuery]);

  // Initial fetch and on filter changes
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Handle Create Ticket
  const handleCreateTicket = async (newTicketData) => {
    try {
      const response = await ticketAPI.create(newTicketData);
      if (response.success) {
        showFeedback(`Ticket ${response.data?.ticketId || ''} created successfully!`, 'success');
        await fetchTickets(true);
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Failed to create ticket',
      };
    }
  };

  // Handle Status Change
  const handleChangeStatus = async (ticket, newStatus) => {
    try {
      const response = await ticketAPI.updateStatus(ticket._id, newStatus);
      if (response.success) {
        showFeedback(`Ticket status updated to "${newStatus}".`, 'success');
        // Update local state smoothly
        setTickets((prev) =>
          prev.map((t) => (t._id === ticket._id ? { ...t, status: newStatus } : t))
        );
        if (selectedTicket && selectedTicket._id === ticket._id) {
          setSelectedTicket((prev) => ({ ...prev, status: newStatus }));
        }
        // Refetch summary quietly
        fetchTickets(true);
      }
    } catch (err) {
      showFeedback(
        err.response?.data?.message || 'Failed to update ticket status.',
        'error'
      );
    }
  };

  // Handle View Ticket Details
  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket);
    setIsDetailModalOpen(true);
  };

  // Handle Prompt Delete
  const handlePromptDelete = (ticket) => {
    setTicketToDelete(ticket);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete Ticket
  const handleConfirmDelete = async () => {
    if (!ticketToDelete) return;
    setIsDeleting(true);
    try {
      const response = await ticketAPI.delete(ticketToDelete._id);
      if (response.success) {
        showFeedback(response.message || 'Ticket deleted successfully', 'success');
        setIsDeleteModalOpen(false);
        setTicketToDelete(null);
        await fetchTickets(true);
      }
    } catch (err) {
      showFeedback(
        err.response?.data?.message || 'Failed to delete ticket.',
        'error'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setStatusFilter('All');
    setSearchQuery('');
    setPriorityFilter('All');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Support Ticket Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage, monitor, and resolve customer service requests in real-time.
            </p>
          </div>

          <button
            onClick={() => fetchTickets(true)}
            disabled={isRefreshing || isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>

        {/* Global Feedback Banner */}
        {feedbackMessage && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center justify-between text-sm shadow-sm transition-all duration-300 ${
              feedbackMessage.type === 'error'
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMessage.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              <span>{feedbackMessage.msg}</span>
            </div>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-xs font-semibold uppercase hover:underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* API Error Alert */}
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <p className="font-semibold">Backend Connection Issue</p>
              <p className="text-xs text-red-700 mt-0.5">{apiError}</p>
            </div>
          </div>
        )}

        {/* 1. Ticket Summary Cards */}
        <TicketSummary
          summary={summary}
          activeStatus={statusFilter}
          onSelectStatus={(status) => setStatusFilter(status)}
        />

        {/* 2. Ticket Filtering & Create Button */}
        <TicketFilter
          statusFilter={statusFilter}
          onStatusChange={(status) => setStatusFilter(status)}
          searchQuery={searchQuery}
          onSearchChange={(query) => setSearchQuery(query)}
          priorityFilter={priorityFilter}
          onPriorityChange={(priority) => setPriorityFilter(priority)}
          onResetFilters={handleResetFilters}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />

        {/* 3. Ticket List (Table/Cards) */}
        <TicketList
          tickets={tickets}
          isLoading={isLoading}
          onViewDetails={handleViewDetails}
          onChangeStatus={handleChangeStatus}
          onDeleteTicket={handlePromptDelete}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />
      </main>

      {/* Modals */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTicket={handleCreateTicket}
      />

      <TicketDetailModal
        ticket={selectedTicket}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTicket(null);
        }}
        onChangeStatus={handleChangeStatus}
        onDeleteTicket={handlePromptDelete}
      />

      <DeleteConfirmModal
        ticket={ticketToDelete}
        isOpen={isDeleteModalOpen}
        isDeleting={isDeleting}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTicketToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default DashboardPage;

