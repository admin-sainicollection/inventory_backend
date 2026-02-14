import Brand from "../modules/brand/brand.model"

// Initial seed data
const defaultBrands = [
    {
        name: "Maruti Suzuki",
        parentCompany: "Suzuki Motor Corporation",
        brandLogo: "https://carnish.in/wp-content/uploads/2024/09/maruti-suzuki.png",
        manufactureType: ["Cars"]
    },
    {
        name: "Tata Motors",
        parentCompany: "Tata Group",
        brandLogo: "https://logos-world.net/wp-content/uploads/2021/10/Tata-Symbol.png",
        manufactureType: ["Cars"]
    },
    {
        name: "Nissan",
        parentCompany: "Nissan Motor Co. Ltd.",
        brandLogo: "https://www.edigitalagency.com.au/wp-content/uploads/new-Nissan-logo-black-png-large-size.png",
        manufactureType: ["Cars"]
    },
    {
        name: "Hyundai",
        parentCompany: "Hyundai Motor Company",
        brandLogo: "https://logos-world.net/wp-content/uploads/2021/03/Hyundai-Logo.png",
        manufactureType: ["Cars"]
    },
    {
        name: "Mahindra",
        parentCompany: "Mahindra & Mahindra Ltd.",
        brandLogo: "https://logos-world.net/wp-content/uploads/2021/09/Mahindra-Mahindra-New-Logo.png",
        manufactureType: ["Cars"]
    },
    {
        name: "Toyota",
        parentCompany: "Toyota Motor Corporation",
        brandLogo: "https://media-s3-us-east-1.ceros.com/ceros-marketing/images/2020/07/27/2142c703bb605d17d40d01fa3def99e6/toyota-logos-brands-10.png",
        manufactureType: ["Cars"]
    },
    {
        name: "Honda",
        parentCompany: "Honda Motor Co., Ltd.",
        brandLogo: "https://img.lazcdn.com/g/ff/kf/S6a01e53d35224c9b9b114903c9795e6eE.png_720x720q80.png",
        manufactureType: ["Cars"]
    },
    {
        name: "Kia",
        parentCompany: "Hyundai Motor Company",
        brandLogo: "https://freelogopng.com/images/all_img/1686590236old-kia-logo-png.png",
        manufactureType: ["Cars"]
    },
    {
        name: "Renault",
        parentCompany: "Renault S.A.",
        brandLogo: "https://media.whichcar.com.au/uploads/2021/08/0fe9afa2-renault-627x768.png",
        manufactureType: ["Cars"]
    },

    // --- German Premium Brands (Strong Presence) ---
    {
        name: "Mercedes-Benz",
        parentCompany: "Mercedes-Benz Group AG",
        brandLogo: "https://1000logos.net/wp-content/uploads/2018/04/Mercedes-Benz-Logo.png",
        manufactureType: ["Cars"]
    },
    {
        name: "BMW",
        parentCompany: "Bayerische Motoren Werke AG",
        brandLogo: "https://cdn.freebiesupply.com/logos/thumbs/2x/bmw-2-logo.png",
        manufactureType: ["Cars"]
    },
    {
        name: "Audi",
        parentCompany: "Volkswagen Group",
        brandLogo: "https://autoblue.al/uploads/custom-images/brand--2024-12-04-09-31-26-2245.webp",
        manufactureType: ["Cars"]
    },

    // --- VW Group Brands (Growing Presence) ---
    {
        name: "Volkswagen",
        parentCompany: "Volkswagen Group",
        brandLogo: "https://1000logos.net/wp-content/uploads/2021/04/Volkswagen-logo.png",
        manufactureType: ["Cars"]
    },
    {
        name: "Škoda",
        parentCompany: "Volkswagen Group",
        brandLogo: "https://logos-world.net/wp-content/uploads/2022/09/Skoda-logo.png",
        manufactureType: ["Cars"]
    },

    // --- Other Foreign Brands (Niche/Premium) ---
    {
        name: "MG Motor",
        parentCompany: "SAIC Motor (China)",
        brandLogo: "https://thefederal.com/file/2021/09/MG-1.png",
        manufactureType: ["Cars"]
    },
    {
        name: "Citroën",
        parentCompany: "Stellantis N.V.",
        brandLogo: "https://www.pngplay.com/wp-content/uploads/15/Citroen-New-Logo-Background-PNG-Image.png",
        manufactureType: ["Cars"]
    },
    {
        name: "Jeep",
        parentCompany: "Stellantis N.V.",
        brandLogo: "https://logos-world.net/wp-content/uploads/2021/09/Jeep-Logo.png",
        manufactureType: ["Cars"]
    },

    // --- Ultra-Luxury/High-End Brands ---
    {
        name: "Jaguar",
        parentCompany: "Tata Motors (Jaguar Land Rover)",
        brandLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Jaguar_2024.svg/1280px-Jaguar_2024.svg.png",
        manufactureType: ["Cars"]
    },
    {
        name: "Land Rover",
        parentCompany: "Tata Motors (Jaguar Land Rover)",
        brandLogo: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4a/LandRover.svg/2560px-LandRover.svg.png",
        manufactureType: ["Cars"]
    },

    // --- Auto parts Brands ---
    {
        name: "Bosch",
        parentCompany: "Robert Bosch GmbH",
        brandLogo: "https://static.wikia.nocookie.net/logopedia/images/6/6d/Bosch_symbol_%283D_metallic_style%29.svg/revision/latest/scale-to-width-down/250?cb=20240614090551",
        manufactureType: ["Parts"]
    },
    {
        name: "Denso",
        parentCompany: "Denso Corporation",
        brandLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Denso_logo.svg/1280px-Denso_logo.svg.png",
        manufactureType: ["Parts"]
    },
    {
        name: "Motherson",
        parentCompany: "Samvardhana Motherson Group",
        brandLogo: "https://healthandmedical.motherson.com/wp-content/uploads/2024/11/Motherson_Logo-01-1024x232-1.png",
        manufactureType: ["Parts"]
    },
    {
        name: "Sundram Fasteners",
        parentCompany: "TVS Group",
        brandLogo: "https://www.fastener-world.com/data/article/Sundram_Fasteners_4000_Crore_EV_Order_8879_0.jpg",
        manufactureType: ["Parts"]
    },
    {
        name: "Mahle",
        parentCompany: "MAHLE GmbH",
        brandLogo: "https://www.tvh.com/sites/tvh/files/styles/max_650x650/public/2024-07/Mahle%20-%20logo%20%28removeBG%29.png?itok=LybXycJ_",
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
                console.log(`✅ Brand seeded: ${brand.name}`);
                createdCount++;
            } else {
                // Update existing brands to include manufactureType if missing
                if (!exists.manufactureType || exists.manufactureType.length === 0) {
                    await Brand.findByIdAndUpdate(exists._id, { 
                        manufactureType: ["Cars"] 
                    });
                    console.log(`🔄 Updated brand with manufactureType: ${brand.name}`);
                } else {
                    console.log(`📋 Brand already exists: ${brand.name}`);
                }
                existingCount++;
            }
        }

        console.log(`\n🎉 Seeding completed!`);
        console.log(`✅ New brands created: ${createdCount}`);
        console.log(`📋 Existing brands: ${existingCount}`);
        console.log(`📊 Total brands processed: ${createdCount + existingCount}`);

    } catch (error) {
        console.error("❌ Error seeding brands:", error);
    }
};