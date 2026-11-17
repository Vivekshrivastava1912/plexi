import React from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";

const DeleteConfirmModal = ({
  isOpen,
  ticket,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm bg-white rounded-[2px] shadow-xl border border-slate-200 overflow-hidden p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="w-8 h-8 rounded-[2px] bg-red-100 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-[2px] hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-sm font-bold text-slate-900 mb-1.5">Delete Support Ticket?</h3>
        <p className="text-xs text-slate-600 mb-4">
          Are you sure you want to permanently delete ticket{" "}
          <span className="font-semibold text-slate-900">
            {ticket.ticketId || ticket._id}
          </span>
          ? This cannot be undone.
        </p>

        <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[2px] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-[2px] shadow-xs transition-colors disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Ticket</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
