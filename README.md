🧠 Smart Leave Management API

A role-based Leave Management System API built with Node.js, Express, and MongoDB, designed for schools, universities, companies, and institutions to manage staff leave requests efficiently.

🚀 Features
🔐 Authentication & Authorization

JWT-based authentication

Secure login system

Role-based access control

👥 User Roles

ADMIN

MANAGER

STAFF

📋 Leave Management

Staff can request leave

Managers/Admins can approve or reject leave

Automatic leave balance deduction

Leave status tracking (Pending, Approved, Rejected)

🏢 Institution Ready

Works for schools, universities, hospitals, NGOs, and companies

Scalable and production-ready architecture

🧑‍💼 Role Permissions
Action	STAFF	MANAGER	ADMIN
Login	✅	✅	✅
Request leave	✅	❌	❌
View own leaves	✅	❌	❌
Approve / Reject leave	❌	✅	✅
Create users	❌	❌	✅
View all users	❌	❌	✅
System configuration	❌	❌	✅
🛠️ Tech Stack

Node.js

Express.js

MongoDB & Mongoose

JWT (Authentication)

bcrypt (Password hashing)

dotenv

📁 Project Structure
smart-leave-management-api/
│
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── jwt.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   └── leave.controller.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── role.middleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   └── LeaveRequest.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   └── leave.routes.js
│   │
│   ├── utils/
│   │   └── token.js
│   │
│   └── app.js
│
├── server.js
├── .env
├── package.json
└── README.md

🔑 Authentication Flow
Login Response Example
{
  "token": "jwt_token_here",
  "user": {
    "id": 12,
    "email": "admin@example.com",
    "fullName": "Admin User",
    "role": "ADMIN",
    "profilePictureUrl": null,
    "leaveBalance": 20,
    "carryOverBalance": 0
  }
}

📡 API Endpoints
🔐 Auth
Method	Endpoint	Description
POST	/api/auth/login	User login
👤 Users (ADMIN only)
Method	Endpoint	Description
POST	/api/users	Create user
GET	/api/users	Get all users
🗓️ Leave Requests
Method	Endpoint	Role
POST	/api/leaves	STAFF
GET	/api/leaves/my	STAFF
PATCH	/api/leaves/:id/approve	MANAGER / ADMIN
PATCH	/api/leaves/:id/reject	MANAGER / ADMIN
⚙️ Environment Variables

Create a .env file in the root directory:

PORT=8080
MONGO_URI=mongodb://localhost:27017/smart_leave_management
JWT_SECRET=supersecretkey

▶️ Running the Project
1️⃣ Install dependencies
npm install

2️⃣ Start MongoDB
mongod

3️⃣ Run the server
npm run dev


or

npm start

🌍 Use Cases

Schools & Universities

Hospitals

NGOs

Corporate Organizations

Government Institutions

🛣️ Roadmap

Email notifications

Department management

Holiday calendar

Leave analytics dashboard

Frontend (React / Next.js)

Docker & cloud deployment

🤝 Contributing

Contributions are welcome!
Fork the repo, create a feature branch, and submit a pull request.

📄 License

MIT License
