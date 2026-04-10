import axios, { AxiosInstance } from 'axios';

// Базовый конфиг
const client: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.example.com',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Здесь можно добавить интерцепторы (например, для логов или обработки 401 ошибки)
client.interceptors.response.use(
    (response) => response.data, // Сразу прокидываем data, чтобы не писать .data в каждом вызове
    (error) => Promise.reject(error)
);

export default client;