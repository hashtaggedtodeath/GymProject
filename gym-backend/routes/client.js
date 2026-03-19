const express = require('express');
const router = express.Router();
const clientCtrl = require('../controllers/clientController');
const auth = require('../middleware/auth');

// Все роуты ниже требуют авторизации (роль по умолчанию - Client)
router.post('/buy-membership', auth(), clientCtrl.buyMembership);
router.post('/book-session', auth(), clientCtrl.bookSession);
router.get('/history', auth(), clientCtrl.getClientHistory);
router.post('/cancel-booking', auth(), clientCtrl.cancelBooking);
router.post('/support', auth(), clientCtrl.sendSupportMessage);

// Получение инфо о текущем абонементе
router.get('/my-membership', auth(), async (req, res) => {
    const { sql, poolPromise } = require('../config/db');
    const pool = await poolPromise;
    const result = await pool.request()
        .input('id', sql.Int, req.user.id)
        .query(`
            SELECT cm.*, mt.Name 
            FROM ClientMemberships cm 
            JOIN MembershipTypes mt ON cm.TypeID = mt.TypeID 
            WHERE cm.ClientID = @id AND cm.EndDate >= GETDATE()
        `);
    res.json(result.recordset);
});

module.exports = router;