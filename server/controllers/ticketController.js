const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');

// Helper to find ticket by either MongoDB _id or custom ticketId
const findTicketByIdOrCustomId = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return await Ticket.findById(id);
  }
  return await Ticket.findOne({ ticketId: id });
};

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Private (Protected by JWT)
const createTicket = async (req, res, next) => {
  try {
    const { customerName, customerEmail, subject, description, priority, status } = req.body;

    // Validate required fields
    if (!customerName || !customerEmail || !subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Customer Name, Customer Email, Subject, and Description.',
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid customer email address.',
      });
    }

    // Valid priorities
    const validPriorities = ['Low', 'Medium', 'High'];
    const chosenPriority = priority || 'Medium';
    if (!validPriorities.includes(chosenPriority)) {
      return res.status(400).json({
        success: false,
        message: 'Priority must be Low, Medium, or High.',
      });
    }

    // Valid statuses (default Open)
    const validStatuses = ['Open', 'In Progress', 'Resolved'];
    const chosenStatus = status || 'Open';
    if (!validStatuses.includes(chosenStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be Open, In Progress, or Resolved.',
      });
    }

    const ticket = await Ticket.create({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      subject: subject.trim(),
      description: description.trim(),
      priority: chosenPriority,
      status: chosenStatus,
      createdBy: req.user ? req.user._id : null,
    });

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tickets (supports filtering by status & search)
// @route   GET /api/tickets
// @access  Private (Protected by JWT)
const getTickets = async (req, res, next) => {
  try {
    const { status, priority, search } = req.query;

    const query = {};

    // Filter by status if specified and not 'All'
    if (status && status !== 'All') {
      query.status = status;
    }

    // Filter by priority if specified
    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    // Search by subject, customerName, or ticketId
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { ticketId: searchRegex },
        { customerName: searchRegex },
        { customerEmail: searchRegex },
        { subject: searchRegex },
      ];
    }

    const tickets = await Ticket.find(query).sort({ createdAt: -1 });

    // Calculate Summary counts
    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: 'Open' });
    const inProgressTickets = await Ticket.countDocuments({ status: 'In Progress' });
    const resolvedTickets = await Ticket.countDocuments({ status: 'Resolved' });

    res.status(200).json({
      success: true,
      count: tickets.length,
      summary: {
        total: totalTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        resolved: resolvedTickets,
      },
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ticket summary metrics
// @route   GET /api/tickets/summary
// @access  Private (Protected by JWT)
const getTicketSummary = async (req, res, next) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const openTickets = await Ticket.countDocuments({ status: 'Open' });
    const inProgressTickets = await Ticket.countDocuments({ status: 'In Progress' });
    const resolvedTickets = await Ticket.countDocuments({ status: 'Resolved' });

    res.status(200).json({
      success: true,
      data: {
        total: totalTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        resolved: resolvedTickets,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ticket details by ID
// @route   GET /api/tickets/:id
// @access  Private (Protected by JWT)
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await findTicketByIdOrCustomId(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: `Ticket not found with id: ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ticket or status
// @route   PUT /api/tickets/:id
// @access  Private (Protected by JWT)
const updateTicket = async (req, res, next) => {
  try {
    let ticket = await findTicketByIdOrCustomId(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: `Ticket not found with id: ${req.params.id}`,
      });
    }

    const { status, priority, subject, description, customerName, customerEmail } = req.body;

    // Validate status if provided
    if (status) {
      const validStatuses = ['Open', 'In Progress', 'Resolved'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be Open, In Progress, or Resolved.',
        });
      }
      ticket.status = status;
    }

    // Validate priority if provided
    if (priority) {
      const validPriorities = ['Low', 'Medium', 'High'];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: 'Priority must be Low, Medium, or High.',
        });
      }
      ticket.priority = priority;
    }

    if (subject !== undefined) ticket.subject = subject.trim();
    if (description !== undefined) ticket.description = description.trim();
    if (customerName !== undefined) ticket.customerName = customerName.trim();
    if (customerEmail !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid customer email address.',
        });
      }
      ticket.customerEmail = customerEmail.trim().toLowerCase();
    }

    const updatedTicket = await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      data: updatedTicket,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a ticket
// @route   DELETE /api/tickets/:id
// @access  Private (Protected by JWT)
const deleteTicket = async (req, res, next) => {
  try {
    const ticket = await findTicketByIdOrCustomId(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: `Ticket not found with id: ${req.params.id}`,
      });
    }

    await Ticket.deleteOne({ _id: ticket._id });

    res.status(200).json({
      success: true,
      message: `Ticket ${ticket.ticketId || ticket._id} deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketSummary,
  getTicketById,
  updateTicket,
  deleteTicket,
};

