import axios from "axios";

const apiClient = axios.create({
    // Later read this URL from an environment variable
    baseURL: "http://localhost:5000"
});
  
export default apiClient;