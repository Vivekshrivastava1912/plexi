import axios from "axios";

const Axios = axios.create({
  baseURL: "",
  headers: {
    "Content-Type": "application/json",
  },
});

Axios.interceptors.request.use(
  async (config) => {
    if (config.url) {
      config.url = config.url.replace(/^\/api\/api\//, "/api/");
    }
    const token = localStorage.getItem("token") || localStorage.getItem("support_ticket_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

Axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("support_ticket_token");
      localStorage.removeItem("user");
      localStorage.removeItem("support_ticket_user");

      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login?expired=true";
      }
    }
    return Promise.reject(error);
  }
);

export default Axios;
