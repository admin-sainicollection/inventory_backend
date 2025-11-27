import { Router } from "express";
import * as PartyController from './party.controller';
import { protect, restrictToRoles } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { 
    partyIdValidation, 
    partyUpdateValidationSchema, 
    partyValidationSchema,
    addPhoneValidationSchema,
    addEmailValidationSchema,
    phoneIndexValidation,
    emailIndexValidation
} from "./party.validation";

const router = Router();

// Basic CRUD routes
router.post("/party/add-party", 
    protect, 
    validate(partyValidationSchema), 
    restrictToRoles("admin"), 
    PartyController.addParty
);

router.put("/party/update-party/:id", 
    protect, 
    validate(partyUpdateValidationSchema), 
    restrictToRoles("admin"), 
    PartyController.updateParty
);

router.get("/party/get-all-parties", 
    protect,  
    restrictToRoles('admin'), 
    PartyController.getAllParties
);

router.get('/party/get-party/:id', 
    protect, 
    restrictToRoles("admin"), 
    PartyController.getPartyById
);

router.delete('/party/delete-party/:id', 
    protect, 
    restrictToRoles('admin'), 
    PartyController.deleteParty
);

// Phone management routes
router.post('/party/:partyId/phones', 
    protect, 
    validate(addPhoneValidationSchema), 
    restrictToRoles('admin'), 
    PartyController.addPhoneToParty
);

router.delete('/party/:partyId/phones/:phoneIndex', 
    protect, 
    restrictToRoles('admin'), 
    PartyController.removePhoneFromParty
);

// Email management routes
router.post('/party/:partyId/emails', 
    protect, 
    validate(addEmailValidationSchema), 
    restrictToRoles('admin'), 
    PartyController.addEmailToParty
);

router.delete('/party/:partyId/emails/:emailIndex', 
    protect, 
    restrictToRoles('admin'), 
    PartyController.removeEmailFromParty
);

export default router;