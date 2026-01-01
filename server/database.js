import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from project root (parent of server/)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Use Netlify's auto-provisioned variable, fallback to DATABASE_URL for local dev
const connectionString = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
const sql = neon(connectionString);

// Initialize tables
async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      id SERIAL PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS personal_overview (
      id SERIAL PRIMARY KEY,
      about_me TEXT NOT NULL,
      video_url TEXT,
      traits TEXT NOT NULL,
      image1_url TEXT,
      image2_url TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS experience (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      period TEXT NOT NULL,
      company TEXT NOT NULL,
      details TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS testimonials (
      id SERIAL PRIMARY KEY,
      video_url TEXT,
      quote TEXT NOT NULL,
      author TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS skills (
      id SERIAL PRIMARY KEY,
      category TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS skill_items (
      id SERIAL PRIMARY KEY,
      skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      details TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS hobbies (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      details TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS contact_info (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      tagline TEXT NOT NULL,
      email TEXT,
      linkedin_url TEXT,
      github_url TEXT,
      calendar_url TEXT,
      spotify_embed_url TEXT,
      google_calendar_embed_url TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT,
      preferred_date TEXT,
      message TEXT,
      read INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

export { sql, initDb };
