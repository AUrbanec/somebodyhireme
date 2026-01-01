# SomebodyHire.Me - Portfolio with Admin Panel

A React portfolio site with a password-protected admin panel and SQLite database backend.

## Architecture

```
├── src/                    # Frontend React app
│   ├── app/
│   │   ├── App.tsx         # Original static app (backup)
│   │   ├── AppWithData.tsx # Main app fetching from API
│   │   ├── api.ts          # API service layer
│   │   ├── main.tsx        # Entry point with router
│   │   └── admin/          # Admin panel components
│   │       ├── index.tsx
│   │       ├── AdminLogin.tsx
│   │       └── AdminDashboard.tsx
│   └── styles/
├── server/                 # Backend Express + SQLite
│   ├── index.js            # Express server with API routes
│   ├── database.js         # SQLite database setup
│   ├── seed.js             # Seed data from original content
│   └── package.json
└── package.json            # Frontend dependencies
```

## Setup Instructions

### 1. Install Frontend Dependencies

```bash
cd /home/alex/somebodyhire_me
npm install
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Initialize the Database

```bash
cd server
npm run seed
```

This will:
- Create `portfolio.db` SQLite database
- Seed it with all existing content from the original App.tsx
- Create a default admin user: **username: `admin`**, **password: `admin123`**

⚠️ **IMPORTANT**: Change the admin password after first login!

### 4. Start the Backend Server

```bash
cd server
npm run dev
```

The API server runs on `http://localhost:3001`

### 5. Start the Frontend

In a new terminal:

```bash
cd /home/alex/somebodyhire_me
npm run dev
```

The frontend runs on `http://localhost:5173` (or similar Vite port)

## Usage

### Main Site
- Visit `http://localhost:5173/` to view the public portfolio
- Contact form submissions are saved to the database

### Admin Panel
- Visit `http://localhost:5173/admin` to access the admin panel
- Login with `admin` / `admin123` (change this!)
- Edit all sections of the site:
  - **Hero Section**: Title, taglines, bullet points
  - **Personal Overview**: About me, video URL, traits, images
  - **Experience**: Add/edit/delete work experience entries
  - **Testimonials**: Add/edit/delete testimonials with video URLs
  - **Skills**: Add/edit/delete skill categories and items
  - **Hobbies**: Add/edit/delete hobbies
  - **Contact Info**: Footer info, social links, embed URLs
  - **Inbox**: View contact form submissions
  - **Settings**: Change admin password

## API Endpoints

### Public
- `GET /api/site-data` - Get all site content
- `POST /api/contact` - Submit contact form

### Auth
- `POST /api/auth/login` - Admin login
- `POST /api/auth/change-password` - Change password (authenticated)

### Admin (all require Bearer token)
- `GET/PUT /api/admin/settings` - Site settings
- `GET/PUT /api/admin/personal-overview` - Personal overview
- `GET/POST/PUT/DELETE /api/admin/experience` - Experience entries
- `GET/POST/PUT/DELETE /api/admin/testimonials` - Testimonials
- `GET/POST/PUT/DELETE /api/admin/skills` - Skill categories
- `GET/POST/PUT/DELETE /api/admin/hobbies` - Hobbies
- `GET/PUT /api/admin/contact-info` - Contact info
- `GET/PUT/DELETE /api/admin/submissions` - Form submissions

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001
```

### Backend
```
PORT=3001
JWT_SECRET=your-secret-key-change-in-production
```

## Production Deployment

1. Build the frontend: `npm run build`
2. Set proper `JWT_SECRET` environment variable
3. Use a process manager like PM2 for the backend
4. Consider using a reverse proxy (nginx) to serve both frontend and API
5. Secure the SQLite database file with proper permissions

## Database Schema

The SQLite database includes these tables:
- `site_settings` - Key-value pairs for hero/footer content
- `personal_overview` - About section content
- `experience` - Work experience entries
- `testimonials` - Testimonial quotes and videos
- `skills` - Skill categories
- `skill_items` - Individual skills within categories
- `hobbies` - Hobbies/interests
- `contact_info` - Contact details and social links
- `admin_users` - Admin credentials (hashed passwords)
- `contact_submissions` - Form submissions inbox
