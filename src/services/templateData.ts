import { Template } from '../types';

export const TEMPLATES: Template[] = [
  {
    id: 'portfolio-pro',
    name: 'Creative Developer Portfolio',
    description: 'Sleek dark portfolio with glassmorphism, project cards, experience timeline, and interactive contact form.',
    category: 'Portfolio',
    previewGradient: 'from-blue-600 via-indigo-600 to-purple-700',
    tags: ['Dark Theme', 'Responsive', 'Interactive', 'Glassmorphism'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alex Rivera — Senior Full-Stack Engineer</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap" rel="stylesheet">
</head>
<body>
  <nav class="navbar">
    <div class="logo">Alex Rivera<span class="dot">.</span></div>
    <div class="nav-links">
      <a href="#about">About</a>
      <a href="#projects">Projects</a>
      <a href="#experience">Experience</a>
      <a href="#contact" class="btn-sm">Get in Touch</a>
    </div>
  </nav>

  <section class="hero">
    <div class="badge">✨ Available for select projects</div>
    <h1>Building Digital Products with Precision & Passion</h1>
    <p>Full-Stack Engineer & System Architect specializing in React, TypeScript, and Scalable Cloud Infrastructures.</p>
    <div class="hero-actions">
      <a href="#projects" class="btn-primary">Explore Work</a>
      <a href="#contact" class="btn-secondary">Download Resume</a>
    </div>
  </section>

  <section id="projects" class="section">
    <h2>Featured Work</h2>
    <div class="grid">
      <div class="card">
        <div class="card-tag">AI Application</div>
        <h3>SynthWave AI Engine</h3>
        <p>Real-time audio processing & speech synthesis cloud platform built with WebSockets and WebAudio API.</p>
        <div class="tags"><span>React</span><span>TypeScript</span><span>Node.js</span></div>
      </div>
      <div class="card">
        <div class="card-tag">Fintech</div>
        <h3>Orbit Capital Dashboard</h3>
        <p>Institutional trading dashboard rendering 100k+ real-time tick updates per second using WebGL canvas.</p>
        <div class="tags"><span>Next.js</span><span>Tailwind</span><span>D3.js</span></div>
      </div>
      <div class="card">
        <div class="card-tag">Developer Tools</div>
        <h3>HyperQuery CLI</h3>
        <p>Blazing fast SQL query optimizer and visual execution plan engine written in Rust and Node.js.</p>
        <div class="tags"><span>Rust</span><span>TypeScript</span><span>PostgreSQL</span></div>
      </div>
    </div>
  </section>

  <section id="contact" class="section">
    <div class="contact-card">
      <h2>Let's create something extraordinary together</h2>
      <p>Interested in collaborating or hiring me for your team? Send a message.</p>
      <form id="contactForm">
        <input type="text" placeholder="Your Name" required>
        <input type="email" placeholder="Your Email" required>
        <textarea placeholder="Tell me about your project..." rows="4" required></textarea>
        <button type="submit" class="btn-primary">Send Message</button>
      </form>
    </div>
  </section>

  <footer>
    <p>© 2026 Alex Rivera. Built with VERVOX AI.</p>
  </footer>
  <script src="script.js"></script>
</body>
</html>`,
      'style.css': `* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
body { background: #090d16; color: #f1f5f9; line-height: 1.6; }
a { color: inherit; text-decoration: none; }
.navbar { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 5%; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.08); position: sticky; top: 0; z-index: 50; }
.logo { font-size: 1.4rem; font-weight: 800; letter-spacing: -0.5px; }
.logo .dot { color: #3b82f6; }
.nav-links { display: flex; gap: 2rem; align-items: center; }
.nav-links a { color: #94a3b8; font-weight: 500; font-size: 0.95rem; transition: color 0.2s; }
.nav-links a:hover { color: #ffffff; }
.btn-sm { background: #1e293b; padding: 0.5rem 1.2rem; border-radius: 999px; border: 1px solid rgba(255,255,255,0.1); }
.hero { text-align: center; max-width: 800px; margin: 5rem auto; padding: 0 1.5rem; }
.badge { display: inline-block; background: rgba(59, 130, 246, 0.12); color: #60a5fa; padding: 0.4rem 1rem; border-radius: 999px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(59, 130, 246, 0.2); margin-bottom: 1.5rem; }
.hero h1 { font-size: 3.2rem; font-weight: 800; letter-spacing: -1.5px; line-height: 1.15; margin-bottom: 1.2rem; background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero p { font-size: 1.15rem; color: #94a3b8; margin-bottom: 2rem; }
.hero-actions { display: flex; gap: 1rem; justify-content: center; }
.btn-primary { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 0.8rem 1.8rem; border-radius: 10px; font-weight: 600; border: none; cursor: pointer; transition: transform 0.2s; }
.btn-primary:hover { transform: translateY(-2px); }
.btn-secondary { background: #1e293b; color: #e2e8f0; padding: 0.8rem 1.8rem; border-radius: 10px; font-weight: 600; border: 1px solid rgba(255,255,255,0.1); }
.section { max-width: 1100px; margin: 5rem auto; padding: 0 1.5rem; }
.section h2 { font-size: 2rem; margin-bottom: 2rem; font-weight: 700; letter-spacing: -0.5px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
.card { background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255,255,255,0.08); padding: 1.8rem; border-radius: 16px; backdrop-filter: blur(8px); transition: border-color 0.2s; }
.card:hover { border-color: rgba(59, 130, 246, 0.4); }
.card-tag { font-size: 0.75rem; text-transform: uppercase; color: #3b82f6; letter-spacing: 1px; font-weight: 700; margin-bottom: 0.5rem; }
.card h3 { font-size: 1.3rem; margin-bottom: 0.6rem; color: #f8fafc; }
.card p { font-size: 0.95rem; color: #94a3b8; margin-bottom: 1.2rem; }
.tags { display: flex; gap: 0.5rem; }
.tags span { background: rgba(255,255,255,0.05); color: #cbd5e1; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.8rem; }
.contact-card { background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9)); padding: 3rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); text-align: center; }
.contact-card form { display: flex; flex-direction: column; gap: 1rem; max-width: 500px; margin: 2rem auto 0; }
.contact-card input, .contact-card textarea { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.1); padding: 0.9rem; border-radius: 8px; color: white; outline: none; }
.contact-card input:focus, .contact-card textarea:focus { border-color: #3b82f6; }
footer { text-align: center; padding: 3rem 1rem; color: #64748b; font-size: 0.9rem; border-top: 1px solid rgba(255,255,255,0.05); }`,
      'script.js': `document.getElementById('contactForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Thank you for reaching out! Alex will get back to you shortly.');
  e.target.reset();
});`,
      'README.md': `# Alex Rivera Portfolio

This project was created using VERVOX AI Website Builder.

## Features
- Fully responsive modern dark design
- Interactive smooth scroll navigation
- Contact form handler
- Glassmorphism UI components
`,
    },
  },
  {
    id: 'cyber-gaming',
    name: 'CyberVerse Esports Portal',
    description: 'High-octane esports gaming portal with tournament banners, live leaderboard, game cards, and VIP subscription.',
    category: 'Gaming',
    previewGradient: 'from-fuchsia-600 via-purple-600 to-indigo-800',
    tags: ['Cyberpunk', 'Esports', 'Leaderboard', 'VIP Membership'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CYBERVERSE — Next-Gen Esports Realm</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <header>
    <div class="brand">⚡ CYBER<span>VERSE</span></div>
    <nav>
      <a href="#games">Games</a>
      <a href="#tournaments">Tournaments</a>
      <a href="#rankings">Rankings</a>
      <a href="#vip" class="glow-btn">JOIN VIP</a>
    </nav>
  </header>

  <main>
    <section class="hero-banner">
      <div class="live-tag"><span class="pulse"></span> LIVE TOURNAMENT — $100,000 GRAND FINALS</div>
      <h1>DOMINATE THE CYBER ARENA</h1>
      <p>Compete in daily global leagues, unleash ultimate tactics, and claim legendary NFT rewards.</p>
      <div class="cta-row">
        <button class="btn-neon" onclick="playNow()">ENTER ARENA NOW</button>
        <button class="btn-outline">VIEW BRACKETS</button>
      </div>
    </section>

    <section id="games" class="games-section">
      <h2>FEATURED TITLES</h2>
      <div class="games-grid">
        <div class="game-card">
          <div class="badge">FPS ARENA</div>
          <h3>Apex Overdrive</h3>
          <p>128-player battle royale with high-speed cyber mobility.</p>
          <div class="meta"><span>12.4k Online</span><span>Ranked S2</span></div>
        </div>
        <div class="game-card">
          <div class="badge">MOBA</div>
          <h3>Neon Syndicate</h3>
          <p>5v5 tactical hero brawler featuring futuristic synth abilities.</p>
          <div class="meta"><span>8.9k Online</span><span>Global Cup</span></div>
        </div>
        <div class="game-card">
          <div class="badge">SIM RACING</div>
          <h3>HyperVelocity 2099</h3>
          <p>Anti-gravity track racing at Mach 3 speed with customized craft.</p>
          <div class="meta"><span>5.1k Online</span><span>Time Trial</span></div>
        </div>
      </div>
    </section>
  </main>
  <script src="script.js"></script>
</body>
</html>`,
      'style.css': `* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #050508; color: #e0e6ed; font-family: 'Rajdhani', sans-serif; overflow-x: hidden; }
header { display: flex; justify-content: space-between; align-items: center; padding: 1.2rem 4%; background: rgba(10, 10, 18, 0.9); border-bottom: 1px solid #d946ef33; position: sticky; top: 0; z-index: 100; }
.brand { font-family: 'Orbitron', sans-serif; font-size: 1.6rem; font-weight: 900; letter-spacing: 2px; color: #fff; }
.brand span { color: #d946ef; }
nav a { color: #a1a1aa; font-family: 'Orbitron', sans-serif; font-size: 0.85rem; margin-left: 2rem; text-decoration: none; text-transform: uppercase; transition: 0.3s; }
nav a:hover { color: #d946ef; text-shadow: 0 0 10px #d946ef; }
.glow-btn { background: #d946ef; color: #fff !important; padding: 0.6rem 1.4rem; border-radius: 4px; box-shadow: 0 0 15px rgba(217, 70, 239, 0.6); }
.hero-banner { min-height: 80vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 2rem; background: radial-gradient(circle at center, rgba(217,70,239,0.15) 0%, transparent 70%); }
.live-tag { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #ef444455; padding: 0.4rem 1rem; border-radius: 99px; font-family: 'Orbitron', sans-serif; font-size: 0.8rem; font-weight: 700; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 8px; }
.pulse { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; box-shadow: 0 0 8px #ef4444; }
.hero-banner h1 { font-family: 'Orbitron', sans-serif; font-size: 3.8rem; font-weight: 900; letter-spacing: 3px; color: #fff; text-shadow: 0 0 20px rgba(217, 70, 239, 0.4); margin-bottom: 1rem; }
.hero-banner p { font-size: 1.3rem; max-width: 650px; color: #94a3b8; margin-bottom: 2.5rem; }
.cta-row { display: flex; gap: 1.5rem; }
.btn-neon { background: linear-gradient(90deg, #d946ef, #8b5cf6); border: none; color: white; padding: 1rem 2.5rem; font-family: 'Orbitron', sans-serif; font-weight: 700; font-size: 1rem; border-radius: 4px; cursor: pointer; box-shadow: 0 0 25px rgba(217, 70, 239, 0.5); }
.btn-outline { background: transparent; border: 1px solid #8b5cf6; color: #c084fc; padding: 1rem 2.5rem; font-family: 'Orbitron', sans-serif; font-weight: 700; font-size: 1rem; border-radius: 4px; cursor: pointer; }
.games-section { max-width: 1200px; margin: 4rem auto; padding: 0 2rem; }
.games-section h2 { font-family: 'Orbitron', sans-serif; font-size: 2rem; color: #fff; margin-bottom: 2rem; text-align: center; }
.games-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem; }
.game-card { background: #0f0f1d; border: 1px solid #27273a; padding: 2rem; border-radius: 8px; transition: 0.3s; }
.game-card:hover { border-color: #d946ef; transform: translateY(-5px); box-shadow: 0 10px 30px rgba(217, 70, 239, 0.2); }
.game-card .badge { display: inline-block; background: rgba(139, 92, 246, 0.2); color: #c084fc; padding: 0.2rem 0.6rem; font-size: 0.75rem; font-family: 'Orbitron'; margin-bottom: 1rem; border-radius: 3px; }
.game-card h3 { font-family: 'Orbitron'; font-size: 1.4rem; color: #fff; margin-bottom: 0.5rem; }
.game-card p { color: #818cf8; font-size: 1rem; margin-bottom: 1.5rem; }
.meta { display: flex; justify-content: space-between; font-size: 0.85rem; color: #a1a1aa; border-top: 1px solid #1e1e2f; padding-top: 1rem; }`,
      'script.js': `function playNow() { alert('Connecting to CyberVerse Arena servers...'); }`,
      'README.md': `# CyberVerse Esports Portal\n\nBuilt with VERVOX AI.`,
    },
  },
  {
    id: 'gourmet-bistro',
    name: 'Aura Artisan Dining & Bistro',
    description: 'Luxury restaurant website with elegant hero banner, interactive menu tabs, chef specials, and online table reservation.',
    category: 'Restaurant',
    previewGradient: 'from-amber-600 via-orange-600 to-amber-800',
    tags: ['Luxury', 'Restaurant', 'Menu Tabs', 'Table Reservation'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AURA — Culinary Excellence & Bistro</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
</head>
<body>
  <header>
    <div class="logo">A U R A</div>
    <nav>
      <a href="#about">Story</a>
      <a href="#menu">Menu</a>
      <a href="#reserve" class="btn-gold">Reserve Table</a>
    </nav>
  </header>

  <section class="hero">
    <span class="subtext">MICHELIN GUIDED CUISINE</span>
    <h1>Artisanal Flavors Crafted for the Soul</h1>
    <p>Experience an extraordinary culinary journey blending organic seasonal farm ingredients with contemporary gastronomy.</p>
    <a href="#reserve" class="btn-gold-lg">Book an Experience</a>
  </section>

  <section id="menu" class="menu-container">
    <h2>OUR SIGNATURE MENU</h2>
    <div class="menu-tabs">
      <button class="tab-btn active" onclick="filterMenu('starters')">Starters</button>
      <button class="tab-btn" onclick="filterMenu('mains')">Main Courses</button>
      <button class="tab-btn" onclick="filterMenu('desserts')">Desserts & Wine</button>
    </div>
    <div class="menu-list" id="menuList">
      <div class="menu-item">
        <div class="dish-header"><h3>Truffle Infused Burrata</h3><span class="price">$28</span></div>
        <p>Aged balsamic drizzle, heirloom tomatoes, roasted pistachio crumble.</p>
      </div>
      <div class="menu-item">
        <div class="dish-header"><h3>Pan-Seared Wagyu Ribeye</h3><span class="price">$85</span></div>
        <p>Grade A5 Wagyu, smoked bone marrow butter, wild chanterelle reduction.</p>
      </div>
      <div class="menu-item">
        <div class="dish-header"><h3>Wild Norwegian Salmon</h3><span class="price">$42</span></div>
        <p>Crispy skin fillet, saffron cauliflower puree, charred asparagus tips.</p>
      </div>
    </div>
  </section>

  <section id="reserve" class="reserve-section">
    <div class="reserve-box">
      <h2>RESERVE A TABLE</h2>
      <p>Please select your preferred date, time, and party size.</p>
      <form id="resForm">
        <input type="text" placeholder="Full Name" required>
        <input type="date" required>
        <select required>
          <option value="">Guests (1-8)</option>
          <option>2 Guests</option>
          <option>4 Guests</option>
          <option>6+ Guests (Private Dining)</option>
        </select>
        <button type="submit" class="btn-gold-lg">Confirm Booking</button>
      </form>
    </div>
  </section>
  <script src="script.js"></script>
</body>
</html>`,
      'style.css': `* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #0c0a09; color: #f5f5f4; font-family: 'Outfit', sans-serif; }
header { display: flex; justify-content: space-between; align-items: center; padding: 1.8rem 6%; border-bottom: 1px solid #27272a; }
.logo { font-family: 'Cinzel', serif; font-size: 1.8rem; letter-spacing: 6px; color: #d4af37; font-weight: 700; }
nav a { color: #a1a1aa; font-family: 'Cinzel', serif; font-size: 0.9rem; margin-left: 2rem; text-decoration: none; letter-spacing: 2px; }
.btn-gold { border: 1px solid #d4af37; color: #d4af37 !important; padding: 0.6rem 1.4rem; border-radius: 2px; }
.hero { text-align: center; padding: 8rem 2rem; background: radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%); }
.subtext { font-family: 'Cinzel'; color: #d4af37; letter-spacing: 4px; font-size: 0.85rem; font-weight: 700; }
.hero h1 { font-family: 'Cinzel', serif; font-size: 3.5rem; color: #fff; margin: 1.5rem 0; letter-spacing: -1px; }
.hero p { max-width: 600px; margin: 0 auto 2.5rem; color: #a1a1aa; font-size: 1.15rem; }
.btn-gold-lg { display: inline-block; background: #d4af37; color: #0c0a09; padding: 1rem 2.5rem; font-family: 'Cinzel'; font-weight: 700; letter-spacing: 2px; text-decoration: none; border-radius: 2px; border: none; cursor: pointer; }
.menu-container { max-width: 800px; margin: 5rem auto; padding: 0 1.5rem; }
.menu-container h2 { font-family: 'Cinzel'; text-align: center; font-size: 2rem; letter-spacing: 4px; color: #d4af37; margin-bottom: 2rem; }
.menu-tabs { display: flex; justify-content: center; gap: 1rem; margin-bottom: 3rem; }
.tab-btn { background: transparent; border: 1px solid #27272a; color: #a1a1aa; padding: 0.6rem 1.2rem; font-family: 'Cinzel'; cursor: pointer; }
.tab-btn.active { border-color: #d4af37; color: #d4af37; }
.menu-item { border-bottom: 1px dashed #27272a; padding: 1.5rem 0; }
.dish-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; }
.dish-header h3 { font-family: 'Cinzel'; color: #f5f5f4; font-size: 1.2rem; }
.price { color: #d4af37; font-weight: 600; font-size: 1.1rem; }
.menu-item p { color: #71717a; font-size: 0.95rem; }
.reserve-section { max-width: 600px; margin: 6rem auto; padding: 0 1.5rem; text-align: center; }
.reserve-box { background: #18181b; padding: 3rem; border: 1px solid #27272a; border-radius: 4px; }
.reserve-box form { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem; }
.reserve-box input, .reserve-box select { background: #0c0a09; border: 1px solid #27272a; padding: 0.9rem; color: #fff; outline: none; }`,
      'script.js': `document.getElementById('resForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Reservation request submitted! Our concierge will contact you shortly.');
  e.target.reset();
});`,
      'README.md': `# Aura Bistro Website\n\nBuilt with VERVOX AI.`,
    },
  },
  {
    id: 'saas-nexus',
    name: 'Nexus Analytics AI Platform',
    description: 'High-converting B2B SaaS landing page with live metric counters, feature grids, pricing tiers, and interactive FAQ.',
    category: 'Business',
    previewGradient: 'from-cyan-600 via-blue-600 to-indigo-700',
    tags: ['SaaS', 'B2B', 'Analytics', 'Conversion'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nexus AI — Predictive Intelligence Platform</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
  <nav class="top-nav">
    <div class="logo">Nexus<span>AI</span></div>
    <div class="links">
      <a href="#features">Product</a>
      <a href="#metrics">Impact</a>
      <a href="#pricing">Pricing</a>
      <a href="#demo" class="btn-brand">Get Started</a>
    </div>
  </nav>

  <section class="hero-section">
    <div class="pill">🚀 Powered by Autonomous Neural Pipelines</div>
    <h1>Predict Revenue Drops Before They Impact Your Bottom Line</h1>
    <p>Nexus AI monitors your enterprise telemetry data streams in real-time, detecting multi-variable anomalies with 99.4% accuracy.</p>
    <div class="input-box">
      <input type="email" id="emailInput" placeholder="Enter your work email">
      <button class="btn-brand" onclick="requestAccess()">Start Free 14-Day Trial</button>
    </div>
  </section>

  <section id="metrics" class="stats-row">
    <div class="stat"><h2>$4.2B+</h2><p>Data Assets Processed</p></div>
    <div class="stat"><h2>99.99%</h2><p>Uptime SLA Guarantee</p></div>
    <div class="stat"><h2>14ms</h2><p>Average Query Latency</p></div>
  </section>
  <script src="script.js"></script>
</body>
</html>`,
      'style.css': `* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
body { background: #080d1a; color: #e2e8f0; }
.top-nav { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 6%; border-bottom: 1px solid rgba(255,255,255,0.06); }
.logo { font-size: 1.5rem; font-weight: 800; color: #fff; }
.logo span { color: #06b6d4; }
.links a { color: #94a3b8; margin-left: 2rem; text-decoration: none; font-weight: 500; }
.btn-brand { background: linear-gradient(135deg, #06b6d4, #2563eb); color: white; border: none; padding: 0.7rem 1.4rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
.hero-section { text-align: center; max-width: 850px; margin: 6rem auto 4rem; padding: 0 1.5rem; }
.pill { display: inline-block; background: rgba(6, 182, 212, 0.1); color: #22d3ee; padding: 0.4rem 1rem; border-radius: 99px; font-size: 0.85rem; font-weight: 600; margin-bottom: 1.5rem; border: 1px solid rgba(6, 182, 212, 0.2); }
.hero-section h1 { font-size: 3.2rem; font-weight: 800; line-height: 1.2; letter-spacing: -1px; margin-bottom: 1.2rem; color: #fff; }
.hero-section p { font-size: 1.2rem; color: #94a3b8; margin-bottom: 2.5rem; }
.input-box { display: flex; gap: 0.5rem; max-width: 500px; margin: 0 auto; background: rgba(30, 41, 59, 0.6); padding: 0.4rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
.input-box input { flex: 1; background: transparent; border: none; padding: 0.8rem; color: #fff; outline: none; }
.stats-row { display: flex; justify-content: space-around; max-width: 1000px; margin: 4rem auto; background: #0f172a; padding: 2.5rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); text-align: center; }
.stat h2 { font-size: 2.5rem; font-weight: 800; color: #06b6d4; }
.stat p { color: #94a3b8; font-size: 0.95rem; }`,
      'script.js': `function requestAccess() {
  const val = document.getElementById('emailInput').value;
  if(!val) return alert('Please enter your work email.');
  alert('Thank you! Trial instructions sent to ' + val);
}`,
      'README.md': `# Nexus AI Platform\n\nBuilt with VERVOX AI.`,
    },
  },
  {
    id: 'edu-academy',
    name: 'Quantum Academy — AI & Code Institute',
    description: 'Modern edtech portal featuring online courses, interactive curriculum cards, instructor profiles, and enrollment checkout.',
    category: 'Education',
    previewGradient: 'from-emerald-600 via-teal-600 to-cyan-800',
    tags: ['Education', 'Courses', 'Academy', 'Modern'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quantum Academy — Master AI & Software Engineering</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body>
  <header>
    <div class="logo">QUANTUM<span>.EDU</span></div>
    <nav>
      <a href="#courses">Courses</a>
      <a href="#about">Mentors</a>
      <a href="#enroll" class="btn-emerald">Browse Catalog</a>
    </nav>
  </header>

  <section class="hero">
    <h1>Master World-Class Engineering & Applied AI</h1>
    <p>Project-driven bootcamps designed by principal engineers from leading technology companies.</p>
  </section>

  <section id="courses" class="courses">
    <h2>POPULAR PATHWAYS</h2>
    <div class="grid">
      <div class="card">
        <h3>Full-Stack AI Systems Architecture</h3>
        <p>Build real-world LLM wrappers, vector database search systems, and agentic workflows from scratch.</p>
        <span class="dur">12 Weeks • Live Online</span>
      </div>
      <div class="card">
        <h3>Distributed Cloud Backend in Go & Rust</h3>
        <p>Master high-concurrency microservices, gRPC protocol, Kubernetes, and event-driven architectures.</p>
        <span class="dur">10 Weeks • Self-Paced</span>
      </div>
    </div>
  </section>
</body>
</html>`,
      'style.css': `* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }
body { background: #061814; color: #e2e8f0; }
header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 5%; border-bottom: 1px solid #10332c; }
.logo { font-family: 'Space Grotesk'; font-size: 1.5rem; font-weight: 700; color: #fff; }
.logo span { color: #10b981; }
nav a { color: #94a3b8; margin-left: 2rem; text-decoration: none; }
.btn-emerald { background: #10b981; color: #061814; font-weight: 700; padding: 0.6rem 1.4rem; border-radius: 6px; }
.hero { text-align: center; padding: 6rem 2rem; }
.hero h1 { font-family: 'Space Grotesk'; font-size: 3rem; color: #fff; margin-bottom: 1rem; }
.hero p { max-width: 600px; margin: 0 auto; color: #a7f3d0; font-size: 1.1rem; }
.courses { max-width: 1000px; margin: 4rem auto; padding: 0 1.5rem; }
.courses h2 { font-family: 'Space Grotesk'; margin-bottom: 2rem; color: #10b981; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
.card { background: #0b2922; border: 1px solid #10483d; padding: 2rem; border-radius: 12px; }
.card h3 { color: #fff; margin-bottom: 0.8rem; }
.card p { color: #94a3b8; font-size: 0.95rem; margin-bottom: 1.5rem; }
.dur { color: #34d399; font-size: 0.85rem; font-weight: 600; }`,
      'script.js': `console.log('Quantum Academy initialized');`,
      'README.md': `# Quantum Academy Website\n\nBuilt with VERVOX AI.`,
    },
  },
  {
    id: 'agency-vanguard',
    name: 'Vanguard Digital Product Studio',
    description: 'High-impact agency layout with bold editorial typography, portfolio case studies, service cards, and interactive quote estimator.',
    category: 'Agency',
    previewGradient: 'from-violet-600 via-purple-700 to-pink-700',
    tags: ['Agency', 'Studio', 'Portfolio', 'Bold'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VANGUARD — Digital Product Studio</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body>
  <header>
    <div class="brand">VANGUARD</div>
    <a href="#contact" class="btn-black">Start a Project</a>
  </header>
  <section class="hero">
    <h1>WE DESIGN & BUILD DIGITAL PRODUCTS THAT SHAPE INDUSTRIES.</h1>
  </section>
</body>
</html>`,
      'style.css': `* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #0d0a14; color: #f3e8ff; font-family: 'Inter', sans-serif; }
header { display: flex; justify-content: space-between; padding: 2rem 5%; }
.brand { font-family: 'Syne'; font-size: 2rem; font-weight: 800; color: #c084fc; letter-spacing: -1px; }
.btn-black { background: #c084fc; color: #0d0a14; padding: 0.8rem 1.6rem; font-weight: 700; text-decoration: none; border-radius: 99px; }
.hero { padding: 6rem 5%; max-width: 1100px; }
.hero h1 { font-family: 'Syne'; font-size: 3.8rem; font-weight: 800; line-height: 1.1; color: #fff; }`,
      'script.js': `console.log('Vanguard Studio loaded');`,
      'README.md': `# Vanguard Agency Website\n\nBuilt with VERVOX AI.`,
    },
  },
  {
    id: 'ecom-minimal',
    name: 'KRONOS Minimal Tech Accessories',
    description: 'Clean e-commerce product storefront with product gallery, shopping cart drawer, customer reviews, and quick checkout modal.',
    category: 'E-commerce',
    previewGradient: 'from-slate-700 via-gray-800 to-zinc-900',
    tags: ['E-Commerce', 'Storefront', 'Minimalist', 'Products'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KRONOS — Precision Everyday Gear</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <header>
    <div class="logo">K R O N O S</div>
    <div class="cart-btn" onclick="openCart()">Cart (<span id="cartCount">0</span>)</div>
  </header>
  <section class="grid">
    <div class="card">
      <div class="img-box">🎧</div>
      <h3>Kronos ANC Pro Headphones</h3>
      <p>$299.00</p>
      <button onclick="addToCart()">Add to Cart</button>
    </div>
    <div class="card">
      <div class="img-box">⌚</div>
      <h3>Titanium Smart Ring</h3>
      <p>$199.00</p>
      <button onclick="addToCart()">Add to Cart</button>
    </div>
  </section>
  <script src="script.js"></script>
</body>
</html>`,
      'style.css': `* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
body { background: #121215; color: #f4f4f5; }
header { display: flex; justify-content: space-between; padding: 1.5rem 5%; border-bottom: 1px solid #27272a; }
.logo { font-size: 1.4rem; font-weight: 700; letter-spacing: 4px; }
.cart-btn { background: #27272a; padding: 0.5rem 1rem; border-radius: 99px; cursor: pointer; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; padding: 4rem 5%; max-width: 1100px; margin: 0 auto; }
.card { background: #18181b; padding: 2rem; border-radius: 12px; text-align: center; border: 1px solid #27272a; }
.img-box { font-size: 4rem; margin-bottom: 1rem; }
.card h3 { margin-bottom: 0.5rem; }
.card p { color: #a1a1aa; margin-bottom: 1rem; font-weight: 600; }
.card button { background: #f4f4f5; color: #18181b; border: none; padding: 0.7rem 1.5rem; border-radius: 6px; font-weight: 600; cursor: pointer; }`,
      'script.js': `let count = 0;
function addToCart() {
  count++;
  document.getElementById('cartCount').innerText = count;
  alert('Item added to your shopping cart!');
}`,
      'README.md': `# Kronos E-commerce Store\n\nBuilt with VERVOX AI.`,
    },
  },
  {
    id: 'blog-minimal',
    name: 'Monochrome Tech Journal',
    description: 'Minimalist publication theme with dark mode toggle, article search filter, reading time badges, and newsletter signup.',
    category: 'Blog',
    previewGradient: 'from-rose-600 via-pink-600 to-purple-800',
    tags: ['Blog', 'Journal', 'Typography', 'Minimal'],
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monochrome Journal</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header><h1>MONOCHROME JOURNAL</h1></header>
  <main>
    <article>
      <h2>The Future of Distributed AI Systems</h2>
      <p>Exploring how edge nodes are shaping next-gen machine learning inference pipelines.</p>
    </article>
  </main>
</body>
</html>`,
      'style.css': `body { background: #0a0a0a; color: #e5e5e5; font-family: sans-serif; max-width: 700px; margin: 0 auto; padding: 2rem; }
header { border-bottom: 1px solid #333; padding-bottom: 1rem; margin-bottom: 2rem; }
article { margin-bottom: 2rem; }
h2 { color: #fff; margin-bottom: 0.5rem; }
p { color: #888; }`,
      'script.js': `console.log('Journal active');`,
      'README.md': `# Monochrome Journal\n\nBuilt with VERVOX AI.`,
    },
  },
];
