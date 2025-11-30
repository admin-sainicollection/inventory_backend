import { Router } from "express";
import { addDailyLedgerValidation, updateDailyLedgerValidation } from './dailyLedger.validation';
import { addLedger, editLedger, deleteLedger, getLedgerByPartyIdController, getAllLedgersController, getLedgerByIdController, getPartyLedgerSummary } from "./dailyLedger.controller";
import { protect, restrictToRoles } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";

const router = Router();

router.post("/dailyLedger/add-ledger",
    protect,
    validate(addDailyLedgerValidation),
    restrictToRoles("admin"),
    addLedger
);

router.put("/dailyLedger/update-ledger/:id",
    protect,
    validate(updateDailyLedgerValidation),
    restrictToRoles("admin"),
    editLedger
);

router.delete("/dailyLedger/delete-ledger/:id",
    protect,
    restrictToRoles("admin"),
    deleteLedger
);

router.get("/dailyLedger/get-party-ledger/:partyId",
    protect,
    restrictToRoles("admin"),
    getLedgerByPartyIdController
);

router.get("/dailyLedger/get-single-ledger/:id",
    protect,
    restrictToRoles("admin"),
    getLedgerByIdController
);

router.get("/dailyLedger/get-all-ledger",
    protect,
    restrictToRoles("admin"),
    getAllLedgersController
);

router.get("/dailyLedger/get-party-ledger-summary/:partyId",
    protect,
    restrictToRoles("admin"),
    getPartyLedgerSummary
);

export default router;