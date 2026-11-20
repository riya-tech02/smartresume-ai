# SmartResume AI

SmartResume AI is a full-stack resume builder for students and job seekers. It combines resume editing, live A4 previews, ATS analysis, job-description matching, AI writing assistance, and PDF export.

## Features

- Secure email/password registration and login
- Resume creation, duplication, editing, deletion, and optimistic concurrency
- Four resume templates, including a minimal ATS-safe template
- ATS score, formatting checks, content checks, and recommendations
- Job-description keyword and requirement matching
- AI summary, bullet, project, achievement, grammar, and tailoring assistance
- Draft autosave and live A4 preview
- PDF export and print fallback
- User settings, password changes, data export, and account deletion

## Tech Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand
- Backend: Node.js 22, Express 5, Mongoose, Zod, JWT, Puppeteer
- Shared: Zod schemas and TypeScript types
- Database: MongoDB
- Tests: Vitest, Supertest, React Testing Library, Playwright

## Project Structure

```text
client/   React frontend
server/   Express API and PDF service
shared/   Shared schemas, types, and constants
docs/     Implementation and architecture documentation
```

## Local Development

Requirements:

- Node.js 22+
- npm 10+
- MongoDB running locally or a MongoDB Atlas connection

```bash
npm install
cp server/.env.example server/.env
cp client/.env.example client/.env.local
npm run dev
```

The frontend runs at `http://localhost:5173` and the API at `http://localhost:5001`.

Minimum production server variables:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=<at-least-32-random-characters>
PRINT_TOKEN_SECRET=<at-least-32-random-characters>
CLIENT_URL=https://your-vercel-app.vercel.app
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
AI_PROVIDER=mock
```

For frontend/backend on the same domain, use `VITE_API_BASE_URL=/api/v1`. For separate domains, set it to your backend URL, for example `https://smartresume-api.onrender.com/api/v1`.

## Validation

```bash
npm run build
npm run typecheck
npm run test
npm run lint
```

The production build and workspace type checks pass. The shared and server suites pass. The client suite includes resume navigation tests.

## Deploy the Backend on Render

1. Push this repository to GitHub.
2. Create a Render Web Service.
3. Select this repository and use `render.yaml`/Docker deployment.
4. Set `MONGODB_URI` to a MongoDB Atlas connection string.
5. Set `CLIENT_URL` to the final Vercel frontend URL.
6. Generate strong values for `JWT_ACCESS_SECRET` and `PRINT_TOKEN_SECRET`.
7. Keep `NODE_ENV=production`, `COOKIE_SECURE=true`, and `COOKIE_SAME_SITE=none`.
8. Deploy and verify `https://<your-api-host>/api/v1/health`.

Alternatively, deploy the Docker image from `server/Dockerfile` to any Node 20 container platform.

## Deploy the Frontend on Vercel

1. Import the GitHub repository in Vercel.
2. Set the root directory to `client`.
3. Framework preset: Vite.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Set `VITE_API_BASE_URL=https://<your-api-host>/api/v1`.
7. Deploy and copy the Vercel URL.
8. Set the backend `CLIENT_URL` to that exact Vercel URL and redeploy the backend.

The included `client/vercel.json` provides SPA route fallback to `index.html`.
For Git-triggered deployments, make sure your commit email is associated with your GitHub account. You can set it with `git config user.email "<verified GitHub email or GitHub noreply address>"`.

## Push to GitHub

Create a repository on GitHub, then run:

```bash
git init
git add .
git commit -m "Complete SmartResume AI application"
git branch -M main
git remote add origin https://github.com/<github-user>/<repository>.git
git push -u origin main
```

To push a later update:

```bash
git add .
git commit -m "Describe the update"
git push origin main
```

SSH alternative:

```bash
git remote add origin git@github.com:<github-user>/<repository>.git
git push -u origin main
```

Do not commit `.env`, MongoDB credentials, JWT secrets, or AI API keys.
