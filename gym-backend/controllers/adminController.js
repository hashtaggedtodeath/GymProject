const { sql, poolPromise } = require('../config/db');

// --- УСЛУГИ (Services) ---
exports.getServices = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Services');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createService = async (req, res) => {
    const { name, description, price } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('n', sql.NVarChar, name)
            .input('d', sql.NVarChar, description)
            .input('p', sql.Decimal(10, 2), price)
            .query('INSERT INTO Services (Name, Description, BasePrice) VALUES (@n, @d, @p)');
        res.status(201).json({ message: "Услуга успешно добавлена" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteService = async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Services WHERE ServiceID = @id');
        res.json({ message: "Услуга удалена" });
    } catch (err) {
        res.status(500).json({ error: "Нельзя удалить услугу, которая используется в расписании" });
    }
};

// --- ТИПЫ АБОНЕМЕНТОВ (MembershipTypes) ---
exports.getMembershipTypes = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM MembershipTypes');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createMembershipType = async (req, res) => {
    const { name, price, duration, visits } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('n', sql.NVarChar, name)
            .input('p', sql.Decimal(10, 2), price)
            .input('d', sql.Int, duration)
            .input('v', sql.Int, visits)
            .query('INSERT INTO MembershipTypes (Name, Price, DurationDays, VisitsLimit) VALUES (@n, @p, @d, @v)');
        res.status(201).json({ message: "Тип абонемента создан" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- ЗАЛЫ (Halls) ---
exports.getHalls = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Halls');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createHall = async (req, res) => {
    const { name, capacity } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('n', sql.NVarChar, name)
            .input('c', sql.Int, capacity)
            .query('INSERT INTO Halls (Name, Capacity) VALUES (@n, @c)');
        res.status(201).json({ message: "Зал добавлен" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteHall = async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Halls WHERE HallID = @id');
        res.json({ message: "Зал удален" });
    } catch (err) {
        res.status(500).json({ error: "Нельзя удалить зал, в котором назначены тренировки" });
    }
};

// --- ПРОСТАЯ АНАЛИТИКА (Для админ-панели) ---
// controllers/adminController.js

exports.getDashboardStats = async (req, res) => {
    try {
        const pool = await poolPromise;
        const stats = {};
        
        // 1. Считаем РЕАЛЬНОЕ кол-во уникальных клиентов с активными абонементами
        const clients = await pool.request().query(`
            SELECT COUNT(DISTINCT ClientID) as count 
            FROM ClientMemberships 
            WHERE EndDate >= GETDATE()
        `);
        stats.activeClients = clients.recordset[0].count;

        // 2. Считаем доход (уже работал, но освежим)
        const revenue = await pool.request().query('SELECT SUM(Amount) as total FROM Payments');
        stats.totalRevenue = revenue.recordset[0].total || 0;

        // 3. Считаем тренировки именно на СЕГОДНЯ (от 00:00 до 23:59)
        const sessions = await pool.request().query(`
            SELECT COUNT(*) as count 
            FROM Schedules 
            WHERE CAST(StartTime AS DATE) = CAST(GETDATE() AS DATE)
        `);
        stats.todaySessions = sessions.recordset[0].count;

        // Дополнительно: Доходы по категориям (для графика)
        const revenueByType = await pool.request().query(`
            SELECT 
                mt.Name, 
                SUM(p.Amount) as TotalRevenue,
                COUNT(p.PaymentID) as SalesCount
            FROM Payments p
            INNER JOIN ClientMemberships cm ON p.MembershipID = cm.MembershipID -- ГЛАВНОЕ ИСПРАВЛЕНИЕ ТУТ
            INNER JOIN MembershipTypes mt ON cm.TypeID = mt.TypeID
            GROUP BY mt.Name
        `);
        stats.revenueData = revenueByType.recordset;

        res.json(stats);
    } catch (err) {
        console.error("Ошибка получения статистики:", err.message);
        res.status(500).json({ error: err.message });
    }
};
// Получить всех клиентов с информацией об их абонементах
exports.getAllUsers = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                u.UserID, u.FullName, u.Email, u.Phone, u.CreatedAt,
                mt.Name as MembershipName,
                cm.EndDate, cm.RemainingVisits
            FROM Users u
            LEFT JOIN ClientMemberships cm ON u.UserID = cm.ClientID AND cm.EndDate >= GETDATE()
            LEFT JOIN MembershipTypes mt ON cm.TypeID = mt.TypeID
            WHERE u.RoleID = 2 -- Только клиенты
            ORDER BY u.CreatedAt DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Удалить пользователя
exports.deleteUser = async (req, res) => {
    try {
        const pool = await poolPromise;
        // Сначала удаляем зависимости (в реальном проекте лучше использовать каскадное удаление в БД)
        await pool.request().input('id', sql.Int, req.params.id).query('DELETE FROM Bookings WHERE ClientID = @id');
        await pool.request().input('id', sql.Int, req.params.id).query('DELETE FROM Payments WHERE ClientID = @id');
        await pool.request().input('id', sql.Int, req.params.id).query('DELETE FROM ClientMemberships WHERE ClientID = @id');
        await pool.request().input('id', sql.Int, req.params.id).query('DELETE FROM Users WHERE UserID = @id');
        res.json({ message: "Пользователь удален" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Контроль всех платежей
exports.getAllPayments = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT p.*, u.FullName as ClientName 
            FROM Payments p 
            JOIN Users u ON p.ClientID = u.UserID 
            ORDER BY p.PaymentDate DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Получение всех сообщений от пользователя
exports.getMessages = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                m.MessageID, 
                m.MessageText, 
                m.CreatedAt, 
                m.Status,
                u.FullName as ClientName, 
                u.Email as ClientEmail, 
                u.Phone as ClientPhone
            FROM SupportMessages m
            JOIN Users u ON m.ClientID = u.UserID
            ORDER BY m.CreatedAt DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error("Ошибка при получении сообщений:", err.message);
        res.status(500).json({ error: err.message });
    }
};

// Удаление сообщений
exports.deleteMessage = async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM SupportMessages WHERE MessageID = @id');
        res.json({ message: "Сообщение удалено" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Удаление типа абонемента
exports.deleteMembershipType = async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM MembershipTypes WHERE TypeID = @id');
        res.json({ message: "Тариф удален" });
    } catch (err) { res.status(500).json({ error: "Нельзя удалить тариф, который уже куплен клиентами" }); }
};