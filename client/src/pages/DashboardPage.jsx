import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar.jsx";
import TicketSummary from "../components/TicketSummary.jsx";
import TicketFilter from "../components/TicketFilter.jsx";
import TicketList from "../components/TicketList.jsx";
import CreateTicketModal from "../components/CreateTicketModal.jsx";
import TicketDetailModal from "../components/TicketDetailModal.jsx";
import DeleteConfirmModal from "../components/DeleteConfirmModal.jsx";
import { ticketAPI } from "../services/api.js";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";

const DashboardPage = () => {
  const [tickets, setTickets] = useState([]);
  const [summary, setSummary] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showFeedback = (msg, type = "success") => {
    setFeedbackMessage({ msg, type });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  const fetchTickets = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);
    setApiError(null);

    try {
      const params = {};
      if (statusFilter !== "All") params.status = statusFilter;
      if (priorityFilter !== "All") params.priority = priorityFilter;
      if (searchQuery.trim() !== "") params.search = searchQuery.trim();

      const response = await ticketAPI.getAll(params);

      if (response.success) {
        setTickets(response.data || []);
        if (response.summary) {
          setSummary(response.summary);
        }
      } else {
        setApiError(response.message || "Failed to fetch tickets.");
      }
    } catch (err) {
      setApiError(
        err.response?.data?.message || err.message || "Unable to connect to the ticket server."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [statusFilter, priorityFilter, searchQuery]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleCreateTicket = async (newTicketData) => {
    try {
      const response = await ticketAPI.create(newTicketData);
      if (response.success) {
        showFeedback(`Ticket ${response.data?.ticketId || ""} created successfully!`, "success");
        await fetchTickets(true);
        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || "Failed to create ticket",
      };
    }
  };

  const handleChangeStatus = async (ticket, newStatus) => {
    try {
      const response = await ticketAPI.updateStatus(ticket._id, newStatus);
      if (response.success) {
        showFeedback(`Ticket status updated to "${newStatus}".`, "success");
        setTickets((prev) =>
          prev.map((t) => (t._id === ticket._id ? { ...t, status: newStatus } : t))
        );
        if (selectedTicket && selectedTicket._id === ticket._id) {
          setSelectedTicket((prev) => ({ ...prev, status: newStatus }));
        }
        fetchTickets(true);
      }
    } catch (err) {
      showFeedback(
        err.response?.data?.message || "Failed to update ticket status.",
        "error"
      );
    }
  };

  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket);
    setIsDetailModalOpen(true);
  };

  const handlePromptDelete = (ticket) => {
    setTicketToDelete(ticket);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!ticketToDelete) return;
    setIsDeleting(true);
    try {
      const response = await ticketAPI.delete(ticketToDelete._id);
      if (response.success) {
        showFeedback(response.message || "Ticket deleted successfully", "success");
        setIsDeleteModalOpen(false);
        setTicketToDelete(null);
        await fetchTickets(true);
      }
    } catch (err) {
      showFeedback(
        err.response?.data?.message || "Failed to delete ticket.",
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setStatusFilter("All");
    setSearchQuery("");
    setPriorityFilter("All");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Support Ticket Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage, monitor, and resolve customer support tickets.
            </p>
          </div>

          <button
            onClick={() => fetchTickets(true)}
            disabled={isRefreshing || isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-[2px] hover:bg-slate-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>

        {feedbackMessage && (
          <div
            className={`mb-4 p-3 rounded-[2px] flex items-center justify-between text-xs shadow-xs ${
              feedbackMessage.type === "error"
                ? "bg-red-50 border border-red-200 text-red-800"
                : "bg-emerald-50 border border-emerald-200 text-emerald-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMessage.type === "error" ? (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{feedbackMessage.msg}</span>
            </div>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-[10px] font-semibold uppercase hover:underline ml-3"
            >
              Dismiss
            </button>
          </div>
        )}

        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[2px] text-red-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <div>
              <p className="font-semibold">Backend Connection Issue</p>
              <p className="text-red-700 mt-0.5">{apiError}</p>
            </div>
          </div>
        )}

        <TicketSummary
          summary={summary}
          activeStatus={statusFilter}
          onSelectStatus={(status) => setStatusFilter(status)}
        />

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

        <TicketList
          tickets={tickets}
          isLoading={isLoading}
          onViewDetails={handleViewDetails}
          onChangeStatus={handleChangeStatus}
          onDeleteTicket={handlePromptDelete}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />
      </main>

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
