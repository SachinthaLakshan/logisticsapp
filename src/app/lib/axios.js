import axios from 'axios';

const api = axios.create({
    baseURL: 'https://logisticsappbackend-962b1cb545ad.herokuapp.com/api', // Replace with your API base URL
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true // if your backend requires cookies
});

export default api;