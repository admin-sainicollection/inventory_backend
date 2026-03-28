import { Router } from "express";
import { authorizePermission, protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { debitNoteSchema, updateDebitNote } from "./debitNote.validation";
import { createDebitNoteController, deleteDebitNoteController, getAllDebitNoteController, getNextDebitNoteNumberController, getDebitNoteByIdController, updateDebitNoteController } from "./debitNote.controller";

const router = Router();

router.post("/debitNote/create-debit-note", protect, validate(debitNoteSchema), authorizePermission('debit-note:create'), createDebitNoteController)

router.get("/debitNote/get-all-debit-notes", protect, authorizePermission('debit-note:list'), getAllDebitNoteController)

router.get("/debitNote/get-single-debit-note/:id", protect, authorizePermission('debit-note:read'), getDebitNoteByIdController)

router.put("/debitNote/update-debit-note/:id", protect, validate(updateDebitNote), authorizePermission('debit-note:update'), updateDebitNoteController)

router.delete("/debitNote/delete-debit-note/:id", protect, restrictToRoles("admin"), deleteDebitNoteController)

router.get("/debitNote/get-next-debit-note-number", protect, authorizePermission('debit-note:read'), getNextDebitNoteNumberController)


export default router;