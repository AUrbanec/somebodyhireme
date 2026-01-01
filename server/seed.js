import { sql, initDb } from './database.js';
import bcrypt from 'bcryptjs';

async function seed() {
  // Initialize tables first
  await initDb();

  // Clear existing data
  await sql`DELETE FROM skill_items`;
  await sql`DELETE FROM skills`;
  await sql`DELETE FROM site_settings`;
  await sql`DELETE FROM personal_overview`;
  await sql`DELETE FROM experience`;
  await sql`DELETE FROM testimonials`;
  await sql`DELETE FROM hobbies`;
  await sql`DELETE FROM contact_info`;
  await sql`DELETE FROM admin_users`;

  // Seed Site Settings (Hero section)
  const siteSettings = [
    { key: 'hero_title', value: 'SomebodyHire.Me' },
    { key: 'hero_tagline1', value: "I need to be blunt. I am burned out on applying for jobs or hustling for freelance contacts. I'm ready to go back to being burned out with a stable paycheck." },
    { key: 'hero_tagline2', value: '(Just kidding ₛₒᵣₜₐ)' },
    { key: 'hero_description', value: "I need to be interviewed and hired before the end of January 2026. I'm making this to hopefully bypass parts of the interview process by showing you my personality, experience, hobbies, and reviews from former coworkers." },
    { key: 'hero_subdescription', value: "There's a calendar and form at the bottom if you're interested in scheduling an interview with the kind of developer who will:" },
    { key: 'hero_bullets', value: JSON.stringify([
      "Make biscuits and gravy (with gluten-free and vegan options) for your entire startup",
      "Make tedious tasks slightly more entertaining in unexpected ways",
      "Recommend weird/obscura music based on whatever you like (or, regardless of what you like I guess ¯\\_(ツ)_/¯ )",
      "Proactively (compulsively) find ways to help others"
    ])},
    { key: 'copyright_text', value: '© 2024 SomebodyHire.Me | Built with personality and desperation' }
  ];

  for (const s of siteSettings) {
    await sql`INSERT INTO site_settings (key, value) VALUES (${s.key}, ${s.value})`;
  }

  // Seed Personal Overview
  const traits = JSON.stringify([
    "✨ Creative problem solver",
    "🤝 Proactive helper",
    "🎵 Music enthusiast",
    "🍳 Passionate cook",
    "💡 Always learning"
  ]);
  await sql`
    INSERT INTO personal_overview (about_me, video_url, traits, image1_url, image2_url)
    VALUES (${"I'm Alex Urbanec, a Product-focused AI Engineer with a background in Data Engineering and scalable backend systems. I excel at bridging the gap between complex business problems and reliable, production-grade tools."}, ${''}, ${traits}, ${''}, ${''})
  `;

  // Seed Experience
  const experiences = [
    {
      title: "AI Solutions Architect | Lead Engineer | Independent Consultant (Freelance)",
      period: "August 2024 – Present",
      company: "Various Clients",
      details: JSON.stringify([
        "Elevate CRO (Agentic Workflow Engine): Architected a full-stack MVP using React and FastAPI. Engineered a multi-agent orchestration layer to reduce time-to-value by 60%.",
        "Tovals (Enterprise LLM Infrastructure): Constructed by former employer to build a secure, CI-based Multi-User Chat Application with ChatGPT-like functionality.",
        "StriAI (Consciousness in RAG Models): Developed a data normalization pipeline to feed disparate datasets into a RAG architecture."
      ]),
      sort_order: 0
    },
    {
      title: "Data Engineer | Tovals",
      period: "July 2023 – June 2024",
      company: "Tovals",
      details: JSON.stringify([
        "AI Implementation Strategy: Piloted Tovals's first production AI initiative, creating an automated pipeline for matching customer summaries to documentation.",
        "Data Architecture: Owned and maintained core data models with Snowflake. Optimized SQL queries for volumes >10M rows.",
        "DevOps & Cloud: Managed Infrastructure as Code (IaC) using AWS and Terraform."
      ]),
      sort_order: 1
    },
    {
      title: "Software Engineer, Internal Tools | Tovals",
      period: "May 2021 – July 2023",
      company: "Tovals",
      details: JSON.stringify([
        "Backend Development: Developed microservices and endpoints in Go (Golang) to expose core administrative utilities to select user and perform complex account actions without direct SQL access.",
        "Database Design: Wrote and executed complex SQL queries directly against production databases.",
        "Automation Engineering: Integrated external APIs (Zendesk) with internal Python services."
      ]),
      sort_order: 2
    }
  ];

  for (const e of experiences) {
    await sql`INSERT INTO experience (title, period, company, details, sort_order) VALUES (${e.title}, ${e.period}, ${e.company}, ${e.details}, ${e.sort_order})`;
  }

  // Seed Testimonials
  const testimonials = [
    { video_url: '', quote: "Alex is an exceptional engineer who brings creativity and dedication to every project.", author: "Former Colleague", sort_order: 0 },
    { video_url: '', quote: "Working with Alex was a pleasure. He consistently delivers high-quality work.", author: "Previous Manager", sort_order: 1 },
    { video_url: '', quote: "Alex's ability to solve complex problems is unmatched. A true asset to any team.", author: "Client", sort_order: 2 }
  ];

  for (const t of testimonials) {
    await sql`INSERT INTO testimonials (video_url, quote, author, sort_order) VALUES (${t.video_url}, ${t.quote}, ${t.author}, ${t.sort_order})`;
  }

  // Seed Skills
  const skillsData = [
    {
      category: "AI & LLM Stack",
      skills: [
        { name: "MultiAgent/Agentic/Google/Core", details: "React, JavaScript, Redux, Jenkins, GitHubActions, Linux/Bash" },
        { name: "Fabric, LangChain, RAG, Multi-Agent Systems, Agent Orchestration", details: "Experience with Claude, GPT-4, Gemini, and Labor data" }
      ]
    },
    {
      category: "Data Engineering",
      skills: [
        { name: "SQL (Data Build Tool), Snowflake, Airflow, ELT Pipelines, Data Modeling, SQL Optimization", details: "Expertise in building reliable, production-grade tools" },
        { name: "Backend & APIs: Python, Go, AWS", details: "Designed and maintained core data models" }
      ]
    },
    {
      category: "Frontend & Tools",
      skills: [
        { name: "React, JavaScript, Redux", details: "Built responsive web applications" },
        { name: "Jenkins, GitHub Actions, Linux/Bash", details: "CI/CD and automation" }
      ]
    }
  ];

  for (let catIdx = 0; catIdx < skillsData.length; catIdx++) {
    const cat = skillsData[catIdx];
    const result = await sql`INSERT INTO skills (category, sort_order) VALUES (${cat.category}, ${catIdx}) RETURNING id`;
    const skillId = result[0].id;
    for (let skillIdx = 0; skillIdx < cat.skills.length; skillIdx++) {
      const skill = cat.skills[skillIdx];
      await sql`INSERT INTO skill_items (skill_id, name, details, sort_order) VALUES (${skillId}, ${skill.name}, ${skill.details}, ${skillIdx})`;
    }
  }

  // Seed Hobbies
  const hobbies = [
    { title: "Music Production & Discovery", details: "I'm passionate about discovering obscure music and sharing recommendations. I also produce music in my spare time.", sort_order: 0 },
    { title: "Cooking", details: "Specializing in biscuits and gravy with gluten-free and vegan options. I love cooking for groups and experimenting with new recipes.", sort_order: 1 },
    { title: "Problem Solving", details: "I compulsively find ways to help others and make tedious tasks more entertaining.", sort_order: 2 }
  ];

  for (const h of hobbies) {
    await sql`INSERT INTO hobbies (title, details, sort_order) VALUES (${h.title}, ${h.details}, ${h.sort_order})`;
  }

  // Seed Contact Info
  await sql`
    INSERT INTO contact_info (name, tagline, email, linkedin_url, github_url, calendar_url, spotify_embed_url, google_calendar_embed_url)
    VALUES (${"Alex Urbanec"}, ${"AI Engineer | Data Architect | Problem Solver"}, ${"ajurbanec@gmail.com"}, ${"https://linkedin.com/in/dexaio"}, ${"https://github.com"}, ${"#"}, ${""}, ${""})
  `;

  // Create default admin user (password: admin123 - CHANGE THIS IN PRODUCTION!)
  const passwordHash = bcrypt.hashSync('admin123', 10);
  await sql`INSERT INTO admin_users (username, password_hash) VALUES (${'admin'}, ${passwordHash})`;

  console.log('✅ Database seeded successfully!');
  console.log('📝 Default admin credentials: username=admin, password=admin123');
  console.log('⚠️  CHANGE THE PASSWORD IN PRODUCTION!');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
