const express = require('express');
const router = express.Router();
const reportCtrl = require('../controllers/reportController');
const auth = require('../middleware/auth');

// JSON данные для отрисовки графиков во фронтенде
router.get('/stats/revenue', auth(['Admin']), reportCtrl.getRevenueStats);
router.get('/stats/services', auth(['Admin']), reportCtrl.getServicePopularity);

// Файлы для скачивания
router.get('/export/excel', auth(['Admin']), reportCtrl.exportPaymentsExcel);
router.get('/export/pdf', auth(['Admin']), reportCtrl.exportAttendancePDF);

module.exports = router;