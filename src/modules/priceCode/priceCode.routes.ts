import { Router } from "express";

import {
    getAllMappingsController,
    updateCharacterController,
    getCodeForNumberController,
    getCharacterForDigitController,
    getDigitForCharacterController
} from "./priceCode.controller";
import { protect, restrictToRoles } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { updatePriceCodeSchema } from "./priceCode.validation";

const router = Router();

router.get("/priceCode/get-all-priceCode", 
    protect, 
    restrictToRoles("admin"), 
    getAllMappingsController
);

router.put("/priceCode/update-priceCode", 
    protect, 
    validate(updatePriceCodeSchema), 
    restrictToRoles("admin"), 
    updateCharacterController
);

router.get("/priceCode/get-code-for-number/:number", 
    protect, 
    restrictToRoles("admin"), 
    getCodeForNumberController
);

router.get("/priceCode/get-character-for-digit/:digit", 
    protect, 
    restrictToRoles("admin"), 
    getCharacterForDigitController
);

router.get("/priceCode/get-digit-for-character/:character", 
    protect, 
    restrictToRoles("admin"), 
    getDigitForCharacterController
);

export default router;