import swaggerJsdoc from "swagger-jsdoc";

/**
 * Server URLs read at request time so PRODUCTION_URL / LOCAL_URL from .env are used
 * (env is loaded after some modules in ESM, so we read process.env when building the spec).
 */
function getServerUrls() {
  const local = (process.env.LOCAL_URL || "http://localhost:8081").trim();
  const production = (
    process.env.PRODUCTION_URL || "https://leave-management-api.onrender.com"
  ).trim();
  return { local, production };
}

const optionsBase = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Smart Leave Management API",
      version: "1.0.0",
      description: `
        A role-based Leave Management System API.
        Designed for schools, universities, companies, and institutions to manage staff leave requests efficiently.
        
        ## Features
        - JWT-based authentication
        - Role-based access control (ADMIN, MANAGER, STAFF)
        - Yearly leave policy with automatic reset
        - Leave balance tracking with carry-over support
        - Leave request approval/rejection workflow
        
        ## Business Rules
        1. Every STAFF user is entitled to **25 leave days per calendar year**
        2. Leave balance resets every year automatically
        3. Users can carry over **a maximum of 5 unused days** to the next year
        4. Leave requests are rejected if requested days exceed available balance
        5. Only APPROVED leaves deduct balance
      `,
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      { url: "http://localhost:8081", description: "Local Development Server" },
      {
        url: "https://leave-management-api.onrender.com",
        description: "Production Server",
      },
    ],
    tags: [
      { name: "Auth", description: "Login and super admin login" },
      { name: "Users", description: "User management (ADMIN)" },
      {
        name: "Admin",
        description: "Admin-only: create user, invite by email",
      },
      { name: "Leave Requests", description: "Leave request workflow" },
      { name: "Dashboard", description: "Admin dashboard stats and users" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token obtained from /api/auth/login",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "User ID",
              example: "507f1f77bcf86cd799439011",
            },
            fullName: {
              type: "string",
              description: "Full name of the user",
              example: "John Doe",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
              example: "john.doe@example.com",
            },
            role: {
              type: "string",
              enum: ["ADMIN", "MANAGER", "STAFF"],
              description: "User role",
              example: "STAFF",
            },
            profilePictureUrl: {
              type: "string",
              nullable: true,
              description: "URL to user profile picture",
              example: null,
            },
            leaveBalance: {
              type: "number",
              description: "Current available leave days",
              example: 25,
            },
            carryOverBalance: {
              type: "number",
              description: "Carried over leave days from previous year (max 5)",
              example: 0,
            },
            annualLeaveEntitlement: {
              type: "number",
              description: "Annual leave entitlement (default: 25)",
              example: 25,
            },
            leaveYear: {
              type: "number",
              description: "The calendar year this leave balance applies to",
              example: 2026,
            },
          },
        },
        LeaveRequest: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Leave request ID",
              example: "507f1f77bcf86cd799439012",
            },
            requester: {
              type: "string",
              description: "User ID of the requester",
              example: "507f1f77bcf86cd799439011",
            },
            startDate: {
              type: "string",
              format: "date",
              description: "Start date of leave (ISO 8601)",
              example: "2026-03-01",
            },
            endDate: {
              type: "string",
              format: "date",
              description: "End date of leave (ISO 8601)",
              example: "2026-03-05",
            },
            days: {
              type: "number",
              description: "Number of leave days requested (inclusive)",
              example: 5,
            },
            reason: {
              type: "string",
              nullable: true,
              description: "Reason for leave request",
              example: "Family vacation",
            },
            status: {
              type: "string",
              enum: ["PENDING", "APPROVED", "REJECTED"],
              description: "Leave request status",
              example: "PENDING",
            },
            approvedBy: {
              type: "string",
              nullable: true,
              description: "User ID of the approver",
              example: null,
            },
            decisionAt: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "Timestamp when decision was made",
              example: null,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when request was created",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Timestamp when request was last updated",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "User email address",
              example: "staff@example.com",
            },
            password: {
              type: "string",
              format: "password",
              description: "User password",
              example: "password123",
            },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            token: {
              type: "string",
              description: "JWT authentication token",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            user: {
              $ref: "#/components/schemas/User",
            },
          },
        },
        CreateUserRequest: {
          type: "object",
          required: ["fullName", "email", "password"],
          properties: {
            fullName: {
              type: "string",
              description: "Full name of the user",
              example: "Jane Smith",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
              example: "jane.smith@example.com",
            },
            password: {
              type: "string",
              format: "password",
              description: "User password",
              example: "securePassword123",
            },
            role: {
              type: "string",
              enum: ["ADMIN", "MANAGER", "STAFF"],
              default: "STAFF",
              description: "User role",
              example: "STAFF",
            },
            profilePictureUrl: {
              type: "string",
              nullable: true,
              description: "URL to user profile picture",
              example: null,
            },
            annualLeaveEntitlement: {
              type: "number",
              default: 25,
              description: "Annual leave entitlement",
              example: 25,
            },
          },
        },
        CreateLeaveRequest: {
          type: "object",
          required: ["startDate", "endDate"],
          properties: {
            startDate: {
              type: "string",
              format: "date",
              description: "Start date of leave (ISO 8601 format: YYYY-MM-DD)",
              example: "2026-03-01",
            },
            endDate: {
              type: "string",
              format: "date",
              description: "End date of leave (ISO 8601 format: YYYY-MM-DD)",
              example: "2026-03-05",
            },
            reason: {
              type: "string",
              nullable: true,
              description: "Reason for leave request",
              example: "Family vacation",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Error message",
              example: "Invalid email or password.",
            },
            details: {
              type: "object",
              description: "Additional error details",
              example: {
                available: 10,
                requested: 15,
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

/**
 * Build the OpenAPI spec with server URLs from process.env (read at call time).
 * Use when serving /api/docs.json so PRODUCTION_URL / LOCAL_URL from .env are applied.
 */
export function getSwaggerSpec() {
  const { local, production } = getServerUrls();
  const options = {
    ...optionsBase,
    definition: {
      ...optionsBase.definition,
      servers: [
        { url: local, description: "Local Development Server" },
        { url: production, description: "Production Server" },
      ],
    },
  };
  return swaggerJsdoc(options);
}
