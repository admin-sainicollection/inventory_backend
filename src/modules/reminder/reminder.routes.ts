import Router from 'express';
import { authorizePermission, protect, restrictToRoles } from '../../middlewares/auth.middleware';
import { createReminderController, deleteReminderController, getAllReminderController, getReminderByDateController, getReminderByIdController, updateReminderController } from './reminder.controller';

const router = Router();

router.post('/reminder/create-reminder', protect, authorizePermission('reminder:create'), createReminderController);
router.get('/reminder/get-single-reminder/:id', protect, authorizePermission('reminder:read'), getReminderByIdController);
router.get('/reminder/get-all-reminders', protect, authorizePermission('reminder:list'), getAllReminderController);
router.get('/reminder/get-reminder-by-date', protect, authorizePermission('reminder:list'), getReminderByDateController);
router.put('/reminder/update-reminder/:id', protect, authorizePermission('reminder:update'), updateReminderController);
router.delete('/reminder/delete-reminder/:id', protect, restrictToRoles("admin"), deleteReminderController);

export default router;