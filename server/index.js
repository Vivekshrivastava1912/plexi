import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
import userRouter from "./route/user.route.js";
import ticketRouter from "./route/ticket.route.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (req.url.startsWith("/api/api/")) {
    req.url = req.url.replace(/^\/api\/api\//, "/api/");
  }
  next();
});

app.get("/api/health", (request, response) => {
  return response.status(200).json({
    message: "Server is healthy and running",
    error: false,
    success: true,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", userRouter);
app.use("/api/tickets", ticketRouter);

app.use("/api/*", (request, response) => {
  return response.status(404).json({
    message: `API endpoint not found: ${request.method} ${request.originalUrl}`,
    error: true,
    success: false,
  });
});

app.use((err, request, response, next) => {
  return response.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
    error: true,
    success: false,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  connectDB();
});

export default app;
