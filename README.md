

# Real-Time Chat Application

This is a full-stack real-time chat application built with modern web technologies (MERN Stack and Web Socket) by Adam Ait Oufkir and Zineb Chibli for professor Filali as a NodeJs Project.

## Features

### Authentication & User Management
- Email-based signup with verification
- Secure login with JWT authentication
- Password reset functionality
- Profile picture upload and management
- Friend request system (send, accept, reject)
- User blocking functionality

### Chat Features
- Real-time private messaging
- Image sharing in chats
- Message status indicators (sent, seen)
- Typing indicators
- Message deletion and forwarding
- Online/offline user status
- Group chat support
- Advanced search functionality

### Video & Audio Calling
- One-on-one video and audio calls
- Screen sharing capability
- Call notifications and alerts
- Join/leave sound effects

### User Interface
- Modern, responsive design
- Multiple theme options (Dark/Light mode support)
- Toast notifications
- Intuitive error handling and loading indicators

## Technologies Used

### Frontend
- React.js (Vite setup)
- Tailwind CSS with DaisyUI
- Zustand for state management
- Socket.IO Client for real-time communication
- React Router for navigation
- Axios for HTTP requests
- ZegoCloud for video calling
- React Hot Toast for notifications

### Backend
- Node.js with Express
- MongoDB with Mongoose
- Socket.IO for real-time communication
- JWT for authentication
- Bcrypt for password hashing
- Cloudinary for image storage
- Nodemailer for email services

### Development Tools
- ESLint for code linting
- Nodemon for live server reloading
- Environment variables management with `.env`
- CORS for secure cross-origin requests

---

## Installation

### 1. Clone the Repository
```bash
git clone [repository-url]
```

### 2. Install Dependencies
#### Backend:
```bash
cd backend
npm install
```

#### Frontend:
```bash
cd ../frontend
npm install
```

### 3. Set Up Environment Variables
#### Backend (`backend/.env`):
```plaintext
PORT=5001
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

#### Frontend (`frontend/.env`):
```plaintext
VITE_ZEGOCLOUD_APP_ID=your_zegocloud_app_id
VITE_ZEGOCLOUD_SERVER_SECRET=your_zegocloud_server_secret
```

### 4. Run the Application
#### Backend:
```bash
cd backend
npm run dev
```

#### Frontend:
```bash
cd frontend
npm run dev
```

---

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── lib/
│   │   └── index.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── lib/
│   │   └── App.jsx
│   └── package.json
└── package.json
```

---

## Deployment

To deploy the application:

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. Start the production server:
   ```bash
   cd backend
   npm start
   ```

---

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests to improve the project.

---

