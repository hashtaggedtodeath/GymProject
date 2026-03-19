const { sql, poolPromise } = require('../config/db');

// Покупка абонемента
exports.buyMembership = async (req, res) => {
    const { typeId } = req.body;
    const clientId = req.user.id; // Берем ID из токена

    try {
        const pool = await poolPromise;

        // 1. Получаем инфо о типе абонемента
        const typeRes = await pool.request()
            .input('id', sql.Int, typeId)
            .query('SELECT * FROM MembershipTypes WHERE TypeID = @id');
        
        const type = typeRes.recordset[0];
        if (!type) return res.status(404).json({ message: "Тип абонемента не найден" });

        // 2. Рассчитываем дату окончания
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + type.DurationDays);

        // 3. Создаем абонемент клиенту
        await pool.request()
            .input('cId', sql.Int, clientId)
            .input('tId', sql.Int, typeId)
            .input('end', sql.DateTime, endDate)
            .input('limit', sql.Int, type.VisitsLimit)
            .query(`
                INSERT INTO ClientMemberships (ClientID, TypeID, StartDate, EndDate, RemainingVisits)
                VALUES (@cId, @tId, GETDATE(), @end, @limit)
            `);

        // 4. Фиксируем платеж
        await pool.request()
            .input('cId', sql.Int, clientId)
            .input('amount', sql.Decimal(10, 2), type.Price)
            .input('desc', sql.NVarChar, `Покупка абонемента: ${type.Name}`)
            .query('INSERT INTO Payments (ClientID, Amount, Description) VALUES (@cId, @amount, @desc)');

        res.status(201).json({ message: "Абонемент успешно оформлен" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Запись на тренировку
exports.bookSession = async (req, res) => {
    const { scheduleId } = req.body;
    const clientId = req.user.id;

    try {
        const pool = await poolPromise;

        // 1. Проверяем наличие активного абонемента с занятиями
        const membershipRes = await pool.request()
            .input('cId', sql.Int, clientId)
            .query(`
                SELECT TOP 1 MembershipID, RemainingVisits 
                FROM ClientMemberships 
                WHERE ClientID = @cId AND EndDate >= GETDATE() AND (RemainingVisits > 0 OR RemainingVisits IS NULL)
                ORDER BY EndDate ASC
            `);

        const membership = membershipRes.recordset[0];
        if (!membership) return res.status(403).json({ message: "Нет активного абонемента или закончились занятия" });

        // 2. Проверяем наличие мест в зале
        const scheduleRes = await pool.request()
            .input('sId', sql.Int, scheduleId)
            .query(`
                SELECT s.MaxClients, (SELECT COUNT(*) FROM Bookings WHERE ScheduleID = @sId) as BookedCount
                FROM Schedules s WHERE s.ScheduleID = @sId
            `);
        
        const schedule = scheduleRes.recordset[0];
        if (schedule.BookedCount >= schedule.MaxClients) {
            return res.status(400).json({ message: "В группе нет свободных мест" });
        }
        //3. Проверяем есть ли запись
        const check = await pool.request()
            .input('cId', sql.Int, clientId)
            .input('sId', sql.Int, scheduleId)
            .query("SELECT BookingID FROM Bookings WHERE ClientID = @cId AND ScheduleID = @sId AND Status = 'Confirmed'");

        if (check.recordset.length > 0) {
            return res.status(400).json({ message: "Вы уже записаны" });
        }

        // 4. Создаем запись
        await pool.request()
            .input('cId', sql.Int, clientId)
            .input('sId', sql.Int, scheduleId)
            .query("INSERT INTO Bookings (ClientID, ScheduleID, Status) VALUES (@cId, @sId, 'Confirmed')");

        // 5. Списываем посещение (если не безлимит)
        if (membership.RemainingVisits !== null) {
            await pool.request()
                .input('mId', sql.Int, membership.MembershipID)
                .query('UPDATE ClientMemberships SET RemainingVisits = RemainingVisits - 1 WHERE MembershipID = @mId');
        }

        res.status(201).json({ message: "Вы успешно записаны" });
    } catch (err) {
        console.error("Ошибка при записи:", err.message);
        res.status(500).json({ error: err.message });
    }
};


// Отмена записи
exports.cancelBooking = async (req, res) => {
    const { scheduleId } = req.body;
    const clientId = req.user.id;

    try {
        const pool = await poolPromise;

        // 1. Проверяем, существует ли активная запись
        // Важно: используем одинарные кавычки для строк в SQL
        const bookingRes = await pool.request()
            .input('cId', sql.Int, clientId)
            .input('sId', sql.Int, scheduleId)
            .query("SELECT TOP 1 BookingID FROM Bookings WHERE ClientID = @cId AND ScheduleID = @sId AND Status = 'Confirmed'");

        const booking = bookingRes.recordset[0];

        if (!booking) {
            console.log("Booking not found or already cancelled for scheduleId:", scheduleId);
            return res.status(404).json({ message: "Запись не найдена или уже отменена" });
        }

        // 2. Начинаем транзакцию или последовательное обновление
        // Сначала меняем статус записи
        await pool.request()
            .input('bId', sql.Int, booking.BookingID)
            .query("UPDATE Bookings SET Status = 'Cancelled' WHERE BookingID = @bId");

        // 3. Возвращаем занятие на самый свежий активный абонемент
        // Мы ищем абонемент, который еще не истек и у которого есть лимит посещений
        await pool.request()
            .input('cId', sql.Int, clientId)
            .query(`
                UPDATE ClientMemberships 
                SET RemainingVisits = RemainingVisits + 1 
                WHERE MembershipID = (
                    SELECT TOP 1 MembershipID 
                    FROM ClientMemberships 
                    WHERE ClientID = @cId 
                    AND EndDate >= GETDATE() 
                    AND RemainingVisits IS NOT NULL
                    ORDER BY EndDate ASC
                )
            `);

        console.log(`✅ Успешная отмена записи ${booking.BookingID} для клиента ${clientId}`);
        res.json({ message: "Запись успешно отменена" });

    } catch (err) {
        // Выводим ошибку в терминал бэкенда, чтобы понять в чем дело
        console.error("❌ Ошибка в cancelBooking:", err.message);
        res.status(500).json({ error: "Ошибка сервера при отмене записи" });
    }
};

// История посещений и платежей
exports.getClientHistory = async (req, res) => {
    const clientId = req.user.id;
    try {
        const pool = await poolPromise;
        const bookings = await pool.request()
            .input('cId', sql.Int, clientId)
            .query(`
                SELECT b.BookingID, s.ScheduleID, s.StartTime, srv.Name as ServiceName, t.FullName as TrainerName
                FROM Bookings b
                JOIN Schedules s ON b.ScheduleID = s.ScheduleID
                JOIN Services srv ON s.ServiceID = srv.ServiceID
                JOIN Trainers t ON s.TrainerID = t.TrainerID
                WHERE b.ClientID = @cId AND b.Status = 'Confirmed' -- ПОКАЗЫВАЕМ ТОЛЬКО ПОДТВЕРЖДЕННЫЕ
                ORDER BY s.StartTime DESC
            `);
        
        const payments = await pool.request()
            .input('cId', sql.Int, clientId)
            .query('SELECT * FROM Payments WHERE ClientID = @cId ORDER BY PaymentDate DESC');

        res.json({ bookings: bookings.recordset, payments: payments.recordset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};