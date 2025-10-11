import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import path from "path";
import { BASE_URL_SERVER } from "../utils";

const options = {
    definition: {
        openapi: "3.0.3",
        info: {
            title: "Inventory Management System API",
            version: "1.0.0",
            description: "API documentation for Inventory Management System"
        },
        servers: [
            {
                url: `${BASE_URL_SERVER}/api/v1/inventory`,
            }
        ]
    },
    apis: [path.join(__dirname, "../modules/**/*.yaml"), path.join(__dirname, "../modules/**/*.ts")],

};
const swaggerSpecs = swaggerJsdoc(options);
// app.use("/api/v1/inventory/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

export { swaggerUi, swaggerSpecs };
