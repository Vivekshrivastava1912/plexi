import React, { useState } from "react";
import { X, AlertCircle, Loader2 } from "lucide-react";

const CreateTicketModal = ({ isOpen, onClose, onCreateTicket }) => {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    subject: "",
    description: "",
    priority: "Medium",
    status: "Open",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.customerName.trim()) {
      errs.customerName = "Customer name is required";
    } else if (formData.customerName.trim().length < 2) {
      errs.customerName = "Name must be at least 2 characters";
    }

    if (!formData.customerEmail.trim()) {
      errs.customerEmail = "Customer email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.customerEmail.trim())) {
        errs.customerEmail = "Please provide a valid email format";
      }
    }

    if (!formData.subject.trim()) {
      errs.subject = "Subject is required";
    } else if (formData.subject.trim().length < 3) {
      errs.subject = "Subject must be at least 3 characters";
    }

    if (!formData.description.trim()) {
      errs.description = "Description is required";
    } else if (formData.description.trim().length < 5) {
      errs.description = "Description must be at least 5 characters";
    }

    if (!["Low", "Medium", "High"].includes(formData.priority)) {
      errs.priority = "Priority must be Low, Medium, or High";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await onCreateTicket({
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail.trim(),
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: "Open",
      });

      if (result.success) {
        setFormData({
          customerName: "",
          customerEmail: "",
          subject: "",
          description: "",
          priority: "Medium",
          status: "Open",
        });
        onClose();
      } else {
        setApiError(result.message || "Failed to create ticket.");
      }
    } catch (err) {
      setApiError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-[2px] shadow-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Create New Support Ticket</h3>
            <p className="text-xs text-slate-500">Newly created tickets will have Open status by default.</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-[2px] hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {apiError && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-[2px] text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="customerName"
                placeholder="e.g. John Doe"
                value={formData.customerName}
                onChange={handleChange}
                className={`w-full px-3 py-1.5 text-xs bg-white border rounded-[2px] focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.customerName ? "border-red-400" : "border-slate-300"
                }`}
              />
              {errors.customerName && (
                <p className="text-[11px] text-red-600 mt-0.5">{errors.customerName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Customer Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="customerEmail"
                placeholder="user@example.com"
                value={formData.customerEmail}
                onChange={handleChange}
                className={`w-full px-3 py-1.5 text-xs bg-white border rounded-[2px] focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  errors.customerEmail ? "border-red-400" : "border-slate-300"
                }`}
              />
              {errors.customerEmail && (
                <p className="text-[11px] text-red-600 mt-0.5">{errors.customerEmail}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subject"
              placeholder="Brief summary of the issue"
              value={formData.subject}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 text-xs bg-white border rounded-[2px] focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.subject ? "border-red-400" : "border-slate-300"
              }`}
            />
            {errors.subject && (
              <p className="text-[11px] text-red-600 mt-0.5">{errors.subject}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-[2px] focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Status
              </label>
              <div className="px-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-[2px] text-slate-600 flex items-center justify-between">
                <span className="font-medium">Open</span>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-[2px] font-semibold">
                  Default
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              rows={4}
              placeholder="Enter full details..."
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 text-xs bg-white border rounded-[2px] focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.description ? "border-red-400" : "border-slate-300"
              }`}
            />
            {errors.description && (
              <p className="text-[11px] text-red-600 mt-0.5">{errors.description}</p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[2px] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[2px] shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Create Ticket</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;
