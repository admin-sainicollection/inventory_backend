import Brand from "../modules/brand/brand.model"

// Initial seed data
const defaultBrands = [
    {
        name: "Maruti Suzuki",
        parentCompany: "Suzuki Motor Corporation",
        brandLogo: "https://carnish.in/wp-content/uploads/2024/09/maruti-suzuki.png",
    },
    {
        name: "Tata Motors",
        parentCompany: "Tata Group",
        brandLogo: "https://logos-world.net/wp-content/uploads/2021/10/Tata-Symbol.png",
    },
    {
        name: "Hyundai",
        parentCompany: "Hyundai Motor Company",
        brandLogo: "https://logos-world.net/wp-content/uploads/2021/03/Hyundai-Logo.png",
    },
    {
        name: "Mahindra",
        parentCompany: "Mahindra & Mahindra Ltd.",
        brandLogo: "https://logos-world.net/wp-content/uploads/2021/09/Mahindra-Mahindra-New-Logo.png",
    },
    {
        name: "Toyota",
        parentCompany: "Toyota Motor Corporation",
        brandLogo: "https://media-s3-us-east-1.ceros.com/ceros-marketing/images/2020/07/27/2142c703bb605d17d40d01fa3def99e6/toyota-logos-brands-10.png",
    },
    {
        name: "Honda",
        parentCompany: "Honda Motor Co., Ltd.",
        brandLogo: "https://img.lazcdn.com/g/ff/kf/S6a01e53d35224c9b9b114903c9795e6eE.png_720x720q80.png",
    },
    {
        name: "Kia",
        parentCompany: "Hyundai Motor Company",
        brandLogo: "https://freelogopng.com/images/all_img/1686590236old-kia-logo-png.png",
    },
    {
        name: "Renault",
        parentCompany: "Renault S.A.",
        brandLogo: "https://media.whichcar.com.au/uploads/2021/08/0fe9afa2-renault-627x768.png",
    },

    // --- German Premium Brands (Strong Presence) ---
    {
        name: "Mercedes-Benz",
        parentCompany: "Mercedes-Benz Group AG",
        brandLogo: "https://1000logos.net/wp-content/uploads/2018/04/Mercedes-Benz-Logo.png",
    },
    {
        name: "BMW",
        parentCompany: "Bayerische Motoren Werke AG",
        brandLogo: "https://cdn.freebiesupply.com/logos/thumbs/2x/bmw-2-logo.png",
    },
    {
        name: "Audi",
        parentCompany: "Volkswagen Group",
        brandLogo: "https://autoblue.al/uploads/custom-images/brand--2024-12-04-09-31-26-2245.webp",
    },

    // --- VW Group Brands (Growing Presence) ---
    {
        name: "Volkswagen",
        parentCompany: "Volkswagen Group",
        brandLogo: "https://1000logos.net/wp-content/uploads/2021/04/Volkswagen-logo.png",
    },
    {
        name: "Škoda",
        parentCompany: "Volkswagen Group",
        brandLogo: "https://logos-world.net/wp-content/uploads/2022/09/Skoda-logo.png",
    },

    // --- Other Foreign Brands (Niche/Premium) ---
    {
        name: "MG Motor",
        parentCompany: "SAIC Motor (China)",
        brandLogo: "https://thefederal.com/file/2021/09/MG-1.png",
    },
    {
        name: "Citroën",
        parentCompany: "Stellantis N.V.",
        brandLogo: "https://www.pngplay.com/wp-content/uploads/15/Citroen-New-Logo-Background-PNG-Image.png",
    },
    {
        name: "Jeep",
        parentCompany: "Stellantis N.V.",
        brandLogo: "https://logos-world.net/wp-content/uploads/2021/09/Jeep-Logo.png",
    },

    // --- Ultra-Luxury/High-End Brands ---
    {
        name: "Jaguar",
        parentCompany: "Tata Motors (Jaguar Land Rover)",
        brandLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Jaguar_2024.svg/1280px-Jaguar_2024.svg.png",
    },
    {
        name: "Land Rover",
        parentCompany: "Tata Motors (Jaguar Land Rover)",
        brandLogo: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4a/LandRover.svg/2560px-LandRover.svg.png",
    },
];

export const seedBrands = async () => {
    try {
        for (const brand of defaultBrands) {
            const exists = await Brand.findOne({ name: brand.name });
            if (!exists) {
                await Brand.create(brand);
                console.log(`Brand seeded: ${brand.name}`);
            } else {
                console.log(`Brand already exists: ${brand.name}`);
            }
        }
    } catch (error) {
        console.error("Error seeding brands:", error);
    }
};
