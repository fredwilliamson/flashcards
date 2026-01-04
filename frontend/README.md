# FlashCard Frontend

React + TypeScript + Vite + Tailwind CSS + shadcn/ui

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/       # Reusable components
├── contexts/         # React contexts (Auth, etc.)
├── pages/           # Page components
│   ├── admin/       # Admin pages
│   └── student/     # Student pages
├── services/        # API services
├── types/           # TypeScript types
├── App.tsx          # Main app component with routing
├── main.tsx         # Entry point
└── index.css        # Global styles (Tailwind)
```

## Features

- **Authentication**: Login, JWT token management
- **Admin Dashboard**: Manage users, decks, view stats
- **Student Dashboard**: View available decks, play games
- **Game Interface**: Flashcard game with question/answer validation
- **Protected Routes**: Role-based access control

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tool
- **React Router** for routing
- **Axios** for API calls
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components (to be added)



