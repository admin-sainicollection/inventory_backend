import { Request, Response } from 'express';
import {
    getAllMappings,
    updateMappings,
    getCodeForNumber,
    getCharacterForDigit,
    getDigitForCharacter,
} from './priceCode.service';
import { MappingObject } from './priceCode.model';

/**
 * Get all digit mappings
 */
export const getAllMappingsController = async (req: Request, res: Response) => {
    try {
        const priceCode = await getAllMappings();

        if (!priceCode) {
            return res.status(404).json({
                status: 'error',
                message: 'Price code mappings not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                mappings: priceCode.digitMappings,
            }
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Update character for a digit
 */
export const updateCharacterController = async (req: Request, res: Response) => {
    try {
        const { digit, character }: MappingObject = req.body;

        // Validate required fields
        if (digit === undefined || !character) {
            return res.status(400).json({
                status: 'error',
                message: 'Digit and character are required'
            });
        }

        const updatedPriceCode = await updateMappings({
            digit: Number(digit),
            character
        });

        res.status(200).json({
            status: 'success',
            message: 'Character updated successfully',
            data: {
                mappings: updatedPriceCode.digitMappings,
            }
        });
    } catch (error: any) {
        if (error.message.includes('not found') || error.message.includes('Digit must be')) {
            return res.status(404).json({
                status: 'error',
                message: error.message
            });
        }

        if (error.message.includes('already assigned')) {
            return res.status(409).json({
                status: 'error',
                message: error.message
            });
        }

        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Get code for a number
 */
export const getCodeForNumberController = async (req: Request, res: Response) => {
    try {
        const { number } = req.params;

        if (!number) {
            return res.status(400).json({
                status: 'error',
                message: 'Number parameter is required'
            });
        }

        const numericValue = Number(number);
        if (isNaN(numericValue)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid number provided'
            });
        }

        const code = await getCodeForNumber(numericValue);

        res.status(200).json({
            status: 'success',
            data: {
                number: numericValue,
                code,
                digits: number.toString().split(''),
                characters: code.split('')
            }
        });
    } catch (error: any) {
        if (error.message.includes('not found') || error.message.includes('No character mapping')) {
            return res.status(404).json({
                status: 'error',
                message: error.message
            });
        }

        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Get character for a specific digit
 */
export const getCharacterForDigitController = async (req: Request, res: Response) => {
    try {
        const { digit } = req.params;

        if (!digit) {
            return res.status(400).json({
                status: 'error',
                message: 'Digit parameter is required'
            });
        }

        const numericDigit = Number(digit);
        const character = await getCharacterForDigit(numericDigit);

        res.status(200).json({
            status: 'success',
            data: {
                digit: numericDigit,
                character
            }
        });
    } catch (error: any) {
        if (error.message.includes('not found')) {
            return res.status(404).json({
                status: 'error',
                message: error.message
            });
        }

        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Get digit for a specific character
 */
export const getDigitForCharacterController = async (req: Request, res: Response) => {
    try {
        const { character } = req.params;

        if (!character) {
            return res.status(400).json({
                status: 'error',
                message: 'Character parameter is required'
            });
        }

        const digit = await getDigitForCharacter(character);

        res.status(200).json({
            status: 'success',
            data: {
                character,
                digit
            }
        });
    } catch (error: any) {
        if (error.message.includes('not found')) {
            return res.status(404).json({
                status: 'error',
                message: error.message
            });
        }

        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};