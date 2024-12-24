# Unstuck

A gentle, step-by-step guide to help you overcome procrastination and get things done. Built with Next.js, FastAPI, and OpenAI.

## Features

- Break down tasks into manageable steps
- Get personalized motivation and guidance
- Smooth, animated interface
- Mobile-friendly design
- Keyboard shortcuts for power users

## Tech Stack

- Frontend: Next.js, TailwindCSS
- Backend: FastAPI, OpenAI API
- Deployment: Vercel (frontend), Render (backend)

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/unstuck.git
cd unstuck
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd server
pip install -r requirements.txt
```

4. Create environment files:

Frontend (.env.local):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Backend (server/.env):
```
OPENAI_API_KEY=your_api_key_here
ALLOWED_ORIGINS=http://localhost:3000
```

### Development

Run both frontend and backend in development mode:
```bash
npm run app
```

Or run them separately:

Frontend:
```bash
npm run dev
```

Backend:
```bash
npm run server
```

## Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables

### Backend (Render)

1. Connect to Render
2. Add environment variables
3. Deploy

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
