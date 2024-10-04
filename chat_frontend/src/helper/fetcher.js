import axios from "axios";

// Using environment variable for API URL
const apiUrl = "http://localhost:5500/api/v1/";
// const apiUrl = "https://chat-application-1-b4z4.onrender.com/api/v1/";

const getAuthToken = () => {
    try {
        const tokenData = JSON.parse(localStorage.getItem("token"));
        if (tokenData?.token) {
            return `Bearer ${tokenData.token}`;
        }
    } catch (error) {
        console.log("Error parsing token data:", error);
    }
    return null;
}

// Create an Axios instance
const fetcher = axios.create({
    baseURL: apiUrl,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }
});

// Interceptor to add the Authorization token dynamically before each request
fetcher.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default fetcher;
