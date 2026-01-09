# File Sharing Tool with WhatsApp Integration

A web-based file sharing application that integrates with WhatsApp Web to send files to contacts and groups, with comprehensive logging of all activities.

## Features

- 📁 File upload with drag-and-drop interface
- 📱 WhatsApp Web integration for sending files
- 👥 Contact and group management
- 📊 Comprehensive logging system
- ☁️ Hybrid file storage (local + cloud)
- 🔍 Log viewer with filtering capabilities

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite with Prisma ORM
- **WhatsApp**: whatsapp-web.js

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- WhatsApp account for authentication

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

2. Set up environment variables:
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration
```

3. Initialize database:
```bash
cd backend
npx prisma migrate dev
```

4. Start development servers:
```bash
npm run dev
```

This will start both frontend (usually on http://localhost:5173) and backend (usually on http://localhost:3000) servers.

## Usage

1. Open the web application in your browser
2. Scan the QR code with WhatsApp to authenticate
3. Upload files using the drag-and-drop interface
4. Select contacts or groups to send files to
5. View logs in the dashboard

## Project Structure

```
file_share/
├── frontend/          # React web application
├── backend/           # Node.js/Express server
├── shared/            # Shared types
└── package.json       # Root workspace configuration
```
