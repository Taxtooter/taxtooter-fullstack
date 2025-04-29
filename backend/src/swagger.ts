import swaggerJSDoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Taxtooter API",
            version: "1.0.0",
            description:
                "API documentation for the Taxtooter MERN stack project",
        },
        servers: [
            {
                url: "http://localhost:5000",
            },
        ],
    },
    apis: ["./dist/routes/*.js"], // Path to the compiled API docs
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
