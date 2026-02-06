import { Router } from "express";
import { protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { CreditNoteSchema, updateCreditNote } from "./creditNote.validation";
import { createCreditNoteController, deleteCreditNoteController, getAllCreditNoteController, getCreditNoteByIdController, getNextCreditNoteNumberController, updateCreditNoteController } from "./creditNote.controller";

const router = Router();

router.post("/creditNote/create-credit-note", protect, validate(CreditNoteSchema), restrictToRoles("admin"), createCreditNoteController)

router.get("/creditNote/get-all-credit-notes", protect, restrictToRoles("admin"), getAllCreditNoteController)

router.get("/creditNote/get-single-credit-note/:id", protect, restrictToRoles("admin"), getCreditNoteByIdController)

router.put("/creditNote/update-credit-note/:id", protect, validate(updateCreditNote), restrictToRoles("admin"), updateCreditNoteController)

router.delete("/creditNote/delete-credit-note/:id", protect, restrictToRoles("admin"), deleteCreditNoteController)

router.get("/creditNote/get-next-credit-note-number", protect, restrictToRoles('admin'), getNextCreditNoteNumberController)


export default router;