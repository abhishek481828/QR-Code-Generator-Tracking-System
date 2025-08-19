QR Code Generator and Tracking System
📌 Overview

The QR Code Generator and Tracking System is a full-stack web application that allows users to generate unique QR codes and track their usage in real time.
It provides detailed analytics such as scan count, location, and device type, making it useful for businesses, events, and marketing campaigns.

🚀 Features

✅ Generate unique static and dynamic QR codes

✅ Customizable QR code design with logos and colors

✅ Real-time tracking of QR code scans

✅ Analytics dashboard: scan count, location, device, and time of scan

✅ Role-based access: Admin & User dashboards

✅ Secure backend with authentication

🏗️ Project Structure
QR-Code-Generator-Tracking-System/
│── backend/              # Node.js + Express backend
│   ├── middleware/       # Authentication and request handlers
│   ├── models/           # Database models (e.g., Users, QR Codes, Logs)
│   ├── routes/           # API routes for QR code and user management
│   ├── .env              # Environment variables
│   ├── package.json      # Backend dependencies
│   └── server.js         # Backend entry point
│
│── frontend/             # React.js frontend
│   ├── public/           # Static assets
│   └── src/
│       ├── components/   # Reusable UI components
│       │   ├── AdminDashboard.js
│       │   ├── LandingPage.js
│       │   ├── LocationDebugger.js
│       │   ├── LoginPage.js
│       │   ├── MapComponent.js
│       │   ├── ProtectedRoute.js
│       │   ├── QRScanner.js
│       │   ├── SuperAdminDashboard.js
│       │   └── UserDashboard.js
│       ├── contexts/     # Context API for state management
│       ├── styles/       # CSS/Styling
│       ├── utils/        # Helper functions
│       ├── App.js        # Root React component
│       └── index.js      # Entry point
│
│── README.md             # Project documentation

⚙️ Tech Stack
Frontend: React.js, Context API, CSS
Backend: Node.js, Express.js
Database: MongoDB
Other Tools: QR code libraries, JWT authentication
🔧 Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/your-username/QR-Code-Generator-Tracking-System.git
cd QR-Code-Generator-Tracking-System

2️⃣ Backend Setup
cd backend
npm install


Create a .env file inside backend/ with:

MONGO_URI=your_mongo_database_url
JWT_SECRET=your_secret_key
PORT=5000


Run backend server:

npm start

3️⃣ Frontend Setup
cd frontend
npm install
npm start

🎯 Usage

Register or login to the system.

Generate a unique QR code for a link, text, or product.

Distribute the QR code.

Track scans in the Admin/User dashboard with insights like time, location, and device.

📊 Applications

📦 Product packaging & inventory management

📊 Marketing campaigns & customer engagement

🎟️ Event ticketing & attendance tracking

🏢 Business cards & networking

👨‍💻 Author

Developed by Abhishek
