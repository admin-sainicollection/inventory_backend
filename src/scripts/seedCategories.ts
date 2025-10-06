import Category from "../modules/inventory/category/category.model";


// const categories = [
//     { name: "Engine", description: "Components related to vehicle engines" },
//     { name: "Brakes", description: "Brake pads, rotors, calipers, etc." },
//     { name: "Suspension & Steering", description: "Shock absorbers, control arms, etc." },
//     { name: "Electrical & Lighting", description: "Batteries, headlights, alternators, etc." },
//     { name: "Transmission & Drivetrain", description: "Clutch, gearbox, axles, etc." },
//     { name: "Cooling System", description: "Radiators, water pumps, coolant hoses" },
//     { name: "Exhaust System", description: "Mufflers, catalytic converters, exhaust pipes" },
//     { name: "Body & Exterior", description: "Bumpers, fenders, mirrors, doors" },
//     { name: "Interior & Accessories", description: "Seats, mats, dashboards, trims" },
//     { name: "Fuel System", description: "Fuel pumps, injectors, filters" },
//     { name: "Wheels & Tires", description: "Alloy wheels, tires, valve stems" },
//     { name: "Filters", description: "Oil filters, air filters, fuel filters" },
//     { name: "Belts & Hoses", description: "Timing belts, serpentine belts, coolant hoses" },
//     { name: "Ignition System", description: "Spark plugs, ignition coils, distributors" },
//     { name: "Lubricants & Fluids", description: "Oils, greases, transmission fluids" },
// ]
export const categories = [
    // Engine & Performance
    { name: "Engine", description: "Complete engine units and components for vehicle performance and repair." },
    { name: "Cylinder Head & Valve Train", description: "Parts related to the cylinder head, camshaft, and valves." },
    { name: "Pistons & Rings", description: "Pistons, piston rings, and connecting components for internal combustion engines." },
    { name: "Fuel Injection System", description: "Injectors, pumps, and control units for efficient fuel delivery." },
    { name: "Ignition System", description: "Spark plugs, ignition coils, and wiring for proper engine ignition." },
    { name: "Air Intake System", description: "Filters, manifolds, and air ducts for engine air flow." },
    { name: "Turbochargers & Superchargers", description: "Forced induction units to boost engine performance." },
    { name: "Exhaust System", description: "Mufflers, pipes, and catalytic converters for exhaust flow and emissions." },

    // Transmission & Drivetrain
    { name: "Clutch & Flywheel", description: "Clutches, flywheels, and related linkage parts." },
    { name: "Gearbox / Transmission", description: "Manual and automatic transmission units and gears." },
    { name: "Differential & Axle", description: "Differentials, axles, and gear assemblies for power transfer." },
    { name: "Drive Shaft", description: "Propeller shafts and universal joints for drivetrain connection." },
    { name: "CV Joint & Boot", description: "Constant velocity joints and protective boots." },
    { name: "Transfer Case", description: "4WD and AWD power transfer units." },

    // Suspension & Steering
    { name: "Shock Absorbers & Struts", description: "Suspension components that ensure smooth vehicle operation." },
    { name: "Coil Springs", description: "Spring systems that absorb shock and maintain ride height." },
    { name: "Control Arms & Bushings", description: "Arm assemblies and rubber bushings for suspension control." },
    { name: "Steering Rack & Column", description: "Steering mechanism components and linkages." },
    { name: "Power Steering Pump", description: "Hydraulic or electric pumps for steering assist." },
    { name: "Ball Joints & Tie Rods", description: "Steering connectors and pivot joints." },

    // Braking System
    { name: "Brake Pads & Shoes", description: "Friction materials for braking systems." },
    { name: "Brake Rotors & Drums", description: "Rotating parts that work with brake pads for stopping power." },
    { name: "Brake Calipers", description: "Hydraulic components that clamp the brake pads." },
    { name: "Brake Master Cylinder", description: "Main hydraulic pressure unit for brake operation." },
    { name: "Brake Lines & Hoses", description: "Fluid-carrying lines and hoses in braking systems." },
    { name: "ABS Sensors & Modules", description: "Sensors and control units for anti-lock braking systems." },

    // Electrical & Lighting
    { name: "Alternator & Starter Motor", description: "Electrical generators and starter motors for vehicle operation." },
    { name: "Battery & Charging System", description: "Batteries, cables, and charging system components." },
    { name: "Headlights & Tail Lights", description: "Front and rear lighting assemblies for visibility and safety." },
    { name: "Turn Signals & Indicators", description: "Lighting units for signaling vehicle movement." },
    { name: "Wiring Harness", description: "Electrical wiring networks for all systems." },
    { name: "Fuses & Relays", description: "Electrical protection and switching components." },
    { name: "Sensors & Switches", description: "Monitoring and control devices across vehicle systems." },

    // Cooling & Heating
    { name: "Radiator & Cooling Fan", description: "Cooling system components for temperature regulation." },
    { name: "Water Pump", description: "Circulates coolant through the engine." },
    { name: "Thermostat", description: "Controls coolant flow based on engine temperature." },
    { name: "Heater Core", description: "Provides heat to the vehicle interior." },
    { name: "Hoses & Belts", description: "Flexible connectors for fluid and mechanical systems." },
    { name: "Intercooler", description: "Reduces air temperature in turbocharged systems." },

    // Lubrication & Filtration
    { name: "Oil Filters", description: "Filters that clean engine oil." },
    { name: "Air Filters", description: "Filters that purify air entering the engine." },
    { name: "Fuel Filters", description: "Filters to remove impurities from fuel." },
    { name: "Cabin Air Filters", description: "Filters that clean air entering the cabin." },
    { name: "Gaskets & Seals", description: "Prevent leaks in mechanical joints and engine components." },

    // Air Conditioning (A/C)
    { name: "Compressor", description: "Main pump in air conditioning system." },
    { name: "Condenser", description: "Releases heat from the A/C refrigerant." },
    { name: "Evaporator", description: "Cools and dehumidifies cabin air." },
    { name: "A/C Hoses & Fittings", description: "Pipes and joints for refrigerant flow." },
    { name: "A/C Switches & Sensors", description: "Monitors and controls system temperature and pressure." },

    // Body & Exterior
    { name: "Bumpers", description: "Front and rear bumpers for protection and aesthetics." },
    { name: "Fenders", description: "Covers for wheel arches and exterior body panels." },
    { name: "Doors & Handles", description: "Exterior door panels and opening mechanisms." },
    { name: "Mirrors", description: "Side and rearview mirrors for visibility." },
    { name: "Grilles", description: "Front grilles that protect radiators and style the vehicle." },
    { name: "Hoods & Trunks", description: "Front and rear openings for engine and storage." },
    { name: "Glass & Windows", description: "Windshields, windows, and seals." },

    // Interior & Accessories
    { name: "Seats & Seat Covers", description: "Vehicle seating and protective covers." },
    { name: "Dashboard & Panels", description: "Interior control panels and trim components." },
    { name: "Steering Wheel & Controls", description: "Main driver interface and steering parts." },
    { name: "Carpets & Floor Mats", description: "Interior flooring and protective mats." },
    { name: "Pedals & Levers", description: "Driver control components for acceleration and braking." },
    { name: "Interior Lights", description: "Cabin illumination and reading lights." },

    // Electrical Controls & Instruments
    { name: "ECU / Control Modules", description: "Electronic control units for various vehicle systems." },
    { name: "Instrument Cluster", description: "Dashboard gauges and display units." },
    { name: "Speed Sensors", description: "Monitor and report vehicle speed." },
    { name: "Switches & Relays", description: "Electrical control switches and relays for operations." },

    // Tools & Maintenance
    { name: "Lubricants & Oils", description: "Engine oils, greases, and fluids for maintenance." },
    { name: "Cleaners & Degreasers", description: "Chemical products for cleaning and maintenance." },
    { name: "Diagnostic Tools", description: "Tools for vehicle fault detection and repair." },
    { name: "Repair Kits", description: "Pre-packaged sets for specific maintenance tasks." },
    { name: "Hardware & Fasteners", description: "Bolts, screws, clips, and small mechanical parts." },

    // Tires & Wheels
    { name: "Tires", description: "Vehicle tires for all conditions and performance levels." },
    { name: "Alloy Wheels", description: "Stylish and durable wheel options." },
    { name: "Wheel Bearings", description: "Support wheel rotation with minimal friction." },
    { name: "Hub Assemblies", description: "Integrates wheel bearings and hub for mounting wheels." },
    { name: "Wheel Nuts & Bolts", description: "Fasteners for securing wheels to the hub." },

    // Safety & Misc
    { name: "Airbags", description: "Inflatable cushions for occupant protection in collisions." },
    { name: "Seat Belts", description: "Restraint systems for passenger safety." },
    { name: "Horn & Alarms", description: "Sound warning and theft deterrent systems." },
    { name: "Cameras & Parking Sensors", description: "Visual and proximity aids for parking and safety." },

    // Other
    { name: "Fuel Tank & Lines", description: "Storage and delivery system for vehicle fuel." },
    { name: "Exhaust Mounts & Brackets", description: "Support and attach exhaust components." },
    { name: "Emission Control System", description: "Reduces and monitors vehicle emissions." },
    { name: "Mounts & Brackets", description: "Support structures for engine, gearbox, and components." },
    { name: "Miscellaneous Parts", description: "Uncategorized or rare automotive parts." }
];


export const seedCategories = async () => {
    const existingCategories = await Category.find({}, "name").lean();
    const existingNames = existingCategories.map(c => c.name);

    const newCategories = categories.filter(c => !existingNames.includes(c.name));

    if (newCategories.length > 0) {
        await Category.insertMany(newCategories);
        console.log(`Seeded ${newCategories.length} categories`);
    } else {
        console.log("All categories are already up to date");
    }
}