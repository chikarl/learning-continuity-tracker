# Learning Continuity Tracker

An offline-first educational platform designed for conflict-affected and low-connectivity regions.

## Tech Stack
- **Backend**: Python (FastAPI / Antigravity Framework)
- **Frontend**: Next.js 15, Tailwind CSS, PWA
- **Database**: PostgreSQL (via SQLAlchemy)
- **Offline Storage**: IndexedDB (via Dexie.js)

## Project Structure
- `/backend`: Python FastAPI application
- `/frontend`: Next.js web application

## Setup Instructions

### Backend
1. Navigate to `/backend`
2. Install dependencies: `pip install -r requirements.txt`
3. Run the server: `python -m app.main`

### Frontend
1. Navigate to `/frontend`
2. Install dependencies: `npm install`
3. Run the dev server: `npm run dev`

## Core Features
- **Learning Gap Tracker**: Calculates missed curriculum percentage.
- **Offline Sync**: Queues data when offline and syncs automatically when online.
- **Role-Based Dashboards**: Tailored views for Students, Teachers, and Admins.
- **PWA Ready**: Can be installed on mobile devices for offline access.
