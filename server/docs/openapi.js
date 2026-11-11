export const openapiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Borrow My Stuff API",
    version: "1.0.0",
    description: "API for the Borrow My Stuff peer-to-peer campus marketplace.",
  },
  servers: [{ url: "/" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      cookieAuth: { type: "apiKey", in: "cookie", name: "access_token" },
    },
    schemas: {
      Error: {
        type: "object",
        required: ["success", "code", "message"],
        properties: {
          success: { type: "boolean", example: false },
          code: { type: "string", example: "VALIDATION_ERROR" },
          message: { type: "string", example: "Invalid request" },
        },
      },
    },
  },
  paths: {
    "/api/auth/register": {
      post: {
        summary: "Register a college user",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object" } } } },
        responses: { 201: { description: "Registered" }, 400: { description: "Invalid input" } },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Log in and set an HttpOnly access cookie",
        responses: { 200: { description: "Authenticated" }, 401: { description: "Invalid credentials" } },
      },
    },
    "/api/items": {
      get: { summary: "List available items", responses: { 200: { description: "Items" } } },
      post: {
        summary: "Create an item",
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: { 201: { description: "Created" }, 401: { description: "Unauthorized" } },
      },
    },
    "/api/bookings": {
      post: {
        summary: "Create an atomic booking",
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: {
          201: { description: "Created" },
          409: { description: "Item unavailable" },
          503: { description: "Transactions unavailable" },
        },
      },
    },
    "/api/bookings/incoming": {
      get: {
        summary: "List bookings for the authenticated owner's items",
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [{ name: "status", in: "query", schema: { type: "string" } }],
        responses: { 200: { description: "Bookings" }, 401: { description: "Unauthorized" } },
      },
    },
    "/api/bookings/{id}": {
      put: {
        summary: "Perform an authorized booking state transition",
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Updated" }, 409: { description: "Invalid transition" } },
      },
    },
    "/api/gigs": {
      get: { summary: "List open gigs", responses: { 200: { description: "Gigs" } } },
      post: {
        summary: "Create a gig",
        security: [{ cookieAuth: [] }, { bearerAuth: [] }],
        responses: { 201: { description: "Created" } },
      },
    },
  },
}
