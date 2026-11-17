export const baseURL = "";

const SummaryApi = {
  register: {
    url: "/api/auth/register",
    method: "post",
  },
  login: {
    url: "/api/auth/login",
    method: "post",
  },
  userDetails: {
    url: "/api/auth/me",
    method: "get",
  },
  createTicket: {
    url: "/api/tickets",
    method: "post",
  },
  getAllTickets: {
    url: "/api/tickets",
    method: "get",
  },
  getTicketSummary: {
    url: "/api/tickets/summary",
    method: "get",
  },
  getTicketDetails: (id) => ({
    url: `/api/tickets/${id}`,
    method: "get",
  }),
  updateTicket: (id) => ({
    url: `/api/tickets/${id}`,
    method: "put",
  }),
  deleteTicket: (id) => ({
    url: `/api/tickets/${id}`,
    method: "delete",
  }),
};

export default SummaryApi;
