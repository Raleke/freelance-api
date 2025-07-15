const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Freelance API",
    version: "1.0.0",
    description: "OpenAPI documentation for the Freelance platform.",
  },
  servers: [
    {
      url: "http://localhost:4000",
      description: "Development server",
    },
    {
      url: "https://freelance-api-qd9n.onrender.com", 
      description: "Production server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
 apis: ["./routes/**/*.js", "./models/**/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;