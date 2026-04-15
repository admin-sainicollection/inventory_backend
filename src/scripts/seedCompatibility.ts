import CarModel from "../modules/inventory/compatibility/compatibility.model";
import { CAR_MODELS } from "../modules/inventory/compatibility/car_models.data";

export const seedCarModels = async () => {
    try {
        const existingModels = await CarModel.find({}, "name").lean();
        const existingName = existingModels.map(m => m.name);

        // Filter only models that do not exist yet
        const newModels = CAR_MODELS.filter(m => !existingName.includes(m.name));

        if (newModels.length) {
            // Insert new models
            await CarModel.insertMany(newModels);
        } else {
        }
    } catch (err) {
        console.error("Error seeding car models:", err);
    }
};
