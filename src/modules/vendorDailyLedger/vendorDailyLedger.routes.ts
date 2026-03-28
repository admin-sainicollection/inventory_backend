import { Router } from "express";
import { addVendorDailyLedgerValidation, updateVendorDailyLedgerValidation } from './vendorDailyLedger.validation';
import { addVendorLedger, editVendorLedger, deleteVendorLedger, getVendorLedgerByVendorIdController, getAllVendorLedgersController, getVendorLedgerByIdController, getVendorLedgerSummaryController } from "./vendorDailyLedger.controller";
import { authorizePermission, protect, restrictToRoles } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";

const router = Router();

router.post("/vendorDailyLedger/add-vendor-ledger",
    protect,
    validate(addVendorDailyLedgerValidation),
    authorizePermission('vendor:create'),
    addVendorLedger
);

router.put("/vendorDailyLedger/update-vendor-ledger/:id",
    protect,
    validate(updateVendorDailyLedgerValidation),
    authorizePermission('vendor:update'),
    editVendorLedger
);

router.delete("/vendorDailyLedger/delete-vendor-ledger/:id",
    protect,
    restrictToRoles("admin"),
    deleteVendorLedger
);

router.get("/vendorDailyLedger/get-vendor-ledger/:vendorId",
    protect,
    authorizePermission('vendor:read'),
    getVendorLedgerByVendorIdController
);

router.get("/vendorDailyLedger/get-vendor-single-ledger/:id",
    protect,
    authorizePermission('vendor:read'),
    getVendorLedgerByIdController
);

router.get("/vendorDailyLedger/get-vendor-all-ledger",
    protect,
    authorizePermission('vendor:read'),
    getAllVendorLedgersController
);

router.get("/vendorDailyLedger/get-vendor-ledger-summary/:vendorId",
    protect,
    authorizePermission('vendor:read'),
    getVendorLedgerSummaryController
);

export default router;