import axios from "axios";

const apiClient = axios.create({
    // Later read this URL from an environment variable
    baseURL: "http://localhost:5000"
});

apiClient.interceptors.response.use(
    (response) => {
        return response;
    }, 

    (error) => {
        let res = error.response;
        
        if (res.status === 401) {
            window.location.href = 'https://example.com/login';
        }
        
        console.error('Looks like there was a problem. Status Code: ' + res.status);
        
        return Promise.reject(error);
    }
);
  
export default apiClient;