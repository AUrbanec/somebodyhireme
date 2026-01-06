import serverless from 'serverless-http';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';

const app = express();

// Use Netlify's auto-provisioned variable
const connectionString = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
const sql = neon(connectionString);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Google OAuth2 Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8888/.netlify/functions/api/api/google/callback';

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

// Helper to get OAuth client with stored tokens
const getAuthenticatedClient = async () => {
  const rows = await sql`SELECT value FROM site_settings WHERE key = 'google_refresh_token'`;
  if (!rows[0]?.value) return null;
  
  oauth2Client.setCredentials({
    refresh_token: rows[0].value
  });
  return oauth2Client;
};

// Helper to create calendar event
const createCalendarEvent = async (eventDetails) => {
  const auth = await getAuthenticatedClient();
  if (!auth) throw new Error('Google Calendar not connected');
  
  const calendar = google.calendar({ version: 'v3', auth });
  
  const event = {
    summary: eventDetails.summary,
    description: eventDetails.description,
    start: {
      dateTime: eventDetails.startDateTime,
      timeZone: eventDetails.timeZone || 'America/Chicago',
    },
    end: {
      dateTime: eventDetails.endDateTime,
      timeZone: eventDetails.timeZone || 'America/Chicago',
    },
    attendees: eventDetails.attendees || [],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 30 },
      ],
    },
  };
  
  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
    sendUpdates: 'all',
  });
  
  return response.data;
};

// Helper to send email via Gmail
const sendGmailEmail = async (emailDetails) => {
  const auth = await getAuthenticatedClient();
  if (!auth) throw new Error('Gmail not connected');
  
  const gmail = google.gmail({ version: 'v1', auth });
  
  // Get the authenticated user's email for the From header
  const oauth2 = google.oauth2({ version: 'v2', auth });
  const userInfo = await oauth2.userinfo.get();
  const fromEmail = userInfo.data.email;
  
  const message = [
    `From: ${fromEmail}`,
    `To: ${emailDetails.to}`,
    `Subject: ${emailDetails.subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    emailDetails.body
  ].join('\r\n');
  
  const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });
};

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
  const { name, email, company, preferredDate, preferredTime, interviewDuration, timezone, message } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  try {
    // Get admin's email from contact_info
    const contactInfoRows = await sql`SELECT email, name as admin_name FROM contact_info LIMIT 1`;
    const contactInfo = contactInfoRows[0];
    const adminEmail = contactInfo?.email;
    const adminName = contactInfo?.admin_name || 'Site Owner';
    
    // Store the submission
    await sql`
      INSERT INTO contact_submissions (name, email, company, preferred_date, preferred_time, interview_duration, message)
      VALUES (${name}, ${email}, ${company || ''}, ${preferredDate || ''}, ${preferredTime || ''}, ${interviewDuration || '30'}, ${message || ''})
    `;
    
    let calendarEventCreated = false;
    let emailSent = false;
    let calendarEventLink = null;
    
    // Try to create Google Calendar event if date/time provided
    if (preferredDate && preferredTime) {
      const duration = parseInt(interviewDuration) || 30;
      // Parse time - handle both HH:MM and HH:MM:SS formats
      const timeParts = preferredTime.split(':');
      const hours = parseInt(timeParts[0]);
      const minutes = parseInt(timeParts[1]) || 0;
      
      // Calculate end time
      const endHours = hours + Math.floor((minutes + duration) / 60);
      const endMinutes = (minutes + duration) % 60;
      
      // Format as local datetime strings (YYYY-MM-DDTHH:MM:SS) - Google will interpret with timeZone
      const startDateTime = `${preferredDate}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
      const endDateTime = `${preferredDate}T${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:00`;
      
      try {
        // Use visitor's timezone - Google Calendar will convert for display
        const visitorTimezone = timezone || 'America/Chicago';
        console.log('Creating calendar event:', { startDateTime, endDateTime, name, email, timezone: visitorTimezone });
        const calendarEvent = await createCalendarEvent({
          summary: `Interview with ${name}${company ? ` from ${company}` : ''}`,
          description: `Interview request from ${name} (${email})\n${company ? `Company: ${company}\n` : ''}${message ? `Message: ${message}` : ''}\n\nRequested in timezone: ${visitorTimezone}`,
          startDateTime: startDateTime,
          endDateTime: endDateTime,
          timeZone: visitorTimezone,
          attendees: [{ email: email }],
        });
        calendarEventCreated = true;
        calendarEventLink = calendarEvent.htmlLink;
        console.log('Calendar event created successfully:', calendarEventLink);
      } catch (calErr) {
        console.error('Calendar event creation failed:', calErr.message, calErr.stack);
      }
    }
    
    // Try to send email notification to admin
    if (adminEmail) {
      try {
        await sendGmailEmail({
          to: adminEmail,
          subject: `New Interview Request from ${name}${company ? ` - ${company}` : ''}`,
          body: `
            <h2>New Interview Request</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
            ${preferredDate ? `<p><strong>Preferred Date:</strong> ${preferredDate}</p>` : ''}
            ${preferredTime ? `<p><strong>Preferred Time:</strong> ${preferredTime}</p>` : ''}
            ${interviewDuration ? `<p><strong>Duration:</strong> ${interviewDuration} minutes</p>` : ''}
            ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
            ${calendarEventLink ? `<p><strong>Calendar Event:</strong> <a href="${calendarEventLink}">View Event</a></p>` : ''}
          `
        });
        emailSent = true;
      } catch (emailErr) {
        console.log('Email sending failed (Gmail not connected):', emailErr.message);
      }
    }
    
    res.json({ 
      message: 'Interview request submitted successfully',
      calendarEventCreated,
      calendarEventLink,
      emailSent,
      adminEmail: adminEmail,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ GOOGLE OAUTH ROUTES ============

// Get Google OAuth authorization URL
app.get('/api/admin/google/auth-url', authenticateToken, async (req, res) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.status(400).json({ error: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.' });
  }
  
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.email',
  ];
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
  
  res.json({ authUrl });
});

// Handle Google OAuth callback
app.get('/api/google/callback', async (req, res) => {
  const { code, error } = req.query;
  
  if (error) {
    return res.redirect(`/admin?google_error=${encodeURIComponent(error)}`);
  }
  
  if (!code) {
    return res.redirect('/admin?google_error=no_code');
  }
  
  try {
    console.log('Processing Google OAuth callback...');
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Got tokens:', { hasRefreshToken: !!tokens.refresh_token, hasAccessToken: !!tokens.access_token });
    
    // Store refresh token in database (use DELETE + INSERT for compatibility)
    if (tokens.refresh_token) {
      await sql`DELETE FROM site_settings WHERE key = 'google_refresh_token'`;
      await sql`INSERT INTO site_settings (key, value) VALUES ('google_refresh_token', ${tokens.refresh_token})`;
      console.log('Stored refresh token in database');
    } else {
      console.log('No refresh token received - user may need to revoke access and try again');
    }
    
    // Store connected status
    await sql`DELETE FROM site_settings WHERE key = 'google_connected'`;
    await sql`INSERT INTO site_settings (key, value) VALUES ('google_connected', 'true')`;
    
    res.redirect('/admin?google_connected=true');
  } catch (err) {
    console.error('Google OAuth error:', err.message, err.stack);
    res.redirect(`/admin?google_error=${encodeURIComponent(err.message)}`);
  }
});

// Check Google connection status
app.get('/api/admin/google/status', authenticateToken, async (req, res) => {
  try {
    const rows = await sql`SELECT value FROM site_settings WHERE key = 'google_refresh_token'`;
    const connected = !!rows[0]?.value;
    
    let email = null;
    if (connected) {
      try {
        const auth = await getAuthenticatedClient();
        if (auth) {
          const oauth2 = google.oauth2({ version: 'v2', auth });
          const userInfo = await oauth2.userinfo.get();
          email = userInfo.data.email;
        }
      } catch (e) {
        // Token might be invalid
      }
    }
    
    res.json({ connected, email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Disconnect Google account
app.post('/api/admin/google/disconnect', authenticateToken, async (req, res) => {
  try {
    await sql`DELETE FROM site_settings WHERE key = 'google_refresh_token'`;
    await sql`DELETE FROM site_settings WHERE key = 'google_connected'`;
    res.json({ message: 'Google account disconnected' });
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
