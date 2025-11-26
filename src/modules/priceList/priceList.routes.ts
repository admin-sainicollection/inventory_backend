// routes/priceListRoutes.ts
import { Router } from 'express';
import { priceListController } from './priceList.controller';
import { validate } from '../../middlewares/validate.middleware';
import { bulkCreatePriceListSchemaValidation, createPriceListSchemaValidation, updatePriceListSchemaValidation } from './priceList.validation';
import { protect, restrictToRoles } from '../../middlewares/auth.middleware';

const router = Router();

// Create new price list entry
router.post('/priceList/create-priceList', protect, restrictToRoles("admin"), validate(createPriceListSchemaValidation), priceListController.createPriceList);

// Bulk create price list entries
router.post('/priceList/create-priceList-bulk', protect, restrictToRoles("admin"), validate(bulkCreatePriceListSchemaValidation), priceListController.bulkCreatePriceList);

// Get all price lists with search, pagination and filters
// Supports: 
// - search: search across multiple fields
// - status: filter by status
// - vendorName: filter by vendor
// - carBrand: filter by car brand
// - productBrand: filter by product brand
// - page: pagination page
// - limit: items per page
router.get('/priceList/get-all-pricelist', protect, restrictToRoles("admin"),  priceListController.getAllPriceLists);

// Get price list by ID
router.get('/priceList/get-one-pricelist/:id',  protect, restrictToRoles("admin"),priceListController.getPriceListById);

// Update price list
router.put('/priceList/update-pricelist/:id',  protect, restrictToRoles("admin"),validate(updatePriceListSchemaValidation), priceListController.updatePriceList);

// Delete price list
router.delete('/priceList/delete-pricelist/:id', protect, restrictToRoles("admin"), priceListController.deletePriceList);

export default router;