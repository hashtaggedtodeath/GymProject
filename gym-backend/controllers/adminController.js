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

// --- ПРОСТАЯ АНАЛИТИКА (Для админ-панели) ---
exports.getDashboardStats = async (req, res) => {
    try {
        const pool = await poolPromise;
        const stats = {};
        
        // Кол-во активных клиентов
        const clients = await pool.request().query('SELECT COUNT(*) as count FROM Users WHERE RoleID = 2');
        stats.totalClients = clients.recordset[0].count;

        // Общий доход
        const revenue = await pool.request().query('SELECT SUM(Amount) as total FROM Payments');
        stats.totalRevenue = revenue.recordset[0].total || 0;

        // Кол-во предстоящих тренировок
        const sessions = await pool.request().query('SELECT COUNT(*) as count FROM Schedules WHERE StartTime > GETDATE()');
        stats.upcomingSessions = sessions.recordset[0].count;

        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};