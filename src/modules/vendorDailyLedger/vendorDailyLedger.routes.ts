import { Router } from "express";
import { addVendorDailyLedgerValidation, updateVendorDailyLedgerValidation } from './vendorDailyLedger.validation';
import { addVendorLedger, editVendorLedger, deleteVendorLedger, getVendorLedgerByVendorIdController, getAllVendorLedgersController, getVendorLedgerByIdController, getVendorLedgerSummaryController } from "./vendorDailyLedger.controller";
import { protect, restrictToRoles } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";

const router = Router();

router.post("/vendorDailyLedger/add-vendor-ledger",
    protect,
    validate(addVendorDailyLedgerValidation),
    restrictToRoles("admin"),
    addVendorLedger
);

router.put("/vendorDailyLedger/update-vendor-ledger/:id",
    protect,
    validate(updateVendorDailyLedgerValidation),
    restrictToRoles("admin"),
    editVendorLedger
);

router.delete("/vendorDailyLedger/delete-vendor-ledger/:id",
    protect,
    restrictToRoles("admin"),
    deleteVendorLedger
);

router.get("/vendorDailyLedger/get-vendor-ledger/:vendorId",
    protect,
    restrictToRoles("admin"),
    getVendorLedgerByVendorIdController
);

router.get("/vendorDailyLedger/get-vendor-single-ledger/:id",
    protect,
    restrictToRoles("admin"),
    getVendorLedgerByIdController
);

router.get("/vendorDailyLedger/get-vendor-all-ledger",
    protect,
    restrictToRoles("admin"),
    getAllVendorLedgersController
);

router.get("/vendorDailyLedger/get-vendor-ledger-summary/:vendorId",
    protect,
    restrictToRoles("admin"),
    getVendorLedgerSummaryController
);

export default router;