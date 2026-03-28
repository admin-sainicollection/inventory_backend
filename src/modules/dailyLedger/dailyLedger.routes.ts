import { Router } from "express";
import { addDailyLedgerValidation, updateDailyLedgerValidation } from './dailyLedger.validation';
import { addLedger, editLedger, deleteLedger, getLedgerByPartyIdController, getAllLedgersController, getLedgerByIdController, getPartyLedgerSummary } from "./dailyLedger.controller";
import { authorizePermission, protect, restrictToRoles } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";

const router = Router();

router.post("/dailyLedger/add-ledger",
    protect,
    validate(addDailyLedgerValidation),
    authorizePermission('ledger:create'),
    addLedger
);

router.put("/dailyLedger/update-ledger/:id",
    protect,
    validate(updateDailyLedgerValidation),
    authorizePermission('ledger:update'),
    editLedger
);

router.delete("/dailyLedger/delete-ledger/:id",
    protect,
    restrictToRoles("admin"),
    deleteLedger
);

router.get("/dailyLedger/get-party-ledger/:partyId",
    protect,
    authorizePermission('ledger:read'),
    getLedgerByPartyIdController
);

router.get("/dailyLedger/get-single-ledger/:id",
    protect,
    authorizePermission('ledger:read'),
    getLedgerByIdController
);

router.get("/dailyLedger/get-all-ledger",
    protect,
    authorizePermission('ledger:read'),
    getAllLedgersController
);

router.get("/dailyLedger/get-party-ledger-summary/:partyId",
    protect,
    authorizePermission('ledger:read'),
    getPartyLedgerSummary
);

export default router;