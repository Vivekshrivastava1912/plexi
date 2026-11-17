import Axios from "../utils/Axios.js";
import SummaryApi from "../common/SummaryApi.js";

export const authAPI = {
  register: async (userData) => {
    const response = await Axios({
      ...SummaryApi.register,
      data: userData,
    });
    return response.data;
  },
  login: async (credentials) => {
    const response = await Axios({
      ...SummaryApi.login,
      data: credentials,
    });
    return response.data;
  },
  getMe: async () => {
    const response = await Axios({
      ...SummaryApi.userDetails,
    });
    return response.data;
  },
};

export const ticketAPI = {
  getAll: async (params = {}) => {
    const response = await Axios({
      ...SummaryApi.getAllTickets,
      params,
    });
    return response.data;
  },
  getSummary: async () => {
    const response = await Axios({
      ...SummaryApi.getTicketSummary,
    });
    return response.data;
  },
  getById: async (id) => {
    const endpoint = SummaryApi.getTicketDetails(id);
    const response = await Axios({
      ...endpoint,
    });
    return response.data;
  },
  create: async (ticketData) => {
    const response = await Axios({
      ...SummaryApi.createTicket,
      data: ticketData,
    });
    return response.data;
  },
  update: async (id, ticketData) => {
    const endpoint = SummaryApi.updateTicket(id);
    const response = await Axios({
      ...endpoint,
      data: ticketData,
    });
    return response.data;
  },
  updateStatus: async (id, status) => {
    const endpoint = SummaryApi.updateTicket(id);
    const response = await Axios({
      ...endpoint,
      data: { status },
    });
    return response.data;
  },
  delete: async (id) => {
    const endpoint = SummaryApi.deleteTicket(id);
    const response = await Axios({
      ...endpoint,
    });
    return response.data;
  },
};

export default Axios;
