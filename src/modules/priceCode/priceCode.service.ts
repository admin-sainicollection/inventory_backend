import PriceCode, { MappingObject, IPriceCode } from "./priceCode.model";

// -----------------------------------------------------------------------GET ALL MAPPINGS
export const getAllMappings = async (): Promise<IPriceCode | null> => {
    try {
        const priceCode = await PriceCode.findOne();
        return priceCode;
    } catch (error: any) {
        throw new Error(`Failed to fetch price code mappings : ${error.message}`);
    }
}

// -----------------------------------------------------------------------UPDATE MAPPINGS
export const updateMappings = async (digitMappings: MappingObject): Promise<IPriceCode> => {
    try {
        const { digit, character } = digitMappings;

        // Validate inputs
        if (digit < 0 || digit > 9) {
            throw new Error("Digit must be between 0 and 9");
        }

        if (!character || character.length !== 1) {
            throw new Error("Character must be a single character");
        }

        const upperCaseCharacter = character.toUpperCase();

        // Get current mappings to provide better error context
        const currentMappings = await PriceCode.findOne();
        if (!currentMappings) {
            throw new Error("Price code mappings not found in database");
        }

        // Check if digit exists
        const digitExists = currentMappings.digitMappings.some(
            (mapping: any) => mapping.digit === digit
        );
        if (!digitExists) {
            throw new Error(`Digit ${digit} not found in existing mappings`);
        }

        // Check if character is already assigned to a different digit
        const existingMappingWithCharacter = currentMappings.digitMappings.find(
            (mapping: any) => mapping.character === upperCaseCharacter && mapping.digit !== digit
        );

        if (existingMappingWithCharacter) {
            throw new Error(`Character '${upperCaseCharacter}' is already assigned to digit ${existingMappingWithCharacter.digit}`);
        }

        // Update the mapping
        const updatedPriceCode = await PriceCode.findOneAndUpdate(
            { "digitMappings.digit": digit },
            {
                $set: {
                    "digitMappings.$.character": upperCaseCharacter
                }
            },
            { new: true, runValidators: true }
        );

        if (!updatedPriceCode) {
            throw new Error("Failed to update mappings - digit not found");
        }

        return updatedPriceCode;
    } catch (error: any) {
        // Handle duplicate key error from unique index
        if (error.code === 11000) {
            if (error.message.includes('digitMappings.character')) {
                throw new Error(`Character '${digitMappings.character}' is already mapped to another digit`);
            }
        }

        // Re-throw our custom error messages
        if (error.message.includes('is already assigned to') ||
            error.message.includes('not found') ||
            error.message.includes('must be')) {
            throw error;
        }

        throw new Error(`Failed to update price code mappings: ${error.message}`);
    }
};

//--------------------------------------------------------------------------------GET CODE FOR NUMBER
export const getCodeForNumber = async (number: number): Promise<string> => {
    try {
        if (typeof number !== "number" || isNaN(number)) {
            throw new Error("Input must be a valid number")
        }

        if (number < 0) {
            throw new Error('Number must be positive')
        }

        const priceCode = await getAllMappings();
        if (!priceCode) {
            throw new Error("Price code mapping not found");
        }

        // convert mapping to lookup object
        const mappingObj: { [key: number]: string } = {};
        priceCode.digitMappings.forEach(mapping => {
            mappingObj[mapping.digit] = mapping.character
        })

        // convert number to string and ap each digit to character
        const numberStr = number.toString();
        let result = "";
        for (const digitChar of numberStr) {
            const digit = parseInt(digitChar, 10);
            if (isNaN(digit)) {
                throw new Error(`Invalid digit in number : ${digitChar}`)
            }

            if (mappingObj[digit] === undefined) {
                throw new Error(`No character mapping found for digit : ${digit}`)
            }

            result += mappingObj[digit];
        }

        return result;
    } catch (error: any) {
        throw new Error(`Failed to generate code for number : ${error.message}`)
    }
}

// -----------------------------------------------------------------------------------GET CHARACTER FOR SPECIFIC DIGIT
export const getCharacterForDigit = async (digit: number): Promise<string> => {
    try {
        if (digit < 0 || digit > 9) {
            throw new Error("Digit must be between 0 and 9");
        }
        const priceCode = await PriceCode.findOne({
            "digitMappings.digit": digit
        })

        if (!priceCode) {
            throw new Error(`Digit ${digit} ot found in mapping`)
        }

        const mapping = priceCode.digitMappings.find(m => m.digit === digit);
        return mapping!.character
    } catch (error: any) {
        throw new Error(`Failed to get character for digit : ${error.message}`);
    }
}

// -----------------------------------------------------------------------------------GET DIGIT FOR SPECIFIC CHARACTER
export const getDigitForCharacter = async (character: any): Promise<number> => {
    try {
        if (!character || character.length !== 1) {
            throw new Error("Character must be single character")
        }

        const upperCaseCharacter = character.toUpperCase();
        const priceCode = await PriceCode.findOne({
            "digitMappings.character": upperCaseCharacter
        });

        if (!priceCode) {
            throw new Error(`Character ${upperCaseCharacter} not found in mappings`)
        }

        const mapping = priceCode.digitMappings.find(m => m.character === upperCaseCharacter)
        return mapping!.digit
    } catch (error: any) {
        throw new error(`Failed to get digit for character : ${error.message}`)
    }
}