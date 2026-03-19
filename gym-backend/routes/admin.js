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
router.delete('/services/:id', auth(['Admin']), adminCtrl.deleteService);

// Абонементы
router.get('/membership-types', auth(), adminCtrl.getMembershipTypes);
router.post('/membership-types', auth(['Admin']), adminCtrl.createMembershipType);

// Залы
router.get('/halls', auth(), adminCtrl.getHalls);
router.post('/halls', auth(['Admin']), adminCtrl.createHall);
router.delete('/halls/:id', auth(['Admin']), adminCtrl.deleteHall);

// Тренеры
router.get('/trainers', auth(), trainerCtrl.getAllTrainers);
router.post('/trainers', auth(['Admin']), trainerCtrl.createTrainer);
router.delete('/trainers/:id', auth(['Admin']), trainerCtrl.deleteTrainer);

// Расписание
router.get('/schedule', auth(), scheduleCtrl.getSchedule);
router.post('/schedule', auth(['Admin']), scheduleCtrl.createSchedule);

// Управление пользователями и оплатой
router.get('/users', auth(['Admin']), adminCtrl.getAllUsers);
router.delete('/users/:id', auth(['Admin']), adminCtrl.deleteUser);
router.get('/payments', auth(['Admin']), adminCtrl.getAllPayments);

// Связь с пользователями
router.get('/messages', auth(['Admin']), adminCtrl.getMessages);
router.delete('/messages/:id', auth(['Admin']), adminCtrl.deleteMessage);

// Управление абонементами
router.delete('/membership-types/:id', auth(['Admin']), adminCtrl.deleteMembershipType);

module.exports = router;