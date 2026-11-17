import React, { useState } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';

const CreateTicketModal = ({ isOpen, onClose, onCreateTicket }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    subject: '',
    description: '',
    priority: 'Medium',
    status: 'Open',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.customerName.trim()) {
      errs.customerName = 'Customer name is required';
    } else if (formData.customerName.trim().length < 2) {
      errs.customerName = 'Name must be at least 2 characters';
    }

    if (!formData.customerEmail.trim()) {
      errs.customerEmail = 'Customer email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.customerEmail.trim())) {
        errs.customerEmail = 'Please provide a valid email format (e.g., user@example.com)';
      }
    }

    if (!formData.subject.trim()) {
      errs.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 3) {
      errs.subject = 'Subject must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      errs.description = 'Description is required';
    } else if (formData.description.trim().length < 5) {
      errs.description = 'Description must be at least 5 characters';
    }

    if (!['Low', 'Medium', 'High'].includes(formData.priority)) {
      errs.priority = 'Priority must be Low, Medium, or High';
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
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onCreateTicket({
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail.trim(),
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: 'Open', // default status
      });

      if (result.success) {
        // Reset form
        setFormData({
          customerName: '',
          customerEmail: '',
          subject: '',
          description: '',
          priority: 'Medium',
          status: 'Open',
        });
        onClose();
      } else {
        setApiError(result.message || 'Failed to create ticket.');
      }
    } catch (err) {
      setApiError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Create New Support Ticket</h3>
            <p className="text-xs text-slate-500">All newly created tickets will be set to Open status by default.</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {apiError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Customer Name & Email (2 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.customerName ? 'border-red-400 focus:ring-red-500' : 'border-slate-300'
                }`}
              />
              {errors.customerName && (
                <p className="text-xs text-red-600 mt-1">{errors.customerName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Customer Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="customerEmail"
                placeholder="john.doe@company.com"
                value={formData.customerEmail}
                onChange={handleChange}
                className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.customerEmail ? 'border-red-400 focus:ring-red-500' : 'border-slate-300'
                }`}
              />
              {errors.customerEmail && (
                <p className="text-xs text-red-600 mt-1">{errors.customerEmail}</p>
              )}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subject"
              placeholder="Brief summary of the issue or inquiry"
              value={formData.subject}
              onChange={handleChange}
              className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.subject ? 'border-red-400 focus:ring-red-500' : 'border-slate-300'
              }`}
            />
            {errors.subject && (
              <p className="text-xs text-red-600 mt-1">{errors.subject}</p>
            )}
          </div>

          {/* Priority & Status indicator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                Initial Status
              </label>
              <div className="px-3.5 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-600 flex items-center justify-between">
                <span className="font-medium">Open</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">
                  Default
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              rows={4}
              placeholder="Provide complete details, steps to reproduce, or relevant context..."
              value={formData.description}
              onChange={handleChange}
              className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-400 focus:ring-red-500' : 'border-slate-300'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-red-600 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Ticket...</span>
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

