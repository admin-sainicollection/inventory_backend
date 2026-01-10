import Router from 'express';
import { createEnquiryController, getEnquiryByIdController, getAllEnquiriesController, updateEnquiryController, deleteEnquiryController, getEnquiryStatisticsController, convertEnquiryController, getFollowUpEnquiriesController } from './enquiry.controller';
import { protect, restrictToRoles } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/enquiry/create-enquiry', protect, restrictToRoles("admin"), createEnquiryController);
router.get('/enquiry/get-single-enquiry/:id', protect, getEnquiryByIdController);
router.get('/enquiry/get-all-enquiries', protect, getAllEnquiriesController);
router.put('/enquiry/update-enquiry/:id', protect, restrictToRoles("admin"), updateEnquiryController);
router.delete('/enquiry/delete-enquiry/:id', protect, restrictToRoles("admin"), deleteEnquiryController);
router.get('/enquiry/get-enquiry-statistics', protect, getEnquiryStatisticsController);
router.post('/enquiry/convert-enquiry/:id', protect, restrictToRoles("admin"), convertEnquiryController);
router.get('/enquiry/get-follow-up-enquiries/:id', protect, getFollowUpEnquiriesController);

export default router;
