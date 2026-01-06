# SomebodyHire.me

A personal portfolio and interview scheduling application built with React, Vite, and Netlify Functions. Features an admin dashboard for content management, Google Calendar integration for scheduling, and Gmail integration for notifications.

## Tech Stack

- **Frontend:** React, Vite, TailwindCSS, Radix UI, MUI
- **Backend:** Netlify Functions (serverless Express)
- **Database:** Neon (serverless Postgres)
- **Auth:** JWT-based authentication
- **Integrations:** Google Calendar, Gmail

## Prerequisites

- Node.js 18+
- npm or pnpm
- A Netlify account
- A Google Cloud Console account (for OAuth)

## Installing Dependencies

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd somebodyhire_me
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root (see Environment Variables section below).

4. Start the development server:
   ```bash
   npm run dev
   ```

## Hosting on Netlify

### Initial Deployment

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket).

2. Log in to [Netlify](https://app.netlify.com/) and click "Add new site" > "Import an existing project".

3. Connect your Git provider and select your repository.

4. Configure the build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions`

5. Click "Deploy site".

### Environment Variables

After deploying, add the following environment variables in Netlify:

1. Go to Site settings > Environment variables.
2. Add each of these variables:

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | A strong random string for signing JWT tokens |
| `GOOGLE_CLIENT_ID` | Your Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL (see Google OAuth section) |

Note: `NETLIFY_DATABASE_URL` is automatically provisioned by the Neon extension.

## Setting up Neon (via the Netlify Extension)

The Neon Postgres extension automatically provisions a database and sets the `NETLIFY_DATABASE_URL` environment variable.

### Installation

1. In your Netlify site dashboard, go to "Extensions" in the sidebar.

2. Search for "Neon" and click on the Neon Postgres extension.

3. Click "Install" and authorize the connection to your Neon account. If you do not have a Neon account, you will be prompted to create one.

4. Once installed, Netlify will automatically provision a Neon database and inject the `NETLIFY_DATABASE_URL` environment variable into your site.

5. Trigger a redeploy for the changes to take effect: go to Deploys > Trigger deploy > Deploy site.

### Database Schema

After the database is provisioned, you need to create the required tables. Connect to your Neon database using the Neon Console SQL Editor or a Postgres client, then run the schema migrations.

Required tables:
- `admin_users` (for authentication)
- `site_settings` (key/value settings storage)
- `personal_overview` (about section content)
- `experience` (work history)
- `testimonials` (quotes and video testimonials)
- `skills` and `skill_items` (skills by category)
- `hobbies` (hobbies list)
- `contact_info` (contact details)
- `contact_submissions` (form submissions inbox)

### Local Development with Neon

For local development, you can use the same Neon database or create a separate branch:

1. Go to your Neon dashboard and copy the connection string.
2. Add it to your local `.env` file:
   ```
   DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

## Setting up Google OAuth Client

Google OAuth enables calendar event creation and email notifications when visitors submit interview requests.

### Create OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).

2. Create a new project or select an existing one.

3. Enable the required APIs:
   - Navigate to "APIs and Services" > "Library"
   - Search for and enable:
     - Google Calendar API
     - Gmail API

4. Configure the OAuth consent screen:
   - Go to "APIs and Services" > "OAuth consent screen"
   - Choose "External" user type (or "Internal" for Google Workspace)
   - Fill in the required app information
   - Add the following scopes:
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/gmail.send`
     - `https://www.googleapis.com/auth/userinfo.email`
   - Add your email as a test user (required during development)

5. Create OAuth credentials:
   - Go to "APIs and Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application"
   - Add authorized redirect URIs:
     - Production: `https://your-site.netlify.app/.netlify/functions/api/api/google/callback`
     - Local dev: `http://localhost:8888/.netlify/functions/api/api/google/callback`
   - Click "Create" and copy the Client ID and Client Secret

### Configure Environment Variables

Add the following to your Netlify environment variables:

```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://your-site.netlify.app/.netlify/functions/api/api/google/callback
```

### Connect Google Account

1. Deploy your site with the Google OAuth environment variables set.

2. Log in to the admin dashboard at `/admin`.

3. Go to the Settings or Integrations section.

4. Click "Connect Google Account" and authorize the application.

5. Once connected, interview requests with a preferred date/time will automatically create Google Calendar events and send email notifications.

### Publishing Your App

While in development, only test users added to your OAuth consent screen can authorize the app. To allow any user to connect:

1. Go to the OAuth consent screen in Google Cloud Console.
2. Click "Publish App" and complete the verification process if required.

## Project Structure

```
somebodyhire_me/
├── netlify/
│   └── functions/
│       └── api.js          # Serverless API (Express)
├── src/
│   ├── app/
│   │   ├── admin/          # Admin dashboard components
│   │   ├── components/     # Shared React components
│   │   ├── App.tsx         # Main app component
│   │   └── api.ts          # Frontend API client
│   └── styles/             # CSS and fonts
├── .env                    # Local environment variables (not committed)
├── netlify.toml            # Netlify configuration
├── package.json
└── vite.config.ts
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

## License

MIT
