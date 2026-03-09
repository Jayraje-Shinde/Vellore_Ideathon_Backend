# 🏗️ Civil Build Rating Consultancy Platform — Backend API

A REST API + real-time chat server for a consultancy marketplace where builders with lower-rated construction certificates (1–4 stars) connect with 5-star certified engineers for professional consultation.

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose (Atlas free tier) |
| Authentication | JWT + bcrypt |
| File Storage | Cloudinary (free tier) |
| Real-time Chat | Socket.io |
| File Uploads | Multer + multer-storage-cloudinary |

---

## 🗂️ Project Structure

```
backend/
├── config/
│   ├── db.js                  # MongoDB connection
│   └── cloudinary.js          # Cloudinary + Multer storage config
│
├── controllers/
│   ├── authController.js      # Register, Login, GetMe
│   ├── buildingController.js  # Building CRUD + consultant assignment
│   └── chatController.js      # Send & fetch messages
│
├── middleware/
│   └── authMiddleware.js      # JWT protect, builderOnly, consultantOnly
│
├── models/
│   ├── User.js                # User schema (builder / consultant)
│   ├── Building.js            # Building schema with photos + status
│   └── Message.js             # Chat message schema
│
├── routes/
│   ├── authRoutes.js
│   ├── buildingRoutes.js
│   └── chatRoutes.js
│
├── .env.example               # Environment variable template
├── package.json
└── server.js                  # App entry point + Socket.io setup
```

---

## ⚙️ Prerequisites

Make sure these are installed before you begin:

- **Node.js** v18 or later → https://nodejs.org
- **npm** v9 or later (comes with Node.js)
- **MongoDB Atlas account** (free) → https://cloud.mongodb.com
- **Cloudinary account** (free) → https://cloudinary.com

---

## 🚀 Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/civil-build-backend.git
cd civil-build-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/civilbuild
JWT_SECRET=your_long_random_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:3000
```

> **Getting your MONGO_URI:** MongoDB Atlas → Connect → Drivers → Copy connection string → replace `<password>` with your DB user password.
>
> **Getting Cloudinary keys:** Cloudinary Dashboard → copy Cloud Name, API Key, API Secret.

### 4. Install nodemon (for development)

```bash
npm install -g nodemon
```

### 5. Start the server

```bash
# Development (auto-restarts on changes)
npm run dev

# Production
npm start
```

**Expected output:**
```
✅ MongoDB Connected: cluster0.xxxx.mongodb.net
🚀 Server running on http://localhost:5000
📡 Socket.io ready for real-time chat
```

---

## 🔐 Authentication

All protected routes require a `Bearer` token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

The token is returned from `/auth/login` and `/auth/register`. It expires in **7 days**.

### Roles

| Role | Permissions |
|---|---|
| `builder` | Upload buildings, view own buildings, chat |
| `consultant` | View all building requests, assign self, chat |

---

## 📡 API Reference

Base URL: `http://localhost:5000`

---

### 🔑 Auth Endpoints

#### `POST /auth/register`
Register a new user. Consultants can attach a certification file.

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | ✅ | |
| `email` | string | ✅ | Must be unique |
| `password` | string | ✅ | Min 6 characters |
| `role` | string | ✅ | `builder` or `consultant` |
| `certification_file` | file | Consultants only | PDF or image |

**Response:**
```json
{
  "message": "Registration successful",
  "token": "eyJhbGci...",
  "user": {
    "id": "64f1a...",
    "name": "John Builder",
    "email": "john@example.com",
    "role": "builder",
    "is_approved": false
  }
}
```

---

#### `POST /auth/login`
Login and receive a JWT token.

**Content-Type:** `application/json`

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGci...",
  "user": { "id": "...", "name": "...", "role": "builder" }
}
```

---

#### `GET /auth/me`
Get the currently logged-in user's profile.

**Headers:** `Authorization: Bearer <token>`

---

### 🏢 Building Endpoints

#### `POST /buildings`
Upload a new building. **Builder only.**

**Content-Type:** `multipart/form-data` | **Auth:** Required

| Field | Type | Required | Notes |
|---|---|---|---|
| `building_name` | string | ✅ | |
| `location` | string | ✅ | |
| `rating` | number | ✅ | 1–4 only |
| `description` | string | ❌ | |
| `certificate` | file | ❌ | PDF or image |
| `photos` | file(s) | ❌ | Up to 10 images |

**Response:**
```json
{
  "message": "Building uploaded successfully",
  "building": {
    "_id": "64f2b...",
    "building_name": "Sunrise Apartments",
    "location": "Mumbai, Maharashtra",
    "rating": 2,
    "status": "pending",
    "photos": [{ "url": "https://res.cloudinary.com/...", "public_id": "..." }],
    "certificate_file": "https://res.cloudinary.com/..."
  }
}
```

---

#### `GET /buildings`
Get all building requests. **Consultant only.**

**Auth:** Required | Optional query params: `?status=pending` `?rating=2`

```json
{
  "count": 5,
  "buildings": [ { ...building }, { ...building } ]
}
```

---

#### `GET /buildings/my`
Get all buildings uploaded by the logged-in builder. **Builder only.**

**Auth:** Required

---

#### `GET /buildings/:id`
Get a single building by ID.

**Auth:** Required | Builders can only access their own buildings.

---

#### `POST /buildings/:id/assign`
Consultant assigns themselves to a building (starts consultation). **Consultant only.**

**Auth:** Required | Building must have `status: "pending"`

**Response:**
```json
{
  "message": "Consultation started successfully",
  "building": { ...building, "status": "in_consultation" }
}
```

---

#### `PUT /buildings/:id/complete`
Mark a consultation as completed. **Consultant only.**

**Auth:** Required | **Content-Type:** `application/json`

```json
{
  "consultant_notes": "Reinforcement of columns recommended. Foundation needs waterproofing."
}
```

---

### 💬 Chat Endpoints

#### `POST /chat/send`
Send a message (text, image, or both).

**Auth:** Required | **Content-Type:** `multipart/form-data`

| Field | Type | Required | Notes |
|---|---|---|---|
| `building_id` | string | ✅ | MongoDB ObjectId |
| `message_text` | string | ❌ | Required if no image |
| `image` | file | ❌ | Required if no text |

> Only the builder and assigned consultant of a building can chat in its room.

---

#### `GET /chat/:buildingId`
Get all messages for a building's chat room. Also marks messages as read.

**Auth:** Required

```json
{
  "count": 12,
  "messages": [
    {
      "_id": "...",
      "message_text": "Please check the foundation photos",
      "image_url": null,
      "message_type": "text",
      "sender_id": { "name": "John Builder", "role": "builder" },
      "createdAt": "2024-11-01T10:30:00.000Z"
    }
  ]
}
```

---

## 🔌 Socket.io Events

Connect to the server: `http://localhost:5000`

### Events to Emit (Client → Server)

| Event | Payload | Description |
|---|---|---|
| `join_room` | `{ buildingId, userId, userName }` | Join a building's chat room |
| `send_message` | `{ buildingId, message }` | Broadcast a message to the room |
| `typing` | `{ buildingId, userName }` | Show typing indicator to others |
| `stop_typing` | `{ buildingId }` | Hide typing indicator |
| `leave_room` | `{ buildingId, userName }` | Leave the chat room |

### Events to Listen On (Server → Client)

| Event | Payload | Description |
|---|---|---|
| `receive_message` | `{ ...message, timestamp }` | A new message arrived |
| `user_joined` | `{ message, userId }` | Someone joined the room |
| `user_left` | `{ message }` | Someone disconnected |
| `user_typing` | `{ userName }` | Someone is typing |
| `user_stop_typing` | `{}` | Someone stopped typing |

### Example (Frontend usage)

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

// Join room when chat opens
socket.emit("join_room", { buildingId, userId, userName });

// Send a message
socket.emit("send_message", {
  buildingId,
  message: { senderName: userName, text: "Hello!", senderId: userId }
});

// Listen for incoming messages
socket.on("receive_message", (msg) => {
  setMessages(prev => [...prev, msg]);
});
```

---

## 📁 File Upload Reference

All files go to Cloudinary automatically.

| Endpoint | Field Name | Max Files | Accepted Formats |
|---|---|---|---|
| `POST /auth/register` | `certification_file` | 1 | jpg, png, pdf |
| `POST /buildings` | `certificate` | 1 | jpg, png, pdf |
| `POST /buildings` | `photos` | 10 | jpg, png, webp |
| `POST /chat/send` | `image` | 1 | jpg, png, webp |

---

## 🗄️ Database Schemas

### User
```
_id, name, email, password (hashed), role, certification_file,
is_approved, profile_photo, bio, createdAt, updatedAt
```

### Building
```
_id, builder_id (ref: User), building_name, location, rating (1-4),
description, certificate_file, photos[], consultant_id (ref: User),
status (pending | in_consultation | completed), consultant_notes,
createdAt, updatedAt
```

### Message
```
_id, building_id (ref: Building), sender_id (ref: User),
message_text, image_url, message_type (text | image | mixed),
is_read, createdAt, updatedAt
```

---

## 🌍 Deployment

### Backend → Railway

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/civil-build-backend.git
git push -u origin main

# 2. Go to railway.app → New Project → Deploy from GitHub
# 3. Add all .env variables in Railway dashboard under Variables
# 4. Railway auto-deploys and gives you a public URL
```

> After deploying frontend to Vercel, update `CLIENT_URL` in Railway to your Vercel URL.

---

## 🔒 Security Notes

- Passwords are hashed using **bcrypt** (salt rounds: 10) — never stored in plain text
- JWT tokens expire in **7 days**
- Builders can only access their own buildings — enforced at controller level
- Only the assigned consultant and the building's owner can access a chat room
- Add `.env` to `.gitignore` — never commit secrets

---

## 📋 Available Scripts

```bash
npm run dev     # Start with nodemon (development)
npm start       # Start with node (production)
```

---

## 🛣️ Roadmap

- [ ] Admin panel for approving consultants
- [ ] AI image analysis for structural issues
- [ ] Rating prediction after consultation
- [ ] Payment system for consultation fees
- [ ] Video consultation via WebRTC
- [ ] Email notifications on assignment

---

## 📄 License

MIT
