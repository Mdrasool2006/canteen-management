# 🍽️ Choose Your Meal – Canteen Management System

A light, glassmorphism-styled MERN application for campus canteens.

- **Landing page** with an interactive 3D hero, an About section and "How it works"
- **Sign up / log in** with **email or phone number** + password
- **OTP verification** for every new account (email via SMTP, SMS via Twilio)
- **Customers** pick a shop, browse its menu, add items to a cart and place orders
- **Sellers** set up a shop profile, add menu items **with photos**, toggle availability, and manage incoming orders (pending → preparing → ready → completed)

## Tech stack

| Layer    | Technology                                                 |
| -------- | ---------------------------------------------------------- |
| Frontend | React 18, Vite, React Router, Axios, react-hot-toast, CSS  |
| Backend  | Node.js, Express, Mongoose, JWT, bcryptjs, Multer          |
| Database | MongoDB (Atlas recommended)                                |
| Services | Nodemailer (email OTP), Twilio (SMS OTP, optional), Cloudinary (image hosting, optional) |
| Hosting  | Vercel (client and server deployed as two projects)        |

## Project structure

```
canteen-management/
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── api/             # Axios instance with JWT interceptor
│   │   ├── components/      # Navbar, ShopCard, ProtectedRoute, seller/*
│   │   ├── context/         # AuthContext (session handling)
│   │   ├── pages/           # Landing, Login, Register, Verify, customer/*, seller/*
│   │   ├── styles/          # global.css (glass theme, 3D landing styles)
│   │   └── utils/           # formatting helpers
│   └── vercel.json
└── server/                  # Express + MongoDB backend
    ├── api/index.js         # Vercel serverless entry
    ├── config/              # MongoDB connection (cached)
    ├── controllers/         # auth, shop, menu, order logic
    ├── middleware/          # JWT auth, role guard, uploads, error handling
    ├── models/              # User, Otp, Shop, MenuItem, Order
    ├── routes/              # REST routes under /api
    ├── utils/               # OTP, identifier parsing, email/SMS, image upload
    ├── app.js               # Express app (shared by local + Vercel)
    ├── server.js            # Local dev entry
    └── vercel.json
```

## API overview

| Method | Endpoint                    | Access   | Description                              |
| ------ | --------------------------- | -------- | ---------------------------------------- |
| POST   | `/api/auth/register`        | Public   | Create account (email or phone) + send OTP |
| POST   | `/api/auth/verify-otp`      | Public   | Verify OTP, returns JWT                  |
| POST   | `/api/auth/resend-otp`      | Public   | Resend OTP (30s cooldown)                |
| POST   | `/api/auth/login`           | Public   | Login with email/phone + password        |
| GET    | `/api/auth/me`              | Logged in | Current user                            |
| GET    | `/api/shops`                | Public   | List shops                               |
| GET    | `/api/shops/:id`            | Public   | Shop details + available menu            |
| GET    | `/api/shops/mine`           | Seller   | Own shop profile                         |
| PUT    | `/api/shops/mine`           | Seller   | Create/update shop (optional image)      |
| GET    | `/api/menu/mine`            | Seller   | Own menu                                 |
| POST   | `/api/menu`                 | Seller   | Add menu item (optional image)           |
| PUT    | `/api/menu/:id`             | Seller   | Update menu item                         |
| DELETE | `/api/menu/:id`             | Seller   | Delete menu item                         |
| POST   | `/api/orders`               | Customer | Place an order (prices taken from DB)    |
| GET    | `/api/orders/my`            | Customer | Own orders                               |
| GET    | `/api/orders/shop`          | Seller   | Orders for own shop                      |
| PATCH  | `/api/orders/:id/status`    | Seller   | Update order status                      |

## Run locally

### 1. Prerequisites
- Node.js 18.17+ and npm
- A MongoDB database (free MongoDB Atlas cluster works well)

### 2. Backend

```bash
cd server
cp .env.example .env      # then fill in MONGODB_URI and JWT_SECRET at minimum
npm install
npm run seed              # optional: creates demo accounts, shop and menu
npm run dev               # http://localhost:5000
```

#### Demo accounts (created by `npm run seed`)

| Role     | Email               | Password   |
| -------- | ------------------- | ---------- |
| Customer | customer@demo.com   | demo1234   |
| Seller   | seller@demo.com     | demo1234   |

Both accounts are already verified, so you can log in without an OTP. The seller account owns a demo shop, **Campus Bites**, with sample menu items. Running the seed again resets these accounts and the demo menu without creating duplicates.

### 3. Frontend

```bash
cd client
cp .env.example .env      # leave VITE_API_URL empty for local dev
npm install
npm run dev               # http://localhost:5173
```

### OTP during development
If no SMTP or Twilio settings are provided, the OTP is printed in the **server console** and also shown on the verify screen (development mode only). Add the SMTP variables in `server/.env` to send real emails — a Gmail **app password** works well.

## Deploy to GitHub + Vercel

### 1. Push to GitHub

```bash
cd canteen-management
git init
git add .
git commit -m "Initial commit: Choose Your Meal MERN app"
git branch -M main
git remote add origin https://github.com/<your-username>/canteen-management.git
git push -u origin main
```

### 2. Deploy the backend (API)
1. In Vercel: **Add New → Project** → import the repository.
2. Set **Root Directory** to `server`. Framework preset: *Other*.
3. Add environment variables (from `server/.env.example`): `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` (your frontend URL, set after step 3), plus SMTP/Twilio/Cloudinary variables if you use them. Set `NODE_ENV=production`.
4. Deploy. Note the URL, e.g. `https://glassify-canteen-server.vercel.app`.

### 3. Deploy the frontend
1. **Add New → Project** → import the same repository again.
2. Set **Root Directory** to `client`. Framework preset: *Vite*.
3. Add the environment variable `VITE_API_URL=https://glassify-canteen-server.vercel.app/api`.
4. Deploy, then copy the frontend URL and set it as `CLIENT_URL` on the **server** project (Settings → Environment Variables), then redeploy the server.

### Notes for production
- In production the OTP is never shown on screen, so configure **SMTP** (email) and/or **Twilio** (SMS) first.
- Use **Cloudinary** for images in production. Without it, images are stored as base64 inside MongoDB, which works for demos but is not ideal at scale.
- Use a strong random `JWT_SECRET` (for example, output of `openssl rand -hex 32`).
- Allow your Vercel/Atlas IP settings: in MongoDB Atlas, add `0.0.0.0/0` to the Network Access list so Vercel can connect.

## Roadmap ideas
- Payment gateway integration (Razorpay / Stripe)
- Real-time order updates with Socket.IO
- Admin role for canteen-wide analytics
- Push notifications for order status changes

## License
MIT