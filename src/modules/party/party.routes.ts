import { Router } from "express";
import * as PartyController from './party.controller';
import { authorizePermission, protect, restrictToRoles } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { 
    partyUpdateValidationSchema, 
    partyValidationSchema,
    addPhoneValidationSchema,
    addEmailValidationSchema,
} from "./party.validation";

const router = Router();

// Basic CRUD routes
router.post("/party/add-party", 
    protect, 
    validate(partyValidationSchema), 
    authorizePermission('party:create'),
    PartyController.addParty
);

router.put("/party/update-party/:id", 
    protect, 
    validate(partyUpdateValidationSchema), 
    authorizePermission('party:update'),
    PartyController.updateParty
);

router.get("/party/get-all-parties", 
    protect,  
    authorizePermission('party:list'),
    PartyController.getAllParties
);

router.get('/party/get-party/:id', 
    protect, 
    authorizePermission('party:read'),
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
    PartyController.addPhoneToParty
);

router.delete('/party/:partyId/phones/:phoneIndex', 
    protect, 
    PartyController.removePhoneFromParty
);

// Email management routes
router.post('/party/:partyId/emails', 
    protect, 
    validate(addEmailValidationSchema), 
    PartyController.addEmailToParty
);

router.delete('/party/:partyId/emails/:emailIndex', 
    protect, 
    PartyController.removeEmailFromParty
);

export default router;