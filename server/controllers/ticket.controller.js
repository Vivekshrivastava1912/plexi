import mongoose from "mongoose";
import TicketModel from "../models/ticket.model.js";
import { initialTickets } from "../config/connectDB.js";

let memoryTickets = initialTickets.map((t, idx) => ({
  _id: `664b38d72138a0f91a9b200${idx + 1}`,
  ticketId: t.ticketId,
  customerName: t.customerName,
  customerEmail: t.customerEmail,
  subject: t.subject,
  description: t.description,
  priority: t.priority,
  status: t.status,
  createdAt: t.createdAt.toISOString(),
  updatedAt: t.updatedAt.toISOString(),
}));

const isMongoAvailable = () => mongoose.connection.readyState === 1;

export async function createTicketController(request, response) {
  try {
    const { customerName, customerEmail, subject, description, priority, status } =
      request.body;

    if (!customerName || !customerEmail || !subject || !description) {
      return response.status(400).json({
        message: "Please provide Customer Name, Customer Email, Subject, and Description.",
        error: true,
        success: false,
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return response.status(400).json({
        message: "Please provide a valid customer email address.",
        error: true,
        success: false,
      });
    }

    const validPriorities = ["Low", "Medium", "High"];
    const chosenPriority = priority || "Medium";
    if (!validPriorities.includes(chosenPriority)) {
      return response.status(400).json({
        message: "Priority must be Low, Medium, or High.",
        error: true,
        success: false,
      });
    }

    const validStatuses = ["Open", "In Progress", "Resolved"];
    const chosenStatus = status || "Open";
    if (!validStatuses.includes(chosenStatus)) {
      return response.status(400).json({
        message: "Status must be Open, In Progress, or Resolved.",
        error: true,
        success: false,
      });
    }

    let createdTicket = null;

    if (isMongoAvailable()) {
      try {
        let userId = null;
        if (request.user && mongoose.Types.ObjectId.isValid(request.user._id || request.user.id)) {
          userId = request.user._id || request.user.id;
        }

        const newDoc = new TicketModel({
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim().toLowerCase(),
          subject: subject.trim(),
          description: description.trim(),
          priority: chosenPriority,
          status: chosenStatus,
          createdBy: userId,
        });

        await newDoc.save();
        createdTicket = newDoc.toObject();
        memoryTickets.unshift(createdTicket);
      } catch (err) {
        console.error("Create ticket MongoDB error:", err);
      }
    }

    if (!createdTicket) {
      const nextIdNum = 1001 + memoryTickets.length;
      createdTicket = {
        _id: new mongoose.Types.ObjectId().toString(),
        ticketId: `TCK-${nextIdNum}`,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        subject: subject.trim(),
        description: description.trim(),
        priority: chosenPriority,
        status: chosenStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryTickets.unshift(createdTicket);
    }

    return response.status(201).json({
      message: "Ticket created successfully",
      error: false,
      success: true,
      data: createdTicket,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getAllTicketsController(request, response) {
  try {
    const { status, priority, search } = request.query;

    let all = [];

    if (isMongoAvailable()) {
      try {
        all = await TicketModel.find({}).sort({ createdAt: -1 }).lean();
        if (all.length > 0) {
          memoryTickets = all;
        } else if (memoryTickets.length > 0) {
          await TicketModel.insertMany(memoryTickets);
          all = memoryTickets;
        }
      } catch (err) {
        all = memoryTickets;
      }
    } else {
      all = memoryTickets;
    }

    const totalTickets = all.length;
    const openTickets = all.filter((t) => t.status === "Open").length;
    const inProgressTickets = all.filter((t) => t.status === "In Progress").length;
    const resolvedTickets = all.filter((t) => t.status === "Resolved").length;

    let filtered = [...all];

    if (status && status !== "All") {
      filtered = filtered.filter((t) => t.status === status);
    }

    if (priority && priority !== "All") {
      filtered = filtered.filter((t) => t.priority === priority);
    }

    if (search && search.trim() !== "") {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (t) =>
          (t.ticketId && t.ticketId.toLowerCase().includes(q)) ||
          (t.customerName && t.customerName.toLowerCase().includes(q)) ||
          (t.customerEmail && t.customerEmail.toLowerCase().includes(q)) ||
          (t.subject && t.subject.toLowerCase().includes(q))
      );
    }

    return response.status(200).json({
      message: "Tickets retrieved successfully",
      error: false,
      success: true,
      count: filtered.length,
      summary: {
        total: totalTickets,
        open: openTickets,
        inProgress: inProgressTickets,
        resolved: resolvedTickets,
      },
      data: filtered,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getTicketSummaryController(request, response) {
  try {
    let all = memoryTickets;
    if (isMongoAvailable()) {
      try {
        const total = await TicketModel.countDocuments();
        if (total > 0) {
          const open = await TicketModel.countDocuments({ status: "Open" });
          const inProgress = await TicketModel.countDocuments({ status: "In Progress" });
          const resolved = await TicketModel.countDocuments({ status: "Resolved" });

          return response.status(200).json({
            message: "Summary retrieved successfully",
            error: false,
            success: true,
            data: {
              total,
              open,
              inProgress,
              resolved,
            },
          });
        }
      } catch (err) {}
    }

    const total = all.length;
    const open = all.filter((t) => t.status === "Open").length;
    const inProgress = all.filter((t) => t.status === "In Progress").length;
    const resolved = all.filter((t) => t.status === "Resolved").length;

    return response.status(200).json({
      message: "Summary retrieved successfully",
      error: false,
      success: true,
      data: {
        total,
        open,
        inProgress,
        resolved,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function getTicketDetailsController(request, response) {
  try {
    const id = request.params.id;
    let ticket = null;

    if (isMongoAvailable()) {
      try {
        if (mongoose.Types.ObjectId.isValid(id)) {
          ticket = await TicketModel.findById(id).lean();
        } else {
          ticket = await TicketModel.findOne({ ticketId: id }).lean();
        }
      } catch (err) {}
    }

    if (!ticket) {
      ticket = memoryTickets.find(
        (t) => String(t._id) === String(id) || t.ticketId === id
      );
    }

    if (!ticket) {
      return response.status(404).json({
        message: `Ticket not found with id: ${id}`,
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Ticket details fetched successfully",
      error: false,
      success: true,
      data: ticket,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function updateTicketController(request, response) {
  try {
    const id = request.params.id;
    let ticket = null;

    if (isMongoAvailable()) {
      try {
        if (mongoose.Types.ObjectId.isValid(id)) {
          ticket = await TicketModel.findById(id);
        } else {
          ticket = await TicketModel.findOne({ ticketId: id });
        }
      } catch (err) {}
    }

    const { status, priority, subject, description, customerName, customerEmail } =
      request.body;

    if (status) {
      const validStatuses = ["Open", "In Progress", "Resolved"];
      if (!validStatuses.includes(status)) {
        return response.status(400).json({
          message: "Status must be Open, In Progress, or Resolved.",
          error: true,
          success: false,
        });
      }
    }

    if (priority) {
      const validPriorities = ["Low", "Medium", "High"];
      if (!validPriorities.includes(priority)) {
        return response.status(400).json({
          message: "Priority must be Low, Medium, or High.",
          error: true,
          success: false,
        });
      }
    }

    if (ticket) {
      if (status) ticket.status = status;
      if (priority) ticket.priority = priority;
      if (subject) ticket.subject = subject.trim();
      if (description) ticket.description = description.trim();
      if (customerName) ticket.customerName = customerName.trim();
      if (customerEmail) ticket.customerEmail = customerEmail.trim().toLowerCase();
      await ticket.save();

      const updatedObj = ticket.toObject();
      const memIdx = memoryTickets.findIndex(
        (t) => String(t._id) === String(ticket._id) || t.ticketId === ticket.ticketId
      );
      if (memIdx !== -1) memoryTickets[memIdx] = updatedObj;

      return response.status(200).json({
        message: "Ticket updated successfully",
        error: false,
        success: true,
        data: updatedObj,
      });
    }

    const memIdx = memoryTickets.findIndex(
      (t) => String(t._id) === String(id) || t.ticketId === id
    );

    if (memIdx === -1) {
      return response.status(404).json({
        message: `Ticket not found with id: ${id}`,
        error: true,
        success: false,
      });
    }

    if (status) memoryTickets[memIdx].status = status;
    if (priority) memoryTickets[memIdx].priority = priority;
    if (subject) memoryTickets[memIdx].subject = subject.trim();
    if (description) memoryTickets[memIdx].description = description.trim();
    if (customerName) memoryTickets[memIdx].customerName = customerName.trim();
    if (customerEmail) memoryTickets[memIdx].customerEmail = customerEmail.trim().toLowerCase();
    memoryTickets[memIdx].updatedAt = new Date().toISOString();

    return response.status(200).json({
      message: "Ticket updated successfully",
      error: false,
      success: true,
      data: memoryTickets[memIdx],
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}

export async function deleteTicketController(request, response) {
  try {
    const id = request.params.id;
    let deleted = false;

    if (isMongoAvailable()) {
      try {
        let res;
        if (mongoose.Types.ObjectId.isValid(id)) {
          res = await TicketModel.findByIdAndDelete(id);
        } else {
          res = await TicketModel.findOneAndDelete({ ticketId: id });
        }
        if (res) deleted = true;
      } catch (err) {}
    }

    const initialLen = memoryTickets.length;
    memoryTickets = memoryTickets.filter(
      (t) => String(t._id) !== String(id) && t.ticketId !== id
    );
    if (memoryTickets.length < initialLen) deleted = true;

    if (!deleted) {
      return response.status(404).json({
        message: `Ticket not found with id: ${id}`,
        error: true,
        success: false,
      });
    }

    return response.status(200).json({
      message: "Ticket deleted successfully",
      error: false,
      success: true,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
}
