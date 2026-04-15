import { Router } from "express";
import { authorizePermission, protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { CreditNoteSchema, updateCreditNote } from "./creditNote.validation";
import { createCreditNoteController, deleteCreditNoteController, getAllCreditNoteController, getCreditNoteByIdController, getNextCreditNoteNumberController, updateCreditNoteController } from "./creditNote.controller";

const router = Router();

router.post("/creditNote/create-credit-note", protect, validate(CreditNoteSchema), authorizePermission('credit-note:create'), createCreditNoteController)

router.get("/creditNote/get-all-credit-notes", protect, authorizePermission('credit-note:list'), getAllCreditNoteController)

router.get("/creditNote/get-single-credit-note/:id", protect, authorizePermission('credit-note:read'), getCreditNoteByIdController)

router.put("/creditNote/update-credit-note/:id", protect, validate(updateCreditNote), authorizePermission('credit-note:update'), updateCreditNoteController)

router.delete("/creditNote/delete-credit-note/:id", protect, restrictToRoles("admin"), deleteCreditNoteController)

router.get("/creditNote/get-next-credit-note-number", protect, authorizePermission('credit-note:read'), getNextCreditNoteNumberController)


export default router;