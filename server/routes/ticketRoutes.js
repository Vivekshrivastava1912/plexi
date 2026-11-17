const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicketSummary,
  getTicketById,
  updateTicket,
  deleteTicket,
} = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');

// All ticket routes are protected by authentication middleware
router.use(protect);

router.route('/')
  .post(createTicket)
  .get(getTickets);

router.get('/summary', getTicketSummary);

router.route('/:id')
  .get(getTicketById)
  .put(updateTicket)
  .delete(deleteTicket);

module.exports = router;

