import Router from 'express';
import { createEnquiryController, getEnquiryByIdController, getAllEnquiriesController, updateEnquiryController, deleteEnquiryController, getEnquiryStatisticsController, convertEnquiryController, getFollowUpEnquiriesController } from './enquiry.controller';
import { authorizePermission, protect, restrictToRoles } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/enquiry/create-enquiry', protect, authorizePermission('enquiry:create'), createEnquiryController);
router.get('/enquiry/get-single-enquiry/:id', protect, authorizePermission('enquiry:read'), getEnquiryByIdController);
router.get('/enquiry/get-all-enquiries', protect, authorizePermission('enquiry:list'), getAllEnquiriesController);
router.put('/enquiry/update-enquiry/:id', protect, authorizePermission('enquiry:update'), updateEnquiryController);
router.delete('/enquiry/delete-enquiry/:id', protect, restrictToRoles("admin"), deleteEnquiryController);
router.get('/enquiry/get-enquiry-statistics', protect, authorizePermission('enquiry:read'), getEnquiryStatisticsController);
router.post('/enquiry/convert-enquiry/:id', protect, convertEnquiryController);
router.get('/enquiry/get-follow-up-enquiries/:id', protect, getFollowUpEnquiriesController);

export default router;
