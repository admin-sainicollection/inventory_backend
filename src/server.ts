import app from "./app";
import connectDB from "./config/mongodb/database";
import { seedBrands } from "./scripts/seedBrands";
import { seedCategories } from "./scripts/seedCategories";
import { seedCarModels } from "./scripts/seedCompatibility";
import { seedDefaultUnknownCustomer } from "./scripts/seedDefaultUnknownCustomer";
import { seedPriceCode } from "./scripts/seedPriceCode";
import { seedRolesAndAdmin } from "./scripts/seedRolesAndAdmin";
import { PORT } from "./utils";
import { BASE_URL_SERVER } from "./utils";


(async () => {
    await connectDB();
    await seedRolesAndAdmin();
    await seedCategories();
    await seedCarModels();
    await seedBrands();
    await seedPriceCode();
    await seedDefaultUnknownCustomer();
    app.listen(PORT, () => {
        console.log(`Server running on this URL -> ${BASE_URL_SERVER}`)
    })
})()
