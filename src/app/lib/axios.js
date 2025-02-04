import axios from 'axios';

const api = axios.create({
    baseURL: 'https://logisticsappbackend.vercel.app/api', // Replace with your API base URL
    //aseURL: 'http://localhost:9001/api',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true // if your backend requires cookies
});

export default api;