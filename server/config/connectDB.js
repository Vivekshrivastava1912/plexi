import mongoose from "mongoose";
import dotenv from "dotenv";
import UserModel from "../models/user.model.js";
import TicketModel from "../models/ticket.model.js";

dotenv.config();

let isConnected = false;

const initialTickets = [
  {
    ticketId: "TCK-1001",
    customerName: "Alice Johnson",
    customerEmail: "alice.johnson@techcorp.com",
    subject: "Payment gateway timeout during checkout",
    description: "Customer reported an error code 504 when attempting Stripe card payment on the checkout page.",
    priority: "High",
    status: "Open",
    createdAt: new Date("2026-11-15T09:30:00Z"),
    updatedAt: new Date("2026-11-15T09:30:00Z"),
  },
  {
    ticketId: "TCK-1002",
    customerName: "Robert Smith",
    customerEmail: "robert.smith@cloudmail.io",
    subject: "Unable to reset account password",
    description: "The password reset verification link sent to user inbox expired prematurely or fails with invalid token.",
    priority: "Medium",
    status: "In Progress",
    createdAt: new Date("2026-11-16T11:20:00Z"),
    updatedAt: new Date("2026-11-16T11:20:00Z"),
  },
  {
    ticketId: "TCK-1003",
    customerName: "Emily Davis",
    customerEmail: "emily.d@innovate.org",
    subject: "Feature Request: Dark mode UI theme",
    description: "User requested a dark theme toggle for the dashboard to reduce eye strain during nighttime shifts.",
    priority: "Low",
    status: "Resolved",
    createdAt: new Date("2026-11-14T14:15:00Z"),
    updatedAt: new Date("2026-11-16T16:00:00Z"),
  },
  {
    ticketId: "TCK-1004",
    customerName: "Michael Brown",
    customerEmail: "michael.b@enterprises.net",
    subject: "Data export to CSV failing with 500 error",
    description: "Exporting large ticket datasets (>500 items) causes the server to time out and return a 500 status code.",
    priority: "High",
    status: "Open",
    createdAt: new Date("2026-11-17T08:45:00Z"),
    updatedAt: new Date("2026-11-17T08:45:00Z"),
  },
];

export async function syncSeedDataToMongo() {
  if (mongoose.connection.readyState !== 1) return;
  try {
    const defaultEmail = (process.env.DEFAULT_USER_EMAIL || "admin@example.com").toLowerCase().trim();
    const defaultPassword = process.env.DEFAULT_USER_PASSWORD || "admin123";
    const defaultName = process.env.DEFAULT_USER_NAME || "Admin User";

    let user = await UserModel.findOne({ email: defaultEmail });
    if (!user) {
      user = await UserModel.create({
        name: defaultName,
        email: defaultEmail,
        password: defaultPassword,
        role: "admin",
      });
    }

    const count = await TicketModel.countDocuments();
    if (count === 0) {
      await TicketModel.insertMany(
        initialTickets.map((t) => ({ ...t, createdBy: user._id }))
      );
    }
  } catch (err) {
    console.error("MongoDB seed sync notice:", err.message);
  }
}

async function connectDB() {
  const mongoURI =
    process.env.MONGODB_URI ||
    process.env.MONGODB_URL ||
    "mongodb://127.0.0.1:27017/support_ticket_db";

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500,
    });
    isConnected = true;
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    await syncSeedDataToMongo();
    return conn;
  } catch (error) {
    isConnected = false;
    console.log(`MongoDB connection notice: ${error.message}. Running with local data layer.`);
  }
}

export { isConnected, initialTickets };
export default connectDB;
