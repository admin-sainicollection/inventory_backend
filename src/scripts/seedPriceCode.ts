import PriceCode from "../modules/priceCode/priceCode.model";

const defaultPriceCode = [
    { digit: 0, character: "A" },
    { digit: 1, character: "B" },
    { digit: 2, character: "C" },
    { digit: 3, character: "D" },
    { digit: 4, character: "E" },
    { digit: 5, character: "F" },
    { digit: 6, character: "G" },
    { digit: 7, character: "H" },
    { digit: 8, character: "I" },
    { digit: 9, character: "J" },
]

export const seedPriceCode = async () => {
    try {
        const existing = await PriceCode.findOne({});
        if (existing) {
            console.log("PriceCode already seeded.");
            return;
        }

        const priceCode = new PriceCode({
            digitMappings: defaultPriceCode
        });

        await priceCode.save();
        console.log("PriceCode seeded successfully.");
    } catch (error) {
        console.error("Error seeding PriceCode:", error);
    }
};