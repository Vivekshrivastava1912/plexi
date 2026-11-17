import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: [100, "Customer name cannot exceed 100 characters"],
    },
    customerEmail: {
      type: String,
      required: [true, "Customer email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    priority: {
      type: String,
      required: [true, "Priority is required"],
      enum: {
        values: ["Low", "Medium", "High"],
        message: "{VALUE} is not a valid priority (Low, Medium, High)",
      },
      default: "Medium",
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["Open", "In Progress", "Resolved"],
        message: "{VALUE} is not a valid status (Open, In Progress, Resolved)",
      },
      default: "Open",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

ticketSchema.pre("save", async function (next) {
  if (!this.ticketId) {
    try {
      const lastTicket = await this.constructor
        .findOne({}, {}, { sort: { createdAt: -1 } })
        .exec();

      let nextNum = 1001;
      if (lastTicket && lastTicket.ticketId && lastTicket.ticketId.startsWith("TCK-")) {
        const parts = lastTicket.ticketId.split("-");
        const parsed = parseInt(parts[1], 10);
        if (!isNaN(parsed)) {
          nextNum = parsed + 1;
        }
      } else {
        const count = await this.constructor.countDocuments();
        nextNum = 1001 + count;
      }

      this.ticketId = `TCK-${nextNum}`;
    } catch (err) {
      this.ticketId = `TCK-${Date.now().toString().slice(-6)}`;
    }
  }
  next();
});

const TicketModel = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);

export default TicketModel;
