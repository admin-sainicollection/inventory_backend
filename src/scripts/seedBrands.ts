import Brand from "../modules/brand/brand.model"

// Initial seed data
const defaultBrands = [
    {
        name: "Maruti Suzuki",
        parentCompany: "Suzuki Motor Corporation",
        manufactureType: ["Cars"]
    },
    {
        name: "Tata Motors",
        parentCompany: "Tata Group",
        manufactureType: ["Cars"]
    },
    {
        name: "Nissan",
        parentCompany: "Nissan Motor Co. Ltd.",
        manufactureType: ["Cars"]
    },
    {
        name: "Hyundai",
        parentCompany: "Hyundai Motor Company",
        manufactureType: ["Cars"]
    },
    {
        name: "Mahindra",
        parentCompany: "Mahindra & Mahindra Ltd.",
        manufactureType: ["Cars"]
    },
    {
        name: "Toyota",
        parentCompany: "Toyota Motor Corporation",
        manufactureType: ["Cars"]
    },
    {
        name: "Honda",
        parentCompany: "Honda Motor Co., Ltd.",
        manufactureType: ["Cars"]
    },
    {
        name: "Kia",
        parentCompany: "Hyundai Motor Company",
        manufactureType: ["Cars"]
    },
    {
        name: "Renault",
        parentCompany: "Renault S.A.",
        manufactureType: ["Cars"]
    },

    // --- German Premium Brands (Strong Presence) ---
    {
        name: "Mercedes-Benz",
        parentCompany: "Mercedes-Benz Group AG",
        manufactureType: ["Cars"]
    },
    {
        name: "BMW",
        parentCompany: "Bayerische Motoren Werke AG",
        manufactureType: ["Cars"]
    },
    {
        name: "Audi",
        parentCompany: "Volkswagen Group",
        manufactureType: ["Cars"]
    },

    // --- VW Group Brands (Growing Presence) ---
    {
        name: "Volkswagen",
        parentCompany: "Volkswagen Group",
        manufactureType: ["Cars"]
    },
    {
        name: "Škoda",
        parentCompany: "Volkswagen Group",
        manufactureType: ["Cars"]
    },

    // --- Other Foreign Brands (Niche/Premium) ---
    {
        name: "MG Motor",
        parentCompany: "SAIC Motor (China)",
        manufactureType: ["Cars"]
    },
    {
        name: "Citroën",
        parentCompany: "Stellantis N.V.",
        manufactureType: ["Cars"]
    },
    {
        name: "Jeep",
        parentCompany: "Stellantis N.V.",
        manufactureType: ["Cars"]
    },

    // --- Ultra-Luxury/High-End Brands ---
    {
        name: "Jaguar",
        parentCompany: "Tata Motors (Jaguar Land Rover)",
        manufactureType: ["Cars"]
    },
    {
        name: "Land Rover",
        parentCompany: "Tata Motors (Jaguar Land Rover)",
        manufactureType: ["Cars"]
    },

    // --- Auto parts Brands ---
    {
        name: "Bosch",
        parentCompany: "Robert Bosch GmbH",
        manufactureType: ["Parts"]
    },
    {
        name: "Denso",
        parentCompany: "Denso Corporation",
        manufactureType: ["Parts"]
    },
    {
        name: "Motherson",
        parentCompany: "Samvardhana Motherson Group",
        manufactureType: ["Parts"]
    },
    {
        name: "Sundram Fasteners",
        parentCompany: "TVS Group",
        manufactureType: ["Parts"]
    },
    {
        name: "Mahle",
        parentCompany: "MAHLE GmbH",
        manufactureType: ["Parts"]
    },
];

export const seedBrands = async () => {
    try {
        let createdCount = 0;
        let existingCount = 0;

        for (const brand of defaultBrands) {
            const exists = await Brand.findOne({ name: brand.name });
            if (!exists) {
                await Brand.create(brand);
                createdCount++;
            } else {
                // Update existing brands to include manufactureType if missing
                if (!exists.manufactureType || exists.manufactureType.length === 0) {
                    await Brand.findByIdAndUpdate(exists._id, { 
                        manufactureType: ["Cars"] 
                    });
                } else {
                }
                existingCount++;
            }
        }

    } catch (error) {
        console.error("❌ Error seeding brands:", error);
    }
};