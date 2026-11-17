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

    if (isMongoAvailable()) {
      let userId = null;
      if (request.user && mongoose.Types.ObjectId.isValid(request.user._id || request.user.id)) {
        userId = request.user._id || request.user.id;
      }

      const newTicket = new TicketModel({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        subject: subject.trim(),
        description: description.trim(),
        priority: chosenPriority,
        status: chosenStatus,
        createdBy: userId,
      });

      await newTicket.save();
      const savedObj = newTicket.toObject();
      memoryTickets.unshift(savedObj);

      return response.status(201).json({
        message: "Ticket created successfully in MongoDB",
        error: false,
        success: true,
        data: savedObj,
      });
    }

    const nextIdNum = 1001 + memoryTickets.length;
    const fallbackTicket = {
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
    memoryTickets.unshift(fallbackTicket);

    return response.status(201).json({
      message: "Ticket created successfully",
      error: false,
      success: true,
      data: fallbackTicket,
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

    if (isMongoAvailable()) {
      const query = {};
      if (status && status !== "All") {
        query.status = status;
      }
      if (priority && priority !== "All") {
        query.priority = priority;
      }
      if (search && search.trim() !== "") {
        const q = search.trim();
        query.$or = [
          { ticketId: { $regex: q, $options: "i" } },
          { customerName: { $regex: q, $options: "i" } },
          { customerEmail: { $regex: q, $options: "i" } },
          { subject: { $regex: q, $options: "i" } },
        ];
      }

      const tickets = await TicketModel.find(query).sort({ createdAt: -1 }).lean();
      const totalTickets = await TicketModel.countDocuments();
      const openTickets = await TicketModel.countDocuments({ status: "Open" });
      const inProgressTickets = await TicketModel.countDocuments({ status: "In Progress" });
      const resolvedTickets = await TicketModel.countDocuments({ status: "Resolved" });

      return response.status(200).json({
        message: "Tickets retrieved successfully from MongoDB",
        error: false,
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
    }

    let filtered = [...memoryTickets];
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

    const total = memoryTickets.length;
    const open = memoryTickets.filter((t) => t.status === "Open").length;
    const inProgress = memoryTickets.filter((t) => t.status === "In Progress").length;
    const resolved = memoryTickets.filter((t) => t.status === "Resolved").length;

    return response.status(200).json({
      message: "Tickets retrieved successfully",
      error: false,
      success: true,
      count: filtered.length,
      summary: {
        total,
        open,
        inProgress,
        resolved,
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
    if (isMongoAvailable()) {
      const total = await TicketModel.countDocuments();
      const open = await TicketModel.countDocuments({ status: "Open" });
      const inProgress = await TicketModel.countDocuments({ status: "In Progress" });
      const resolved = await TicketModel.countDocuments({ status: "Resolved" });

      return response.status(200).json({
        message: "Summary retrieved successfully from MongoDB",
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

    const total = memoryTickets.length;
    const open = memoryTickets.filter((t) => t.status === "Open").length;
    const inProgress = memoryTickets.filter((t) => t.status === "In Progress").length;
    const resolved = memoryTickets.filter((t) => t.status === "Resolved").length;

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

    if (isMongoAvailable()) {
      const filter = {
        $or: [
          ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : []),
          { ticketId: id },
        ],
      };

      const ticket = await TicketModel.findOne(filter).lean();

      if (!ticket) {
        return response.status(404).json({
          message: `Ticket not found with id: ${id}`,
          error: true,
          success: false,
        });
      }

      return response.status(200).json({
        message: "Ticket details fetched successfully from MongoDB",
        error: false,
        success: true,
        data: ticket,
      });
    }

    const ticket = memoryTickets.find(
      (t) => String(t._id) === String(id) || t.ticketId === id
    );

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

    if (customerEmail !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail)) {
        return response.status(400).json({
          message: "Please provide a valid customer email address.",
          error: true,
          success: false,
        });
      }
    }

    if (isMongoAvailable()) {
      const filter = {
        $or: [
          ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : []),
          { ticketId: id },
        ],
      };

      const updateData = {};
      if (status) updateData.status = status;
      if (priority) updateData.priority = priority;
      if (subject !== undefined) updateData.subject = subject.trim();
      if (description !== undefined) updateData.description = description.trim();
      if (customerName !== undefined) updateData.customerName = customerName.trim();
      if (customerEmail !== undefined) updateData.customerEmail = customerEmail.trim().toLowerCase();

      const updated = await TicketModel.findOneAndUpdate(filter, updateData, {
        new: true,
        runValidators: true,
      });

      if (!updated) {
        return response.status(404).json({
          message: `Ticket not found with id: ${id}`,
          error: true,
          success: false,
        });
      }

      const updatedObj = updated.toObject();
      const memIdx = memoryTickets.findIndex(
        (t) => String(t._id) === String(updatedObj._id) || t.ticketId === updatedObj.ticketId
      );
      if (memIdx !== -1) memoryTickets[memIdx] = updatedObj;

      return response.status(200).json({
        message: "Ticket updated successfully in MongoDB",
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
    if (subject !== undefined) memoryTickets[memIdx].subject = subject.trim();
    if (description !== undefined) memoryTickets[memIdx].description = description.trim();
    if (customerName !== undefined) memoryTickets[memIdx].customerName = customerName.trim();
    if (customerEmail !== undefined) memoryTickets[memIdx].customerEmail = customerEmail.trim().toLowerCase();
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

    if (isMongoAvailable()) {
      const filter = {
        $or: [
          ...(mongoose.Types.ObjectId.isValid(id) ? [{ _id: id }] : []),
          { ticketId: id },
        ],
      };

      const deleted = await TicketModel.findOneAndDelete(filter);

      if (!deleted) {
        return response.status(404).json({
          message: `Ticket not found with id: ${id}`,
          error: true,
          success: false,
        });
      }

      memoryTickets = memoryTickets.filter(
        (t) => String(t._id) !== String(deleted._id) && t.ticketId !== deleted.ticketId
      );

      return response.status(200).json({
        message: "Ticket deleted successfully from MongoDB",
        error: false,
        success: true,
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

    memoryTickets.splice(memIdx, 1);

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
