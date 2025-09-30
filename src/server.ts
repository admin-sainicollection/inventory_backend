import app from "./app";
import connectDB from "./config/mongodb/database";
import { PORT } from "./utils";
import { BASE_URL_SERVER } from "./utils";


(async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on this URL -> ${BASE_URL_SERVER}`)
    })
})()
