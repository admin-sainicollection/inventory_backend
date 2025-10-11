import CarModel from "../modules/inventory/compatibility/compatibility.model";
import { CAR_MODELS } from "../modules/inventory/compatibility/car_models.data";

export const seedCarModels = async () => {
    const existingModels = await CarModel.find({}, "name").lean();
    const existingName = existingModels.map(m => m.name);

    const newModels = CAR_MODELS.filter(m => !existingName.includes(m.name))
    if (newModels.length) {
        await CarModel.insertMany(newModels);
        console.log(`Seeded car models ${newModels.length}`);

    } else {
        console.log("No new car models to seed");
    }
}