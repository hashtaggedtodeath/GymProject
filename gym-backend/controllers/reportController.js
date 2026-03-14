const { sql, poolPromise } = require('../config/db');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// 1. Аналитика: Доходы по типам абонементов (JSON для графиков)
exports.getRevenueStats = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT mt.Name, SUM(p.Amount) as TotalRevenue, COUNT(p.PaymentID) as SalesCount
            FROM Payments p
            JOIN ClientMemberships cm ON p.ClientID = cm.ClientID
            JOIN MembershipTypes mt ON cm.TypeID = mt.TypeID
            GROUP BY mt.Name
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Аналитика: Популярность услуг (по количеству записей)
exports.getServicePopularity = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT srv.Name, COUNT(b.BookingID) as BookingsCount
            FROM Bookings b
            JOIN Schedules s ON b.ScheduleID = s.ScheduleID
            JOIN Services srv ON s.ServiceID = srv.ServiceID
            GROUP BY srv.Name
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Экспорт отчета по платежам в Excel
exports.exportPaymentsExcel = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT p.PaymentID, u.FullName, p.Amount, p.PaymentDate, p.Description
            FROM Payments p
            JOIN Users u ON p.ClientID = u.UserID
            ORDER BY p.PaymentDate DESC
        `);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Платежи');

        worksheet.columns = [
            { header: 'ID', key: 'PaymentID', width: 10 },
            { header: 'Клиент', key: 'FullName', width: 30 },
            { header: 'Сумма', key: 'Amount', width: 15 },
            { header: 'Дата', key: 'PaymentDate', width: 20 },
            { header: 'Описание', key: 'Description', width: 40 }
        ];

        worksheet.addRows(result.recordset);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=payments_report.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Экспорт отчета по посещаемости в PDF
exports.exportAttendancePDF = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT b.BookingDate, u.FullName as ClientName, srv.Name as ServiceName, t.FullName as TrainerName
            FROM Bookings b
            JOIN Users u ON b.ClientID = u.UserID
            JOIN Schedules s ON b.ScheduleID = s.ScheduleID
            JOIN Services srv ON s.ServiceID = srv.ServiceID
            JOIN Trainers t ON s.TrainerID = t.TrainerID
        `);

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.pdf');

        doc.pipe(res);
        doc.fontSize(20).text('Отчет по посещаемости залов', { align: 'center' });
        doc.moveDown();

        result.recordset.forEach(row => {
            doc.fontSize(12).text(
                `${new Date(row.BookingDate).toLocaleDateString()} | ${row.ClientName} | ${row.ServiceName} (Тренер: ${row.TrainerName})`
            );
            doc.moveDown(0.5);
        });

        doc.end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};