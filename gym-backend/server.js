const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { poolPromise } = require('./config/db');

const app = express();

// Middleware
app.use(cors()); // Разрешаем кросс-доменные запросы (для связи с React)
app.use(express.json()); // Позволяет серверу понимать JSON в теле запроса

// Импорт роутов
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const clientRoutes = require('./routes/client');
const reportRoutes = require('./routes/report');

// Подключение роутов
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/reports', reportRoutes);



// Базовый тестовый роут
app.get('/', (req, res) => {
    res.send('Gym Management API is running...');
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Что-то пошло не так на сервере!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

const PORT = process.env.PORT || 5000;

// Проверка подключения к БД перед запуском сервера
poolPromise.then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Сервер запущен на порту ${PORT}`);
    });
}).catch(err => {
    console.error('❌ Ошибка: Не удалось подключиться к БД. Сервер не запущен.', err);
});