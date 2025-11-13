import z from "zod";

export const createPriceCodeSchema = z.object({
    digitMappings: z.array(z.object({
        digit: z.number().min(0, "Digit must be between 0 and 9").max(9, "Digit must be between 0 and 9"),
        character: z.string().min(1, "Character is required").max(1, "Character must be a single character").toUpperCase()
    }))
})

export const updatePriceCodeSchema = z.object({
    digit: z.number().min(0, "Digit must be between 0 and 9").max(9, "Digit must be between 0 and 9"),
    character: z.string().min(1, "Character is required").max(1, "Character must be a single character").toUpperCase()
})