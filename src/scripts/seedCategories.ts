import Category from "../modules/inventory/category/category.model";

export const categories = [
    // ⚡ ENGINE & PERFORMANCE
    {
        name: "Engine",
        description: "Complete engine units and components for vehicle performance and repair.",
        attributesTemplate: [
            { key: "engineModel", label: "Engine Model", type: "string", required: true },
            { key: "engineCapacity", label: "Engine Capacity (cc)", type: "number", required: true },
            { key: "fuelType", label: "Fuel Type", type: "select", required: true, options: ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"] },
            { key: "powerOutput", label: "Power Output (BHP)", type: "number", required: false },
            { key: "torque", label: "Torque (Nm)", type: "number", required: false },
            { key: "oemPartNumber", label: "OEM Part Number", type: "string", required: false }
        ]
    },
    {
        name: "Cylinder Head & Valve Train",
        description: "Parts related to the cylinder head, camshaft, and valves.",
        attributesTemplate: [
            { key: "material", label: "Material", type: "string", required: false },
            { key: "valveType", label: "Valve Type", type: "select", required: false, options: ["SOHC", "DOHC", "OHV"] },
            { key: "oemPartNumber", label: "OEM Part Number", type: "string", required: false }
        ]
    },
    {
        name: "Fuel Injection System",
        description: "Injectors, pumps, and control units for efficient fuel delivery.",
        attributesTemplate: [
            { key: "injectionType", label: "Injection Type", type: "select", required: true, options: ["MPFI", "CRDI", "GDI", "TBI"] },
            { key: "flowRate", label: "Flow Rate (cc/min)", type: "number", required: false },
            { key: "pressureRating", label: "Pressure Rating (bar)", type: "number", required: false },
            { key: "oemPartNumber", label: "OEM Part Number", type: "string", required: false }
        ]
    },

    // ⚙️ TRANSMISSION & DRIVETRAIN
    {
        name: "Gearbox / Transmission",
        description: "Manual and automatic transmission units and gears.",
        attributesTemplate: [
            { key: "transmissionType", label: "Transmission Type", type: "select", required: true, options: ["Manual", "Automatic", "AMT", "CVT", "DCT"] },
            { key: "gearCount", label: "Number of Gears", type: "number", required: false },
            { key: "oemPartNumber", label: "OEM Part Number", type: "string", required: false }
        ]
    },
    {
        name: "Clutch & Flywheel",
        description: "Clutches, flywheels, and related linkage parts.",
        attributesTemplate: [
            { key: "clutchDiameter", label: "Clutch Diameter (mm)", type: "number", required: false },
            { key: "flywheelType", label: "Flywheel Type", type: "select", required: false, options: ["Single Mass", "Dual Mass"] },
            { key: "oemPartNumber", label: "OEM Part Number", type: "string", required: false }
        ]
    },

    // 🛞 SUSPENSION & STEERING
    {
        name: "Shock Absorbers & Struts",
        description: "Suspension components that ensure smooth vehicle operation.",
        attributesTemplate: [
            { key: "shockType", label: "Shock Type", type: "select", required: true, options: ["Gas Charged", "Hydraulic", "Coilover"] },
            { key: "length", label: "Length (mm)", type: "number", required: false },
            { key: "oemPartNumber", label: "OEM Part Number", type: "string", required: false }
        ]
    },
    {
        name: "Control Arms & Bushings",
        description: "Arm assemblies and rubber bushings for suspension control.",
        attributesTemplate: [
            { key: "material", label: "Material", type: "string", required: false },
            { key: "bushingType", label: "Bushing Type", type: "string", required: false },
            { key: "oemPartNumber", label: "OEM Part Number", type: "string", required: false }
        ]
    },

    // 🛑 BRAKING SYSTEM
    {
        name: "Brake Pads & Shoes",
        description: "Friction materials for braking systems.",
        attributesTemplate: [
            { key: "padMaterial", label: "Pad Material", type: "select", required: true, options: ["Ceramic", "Semi-Metallic", "Organic"] },
            { key: "thickness", label: "Thickness (mm)", type: "number", required: false },
            { key: "oemPartNumber", label: "OEM Part Number", type: "string", required: false }
        ]
    },
    {
        name: "Brake Rotors & Drums",
        description: "Rotating parts that work with brake pads for stopping power.",
        attributesTemplate: [
            { key: "rotorType", label: "Rotor Type", type: "select", required: true, options: ["Solid", "Vented", "Drilled", "Slotted"] },
            { key: "diameter", label: "Diameter (mm)", type: "number", required: false },
            { key: "oemPartNumber", label: "OEM Part Number", type: "string", required: false }
        ]
    },

    // 🔋 ELECTRICAL & LIGHTING
    {
        name: "Battery & Charging System",
        description: "Batteries, cables, and charging system components.",
        attributesTemplate: [
            { key: "voltage", label: "Voltage (V)", type: "number", required: true },
            { key: "capacity", label: "Capacity (Ah)", type: "number", required: true },
            { key: "batteryType", label: "Battery Type", type: "select", required: true, options: ["Lead Acid", "AGM", "Lithium Ion", "Gel"] },
            { key: "brandWarranty", label: "Brand Warranty (Yrs)", type: "number", required: false }
        ]
    },
    {
        name: "Headlights & Tail Lights",
        description: "Front and rear lighting assemblies for visibility and safety.",
        attributesTemplate: [
            { key: "bulbType", label: "Bulb Type", type: "select", required: true, options: ["Halogen", "LED", "HID"] },
            { key: "wattage", label: "Wattage (W)", type: "number", required: false },
            { key: "oemPartNumber", label: "OEM Part Number", type: "string", required: false }
        ]
    },

    // ❄️ COOLING & HEATING
    {
        name: "Radiator & Cooling Fan",
        description: "Cooling system components for temperature regulation.",
        attributesTemplate: [
            { key: "coreMaterial", label: "Core Material", type: "string", required: false },
            { key: "rowCount", label: "Row Count", type: "number", required: false },
            { key: "fanType", label: "Fan Type", type: "select", required: false, options: ["Mechanical", "Electric"] }
        ]
    },

    // 🪛 TOOLS & MAINTENANCE
    {
        name: "Lubricants & Oils",
        description: "Engine oils, greases, and fluids for maintenance.",
        attributesTemplate: [
            { key: "viscosityGrade", label: "Viscosity Grade", type: "string", required: true },
            { key: "volume", label: "Volume (L)", type: "number", required: true },
            { key: "oilType", label: "Oil Type", type: "select", required: true, options: ["Mineral", "Semi-Synthetic", "Fully Synthetic"] }
        ]
    },

    // 🛞 TIRES & WHEELS
    {
        name: "Tires",
        description: "Vehicle tires for all conditions and performance levels.",
        attributesTemplate: [
            { key: "tireSize", label: "Tire Size", type: "string", required: true },
            { key: "loadIndex", label: "Load Index", type: "number", required: false },
            { key: "speedRating", label: "Speed Rating", type: "string", required: false },
            { key: "tireType", label: "Tire Type", type: "select", required: true, options: ["Radial", "Bias Ply", "Tubeless", "Tube"] }
        ]
    },
    {
        name: "Alloy Wheels",
        description: "Stylish and durable wheel options.",
        attributesTemplate: [
            { key: "wheelDiameter", label: "Wheel Diameter (inches)", type: "number", required: true },
            { key: "boltPattern", label: "Bolt Pattern", type: "string", required: true },
            { key: "offset", label: "Offset (mm)", type: "number", required: false }
        ]
    },

    // 🧰 SAFETY & MISC
    {
        name: "Airbags",
        description: "Inflatable cushions for occupant protection in collisions.",
        attributesTemplate: [
            { key: "airbagPosition", label: "Airbag Position", type: "select", required: true, options: ["Driver", "Passenger", "Side", "Curtain"] },
            { key: "oemPartNumber", label: "OEM Part Number", type: "string", required: false }
        ]
    },
    {
        name: "Seat Belts",
        description: "Restraint systems for passenger safety.",
        attributesTemplate: [
            { key: "beltType", label: "Belt Type", type: "select", required: true, options: ["2 Point", "3 Point", "Pretensioner"] },
            { key: "length", label: "Length (mm)", type: "number", required: false }
        ]
    }
];

export const seedCategories = async () => {
    const existingCategories = await Category.find({}, "name").lean();
    const existingNames = existingCategories.map(c => c.name);

    const newCategories = categories.filter(c => !existingNames.includes(c.name));

    if (newCategories.length > 0) {
        await Category.insertMany(newCategories);
    } else {
        console.log("All categories are already up to date");
    }
}