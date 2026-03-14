const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Контроллеры
const adminCtrl = require('../controllers/adminController');
const trainerCtrl = require('../controllers/trainerController');
const scheduleCtrl = require('../controllers/scheduleController');

// Статистика (Админ-панель)
router.get('/stats', auth(['Admin']), adminCtrl.getDashboardStats);

// Услуги
router.get('/services', auth(), adminCtrl.getServices);
router.post('/services', auth(['Admin']), adminCtrl.createService);

// Абонементы
router.get('/membership-types', auth(), adminCtrl.getMembershipTypes);
router.post('/membership-types', auth(['Admin']), adminCtrl.createMembershipType);

// Залы
router.get('/halls', auth(), adminCtrl.getHalls);
router.post('/halls', auth(['Admin']), adminCtrl.createHall);

// Тренеры
router.get('/trainers', auth(), trainerCtrl.getAllTrainers);
router.post('/trainers', auth(['Admin']), trainerCtrl.createTrainer);
router.delete('/trainers/:id', auth(['Admin']), trainerCtrl.deleteTrainer);

// Расписание
router.get('/schedule', auth(), scheduleCtrl.getSchedule);
router.post('/schedule', auth(['Admin']), scheduleCtrl.createSchedule);

module.exports = router;