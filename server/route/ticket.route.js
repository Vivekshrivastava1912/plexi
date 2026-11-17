import { Router } from "express";
import {
  createTicketController,
  getAllTicketsController,
  getTicketSummaryController,
  getTicketDetailsController,
  updateTicketController,
  deleteTicketController,
} from "../controllers/ticket.controller.js";
import { protect } from "../middleware/auth.js";

const ticketRouter = Router();

ticketRouter.use(protect);

ticketRouter.route("/")
  .post(createTicketController)
  .get(getAllTicketsController);

ticketRouter.get("/summary", getTicketSummaryController);

ticketRouter.route("/:id")
  .get(getTicketDetailsController)
  .put(updateTicketController)
  .delete(deleteTicketController);

export default ticketRouter;

