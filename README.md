# 🌱 Eco-Friendly Product Store

An **eco-friendly e-commerce web application** built with **React.js, Three.js, Tailwind CSS, Node.js, Express.js, MongoDB, and JWT Authentication**.  
This project allows users to explore and purchase sustainable products, with full authentication, role-based access, and secure payment integration.  

---

## ✨ Features

### 👤 User Features
- **Register & Login** with JWT authentication  
- **Browse Products** with categories and filters  
- **Product Search** for quick discovery  
- **View Product Details** with images, description, and price  
- **Add to Cart & Checkout** (only for authenticated users)  
- **Secure Payments** with Stripe  
- **Automatic Stock Update** after successful payment  

### 🛠️ Admin Features
- **Admin Dashboard** (role-based access)  
- **Add, Update, and Delete Products**  
- **Manage Inventory** – stock automatically reduces after purchases  
- **View and Manage Orders**  

---

## 🖥️ Tech Stack

### Frontend
- ⚛️ React.js  
- 🎨 Tailwind CSS  
- 🎭 Three.js (for interactive 3D visuals)  
- 🔗 Axios (API requests)  
- ⚡ Redux (state management)  

### Backend
- 🟢 Node.js  
- 🚀 Express.js  
- 🗄️ MongoDB with Mongoose  
- 🔐 JWT Authentication & Authorization  
- 💳 Stripe Payment Gateway  
- 🌍 CORS enabled for frontend-backend communication  

---

## ⚙️ Installation & Setup

### 1️ Clone the Repository

git clone (https://github.com/Thagya/Eco-Friendly-Product-Store.git)
cd Eco-Friendly-Product-Store

2 Setup Backend

cd backend
npm install

Create a .env file inside backend/ with the following:

PORT=5000
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your publishable key
STRIPE_WEBHOOK_SECRET=your webhook key

Run the backend:

npm start


Backend runs at: http://localhost:5000

 Setup Frontend
cd ../frontend
npm install


Create a .env file inside frontend/ with:

REACT_APP_API_URL=http://localhost:5000/api


Run the frontend:

npm start


Frontend runs at: http://localhost:3000

🔐 Authentication Flow

Users register/login → receive a JWT token

JWT token is stored in local storage

Protected routes (cart, checkout, orders) require authentication

Admin role is verified from the token payload to allow access to dashboard

💳 Payment & Stock Management

Users checkout via Stripe

After successful payment:

Order is created in database

Stock quantity automatically reduces

Confirmation response sent to frontend

🚀 Deployment
Frontend (GitHub Pages / Vercel)

If using GitHub Pages:

npm run build
npm run deploy


If using Vercel:

Connect repo, select frontend/, set build command npm run build, output build.

Backend (Render / Railway)

Push backend branch to GitHub

On Render:

Select repo branch backend

Build command: npm install

Start command: npm start

Add environment variables in dashboard





