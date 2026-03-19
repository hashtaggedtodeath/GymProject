const { sql, poolPromise } = require('../config/db');

exports.getSchedule = async (req, res) => {
    try {
        const clientId = req.user.id; // ID текущего пользователя из токена
        const pool = await poolPromise;
        
        const result = await pool.request()
            .input('cId', sql.Int, clientId)
            .query(`
                SELECT 
                    s.ScheduleID, s.StartTime, s.EndTime, s.MaxClients,
                    t.FullName as TrainerName, 
                    h.Name as HallName, 
                    srv.Name as ServiceName,
                    -- Проверяем, записан ли текущий юзер
                    (SELECT COUNT(*) FROM Bookings b WHERE b.ScheduleID = s.ScheduleID AND b.ClientID = @cId AND b.Status != 'Cancelled') as IsBooked,
                    -- Считаем общее кол-во занятых мест
                    (SELECT COUNT(*) FROM Bookings b WHERE b.ScheduleID = s.ScheduleID AND b.Status != 'Cancelled') as EnrolledCount
                FROM Schedules s
                JOIN Trainers t ON s.TrainerID = t.TrainerID
                JOIN Halls h ON s.HallID = h.HallID
                JOIN Services srv ON s.ServiceID = srv.ServiceID
                WHERE s.StartTime >= GETDATE()
                ORDER BY s.StartTime ASC
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createSchedule = async (req, res) => {
    const { trainerId, hallId, serviceId, startTime, endTime, maxClients } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('tId', sql.Int, trainerId)
            .input('hId', sql.Int, hallId)
            .input('sId', sql.Int, serviceId)
            .input('start', sql.DateTime, startTime)
            .input('end', sql.DateTime, endTime)
            .input('max', sql.Int, maxClients)
            .query(`
                INSERT INTO Schedules (TrainerID, HallID, ServiceID, StartTime, EndTime, MaxClients)
                VALUES (@tId, @hId, @sId, @start, @end, @max)
            `);
        res.status(201).json({ message: "Schedule entry created" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};