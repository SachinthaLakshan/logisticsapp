import axios from 'axios';

const api = axios.create({
    baseURL: 'https://web-production-02f7b.up.railway.app/api', // Replace with your API base URL
    //baseURL: 'http://localhost:9001/api',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true // if your backend requires cookies
});

export default api;