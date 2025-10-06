import Category from "../modules/inventory/category/category.model";


const categories = [
    { name: "Engine", description: "Components related to vehicle engines" },
    { name: "Brakes", description: "Brake pads, rotors, calipers, etc." },
    { name: "Suspension & Steering", description: "Shock absorbers, control arms, etc." },
    { name: "Electrical & Lighting", description: "Batteries, headlights, alternators, etc." },
    { name: "Transmission & Drivetrain", description: "Clutch, gearbox, axles, etc." },
    { name: "Cooling System", description: "Radiators, water pumps, coolant hoses" },
    { name: "Exhaust System", description: "Mufflers, catalytic converters, exhaust pipes" },
    { name: "Body & Exterior", description: "Bumpers, fenders, mirrors, doors" },
    { name: "Interior & Accessories", description: "Seats, mats, dashboards, trims" },
    { name: "Fuel System", description: "Fuel pumps, injectors, filters" },
    { name: "Wheels & Tires", description: "Alloy wheels, tires, valve stems" },
    { name: "Filters", description: "Oil filters, air filters, fuel filters" },
    { name: "Belts & Hoses", description: "Timing belts, serpentine belts, coolant hoses" },
    { name: "Ignition System", description: "Spark plugs, ignition coils, distributors" },
    { name: "Lubricants & Fluids", description: "Oils, greases, transmission fluids" },
]

export const seedCategories = async () => {
    const existingCategories = await Category.find({}, "name").lean();
    const existingNames = existingCategories.map(c => c.name);

    const newCategories = categories.filter(c => !existingNames.includes(c.name));

    if(newCategories.length > 0){
        await Category.insertMany(newCategories);
        console.log(`Seeded ${newCategories.length} categories`);
    }else{
        console.log("All categories are already up to date");
    }
}