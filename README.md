# AuthFrontend

AuthFrontend is the React-based client application for the authentication and social networking system. It provides the user interface for sign-in, registration, password recovery, profile management, posts, friendships, and real-time messaging.

## Overview

This frontend connects to the backend API and offers a complete experience for:

- User authentication and account management
- Role-based access for users, admins, and super admins
- Profile editing and profile image upload
- Social feeds with posts, likes, and comments
- Friend requests and friend lists
- Private messaging with real-time chat features

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router DOM
- Axios
- Socket.IO client
- Tailwind CSS

## Prerequisites

Make sure the following are installed on your machine:

- Node.js 18 or newer
- npm

## Installation

1. Navigate to the frontend folder:
   ```bash
   cd authfrontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root:
   ```env
   VITE_BACKEND_API=BACKEND_API
   ```

## Running the Application

Start the development server:

```bash
npm run dev
```

Then open the app at:

```text
http://localhost:5173
```

## Main Routes

- `/login` - User login
- `/register` - User registration
- `/forgot-password` - Password recovery flow
- `/otp-page` - OTP verification
- `/dashboard` - User dashboard
- `/homepage` - Social home page
- `/messages` - Inbox overview
- `/messages/:userId` - Private chat view
- `/admin/login` and `/admin/dashboard` - Admin access
- `/sudoadmin/dashboard` - Super admin area

## Build for Production

Generate a production build:

```bash
npm run build
```

The build output will be placed in the `dist` folder.

## Project Structure

- `src/pages` - Main views such as login, dashboard, profile, and chat pages
- `src/components` - Reusable UI elements, modals, and route guards
- `src/context` - Shared app state and context providers
- `src/lib` - Shared API helpers such as the Axios instance
- `src/assets` - Static images and other frontend assets
