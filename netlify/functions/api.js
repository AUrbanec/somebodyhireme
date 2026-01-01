import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

const app = express();

// Use Netlify's auto-provisioned variable
const connectionString = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
const sql = neon(connectionString);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// ============ AUTH ROUTES ============

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  const users = await sql`SELECT * FROM admin_users WHERE username = ${username}`;
  const user = users[0];
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  
  const validPassword = bcrypt.compareSync(password, user.password_hash);
  if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });
  
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, username: user.username });
});

app.post('/api/auth/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  const users = await sql`SELECT * FROM admin_users WHERE id = ${req.user.id}`;
  const user = users[0];
  const validPassword = bcrypt.compareSync(currentPassword, user.password_hash);
  if (!validPassword) return res.status(400).json({ error: 'Current password is incorrect' });
  
  const newHash = bcrypt.hashSync(newPassword, 10);
  await sql`UPDATE admin_users SET password_hash = ${newHash} WHERE id = ${req.user.id}`;
  res.json({ message: 'Password updated successfully' });
});

// ============ PUBLIC API ROUTES ============

app.get('/api/site-data', async (req, res) => {
  try {
    const settings = {};
    const settingsRows = await sql`SELECT key, value FROM site_settings`;
    settingsRows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    const personalOverviewRows = await sql`SELECT * FROM personal_overview LIMIT 1`;
    const personalOverview = personalOverviewRows[0];
    const experience = await sql`SELECT * FROM experience ORDER BY sort_order`;
    const testimonials = await sql`SELECT * FROM testimonials ORDER BY sort_order`;
    
    const skillsRows = await sql`SELECT * FROM skills ORDER BY sort_order`;
    const skills = await Promise.all(skillsRows.map(async skill => ({
      ...skill,
      items: await sql`SELECT * FROM skill_items WHERE skill_id = ${skill.id} ORDER BY sort_order`
    })));
    
    const hobbies = await sql`SELECT * FROM hobbies ORDER BY sort_order`;
    const contactInfoRows = await sql`SELECT * FROM contact_info LIMIT 1`;
    const contactInfo = contactInfoRows[0];
    
    res.json({
      settings,
      personalOverview,
      experience,
      testimonials,
      skills,
      hobbies,
      contactInfo
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, company, preferredDate, message } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  try {
    await sql`
      INSERT INTO contact_submissions (name, email, company, preferred_date, message)
      VALUES (${name}, ${email}, ${company || ''}, ${preferredDate || ''}, ${message || ''})
    `;
    
    res.json({ message: 'Contact form submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ ADMIN API ROUTES ============

app.get('/api/admin/settings', authenticateToken, async (req, res) => {
  const settings = {};
  const rows = await sql`SELECT key, value FROM site_settings`;
  rows.forEach(row => {
    settings[row.key] = row.value;
  });
  res.json(settings);
});

app.put('/api/admin/settings', authenticateToken, async (req, res) => {
  const settings = req.body;
  
  for (const [key, value] of Object.entries(settings)) {
    const val = typeof value === 'string' ? value : JSON.stringify(value);
    await sql`
      INSERT INTO site_settings (key, value, updated_at) VALUES (${key}, ${val}, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
    `;
  }
  
  res.json({ message: 'Settings updated' });
});

app.get('/api/admin/personal-overview', authenticateToken, async (req, res) => {
  const rows = await sql`SELECT * FROM personal_overview LIMIT 1`;
  res.json(rows[0] || {});
});

app.put('/api/admin/personal-overview', authenticateToken, async (req, res) => {
  const { about_me, video_url, traits, image1_url, image2_url } = req.body;
  const traitsValue = typeof traits === 'string' ? traits : JSON.stringify(traits);
  
  const existing = await sql`SELECT id FROM personal_overview LIMIT 1`;
  
  if (existing[0]) {
    await sql`
      UPDATE personal_overview SET about_me = ${about_me}, video_url = ${video_url || ''}, traits = ${traitsValue}, image1_url = ${image1_url || ''}, image2_url = ${image2_url || ''}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${existing[0].id}
    `;
  } else {
    await sql`
      INSERT INTO personal_overview (about_me, video_url, traits, image1_url, image2_url)
      VALUES (${about_me}, ${video_url || ''}, ${traitsValue}, ${image1_url || ''}, ${image2_url || ''})
    `;
  }
  
  res.json({ message: 'Personal overview updated' });
});

// Experience CRUD
app.get('/api/admin/experience', authenticateToken, async (req, res) => {
  const rows = await sql`SELECT * FROM experience ORDER BY sort_order`;
  res.json(rows);
});

app.post('/api/admin/experience', authenticateToken, async (req, res) => {
  const { title, period, company, details, sort_order } = req.body;
  const detailsValue = typeof details === 'string' ? details : JSON.stringify(details);
  const result = await sql`
    INSERT INTO experience (title, period, company, details, sort_order)
    VALUES (${title}, ${period}, ${company}, ${detailsValue}, ${sort_order || 0})
    RETURNING id
  `;
  res.json({ id: result[0].id, message: 'Experience added' });
});

app.put('/api/admin/experience/:id', authenticateToken, async (req, res) => {
  const { title, period, company, details, sort_order } = req.body;
  const detailsValue = typeof details === 'string' ? details : JSON.stringify(details);
  await sql`
    UPDATE experience SET title = ${title}, period = ${period}, company = ${company}, details = ${detailsValue}, sort_order = ${sort_order || 0}
    WHERE id = ${req.params.id}
  `;
  res.json({ message: 'Experience updated' });
});

app.delete('/api/admin/experience/:id', authenticateToken, async (req, res) => {
  await sql`DELETE FROM experience WHERE id = ${req.params.id}`;
  res.json({ message: 'Experience deleted' });
});

// Testimonials CRUD
app.get('/api/admin/testimonials', authenticateToken, async (req, res) => {
  const rows = await sql`SELECT * FROM testimonials ORDER BY sort_order`;
  res.json(rows);
});

app.post('/api/admin/testimonials', authenticateToken, async (req, res) => {
  const { video_url, quote, author, sort_order } = req.body;
  const result = await sql`
    INSERT INTO testimonials (video_url, quote, author, sort_order)
    VALUES (${video_url || ''}, ${quote}, ${author}, ${sort_order || 0})
    RETURNING id
  `;
  res.json({ id: result[0].id, message: 'Testimonial added' });
});

app.put('/api/admin/testimonials/:id', authenticateToken, async (req, res) => {
  const { video_url, quote, author, sort_order } = req.body;
  await sql`
    UPDATE testimonials SET video_url = ${video_url || ''}, quote = ${quote}, author = ${author}, sort_order = ${sort_order || 0}
    WHERE id = ${req.params.id}
  `;
  res.json({ message: 'Testimonial updated' });
});

app.delete('/api/admin/testimonials/:id', authenticateToken, async (req, res) => {
  await sql`DELETE FROM testimonials WHERE id = ${req.params.id}`;
  res.json({ message: 'Testimonial deleted' });
});

// Skills CRUD
app.get('/api/admin/skills', authenticateToken, async (req, res) => {
  const skillsRows = await sql`SELECT * FROM skills ORDER BY sort_order`;
  const skills = await Promise.all(skillsRows.map(async skill => ({
    ...skill,
    items: await sql`SELECT * FROM skill_items WHERE skill_id = ${skill.id} ORDER BY sort_order`
  })));
  res.json(skills);
});

app.post('/api/admin/skills', authenticateToken, async (req, res) => {
  const { category, sort_order, items } = req.body;
  const result = await sql`INSERT INTO skills (category, sort_order) VALUES (${category}, ${sort_order || 0}) RETURNING id`;
  const skillId = result[0].id;
  
  if (items && items.length > 0) {
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      await sql`INSERT INTO skill_items (skill_id, name, details, sort_order) VALUES (${skillId}, ${item.name}, ${item.details}, ${item.sort_order || idx})`;
    }
  }
  
  res.json({ id: skillId, message: 'Skill category added' });
});

app.put('/api/admin/skills/:id', authenticateToken, async (req, res) => {
  const { category, sort_order, items } = req.body;
  await sql`UPDATE skills SET category = ${category}, sort_order = ${sort_order || 0} WHERE id = ${req.params.id}`;
  
  await sql`DELETE FROM skill_items WHERE skill_id = ${req.params.id}`;
  if (items && items.length > 0) {
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      await sql`INSERT INTO skill_items (skill_id, name, details, sort_order) VALUES (${req.params.id}, ${item.name}, ${item.details}, ${item.sort_order || idx})`;
    }
  }
  
  res.json({ message: 'Skill category updated' });
});

app.delete('/api/admin/skills/:id', authenticateToken, async (req, res) => {
  await sql`DELETE FROM skill_items WHERE skill_id = ${req.params.id}`;
  await sql`DELETE FROM skills WHERE id = ${req.params.id}`;
  res.json({ message: 'Skill category deleted' });
});

// Hobbies CRUD
app.get('/api/admin/hobbies', authenticateToken, async (req, res) => {
  const rows = await sql`SELECT * FROM hobbies ORDER BY sort_order`;
  res.json(rows);
});

app.post('/api/admin/hobbies', authenticateToken, async (req, res) => {
  const { title, details, sort_order } = req.body;
  const result = await sql`INSERT INTO hobbies (title, details, sort_order) VALUES (${title}, ${details}, ${sort_order || 0}) RETURNING id`;
  res.json({ id: result[0].id, message: 'Hobby added' });
});

app.put('/api/admin/hobbies/:id', authenticateToken, async (req, res) => {
  const { title, details, sort_order } = req.body;
  await sql`UPDATE hobbies SET title = ${title}, details = ${details}, sort_order = ${sort_order || 0} WHERE id = ${req.params.id}`;
  res.json({ message: 'Hobby updated' });
});

app.delete('/api/admin/hobbies/:id', authenticateToken, async (req, res) => {
  await sql`DELETE FROM hobbies WHERE id = ${req.params.id}`;
  res.json({ message: 'Hobby deleted' });
});

// Contact Info
app.get('/api/admin/contact-info', authenticateToken, async (req, res) => {
  const rows = await sql`SELECT * FROM contact_info LIMIT 1`;
  res.json(rows[0] || {});
});

app.put('/api/admin/contact-info', authenticateToken, async (req, res) => {
  const { name, tagline, email, linkedin_url, github_url, calendar_url, spotify_embed_url, google_calendar_embed_url } = req.body;
  
  const existing = await sql`SELECT id FROM contact_info LIMIT 1`;
  
  if (existing[0]) {
    await sql`
      UPDATE contact_info SET name = ${name}, tagline = ${tagline}, email = ${email || ''}, linkedin_url = ${linkedin_url || ''}, github_url = ${github_url || ''}, 
      calendar_url = ${calendar_url || ''}, spotify_embed_url = ${spotify_embed_url || ''}, google_calendar_embed_url = ${google_calendar_embed_url || ''}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${existing[0].id}
    `;
  } else {
    await sql`
      INSERT INTO contact_info (name, tagline, email, linkedin_url, github_url, calendar_url, spotify_embed_url, google_calendar_embed_url)
      VALUES (${name}, ${tagline}, ${email || ''}, ${linkedin_url || ''}, ${github_url || ''}, ${calendar_url || ''}, ${spotify_embed_url || ''}, ${google_calendar_embed_url || ''})
    `;
  }
  
  res.json({ message: 'Contact info updated' });
});

// Contact Submissions (inbox)
app.get('/api/admin/submissions', authenticateToken, async (req, res) => {
  const rows = await sql`SELECT * FROM contact_submissions ORDER BY created_at DESC`;
  res.json(rows);
});

app.put('/api/admin/submissions/:id/read', authenticateToken, async (req, res) => {
  await sql`UPDATE contact_submissions SET read = 1 WHERE id = ${req.params.id}`;
  res.json({ message: 'Marked as read' });
});

app.delete('/api/admin/submissions/:id', authenticateToken, async (req, res) => {
  await sql`DELETE FROM contact_submissions WHERE id = ${req.params.id}`;
  res.json({ message: 'Submission deleted' });
});

export const handler = serverless(app);
