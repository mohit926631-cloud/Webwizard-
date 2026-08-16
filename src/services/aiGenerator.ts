import { Project, ProjectFiles, User } from '../types';
import { storage } from './storage';
import { TEMPLATES } from './templateData';

// Safe JSON parser for AI outputs
function cleanAndParseJSON(rawText: string): any {
  if (!rawText || !rawText.trim()) {
    throw new Error('Empty response from AI model');
  }

  let clean = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/g, '')
    .trim();

  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(clean);
  } catch {
    // Clean trailing commas
    clean = clean.replace(/,(\s*[\}\]])/g, '$1');
    return JSON.parse(clean);
  }
}

/**
 * Generate website directly from Google Gemini API when API key is available
 */
async function generateWithGeminiDirect(
  prompt: string,
  category: string,
  apiKey: string
): Promise<{ files: ProjectFiles; name: string; description: string; category: string } | null> {
  try {
    const systemInstruction = `You are VERVOX AI, an elite full-stack web engineer.
Generate a complete, fully functional, beautifully designed website according to the user's prompt.
Return ONLY a valid JSON object with EXACTLY these keys:
{
  "name": "Project Name",
  "description": "Short project description",
  "category": "${category || 'General'}",
  "html": "<!DOCTYPE html><html lang=\\"en\\"><head>...Full HTML5 body with modern structure, header, hero, sections, footer...</head><body>...</body></html>",
  "css": "/* Complete responsive CSS with modern color palette, animations, layout styles, and typography */",
  "js": "// Complete vanilla JavaScript for interactive UI, mobile nav toggle, form submissions, and animations",
  "readme": "# Project Title\\n\\nBuilt with VERVOX AI"
}
Ensure the HTML links to style.css and script.js. Include Tailwind CDN <script src="https://cdn.tailwindcss.com"></script> and Google Fonts.
Do NOT wrap your JSON in markdown code blocks if possible. Output strictly valid JSON.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${systemInstruction}\n\nUser Request: ${prompt}` },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const parsed = cleanAndParseJSON(text);
    return {
      name: parsed.name || 'AI Generated Website',
      description: parsed.description || prompt.slice(0, 100),
      category: parsed.category || category || 'Custom',
      files: {
        'index.html': parsed.html || '',
        'style.css': parsed.css || '',
        'script.js': parsed.js || '',
        'README.md': parsed.readme || `# ${parsed.name || 'Website'}\n\nGenerated with VERVOX AI.`,
      },
    };
  } catch (err) {
    console.warn('Direct Gemini generation failed, falling back to smart synthesizer:', err);
    return null;
  }
}

/**
 * Intelligent Client-Side Website Synthesizer
 * Generates custom, responsive, production-ready website templates tailored to any user prompt
 */
export function synthesizeWebsiteFromPrompt(prompt: string, userCategory?: string): {
  project: Project;
  files: ProjectFiles;
} {
  const p = prompt.toLowerCase();

  // Extract a clean project name from prompt
  let projectName = 'Modern Web Experience';
  if (p.includes('for ')) {
    const match = prompt.match(/for\s+([^,.\n]+)/i);
    if (match && match[1]) {
      projectName = match[1].trim().replace(/^a\s+/i, '').replace(/^an\s+/i, '').replace(/^the\s+/i, '');
      projectName = projectName.charAt(0).toUpperCase() + projectName.slice(1);
    }
  } else if (p.length > 0) {
    const words = prompt.split(/\s+/).slice(0, 4).join(' ');
    projectName = words.charAt(0).toUpperCase() + words.slice(1);
  }

  // Determine category & palette
  let category: any = userCategory || 'Landing Page';
  let primaryColor = '#4f46e5'; // Indigo
  let secondaryColor = '#8b5cf6'; // Purple
  let bgDark = '#0b0f19';
  let heroTitle = projectName;
  let heroSubtitle = 'Engineered with cutting-edge design and modern responsive web standards.';
  let previewGradient = 'from-blue-600 via-indigo-600 to-purple-700';

  // Industry-specific themes & sections
  if (p.includes('game') || p.includes('gaming') || p.includes('cyber') || p.includes('esports')) {
    category = 'Gaming';
    primaryColor = '#ec4899';
    secondaryColor = '#06b6d4';
    bgDark = '#090a0f';
    previewGradient = 'from-pink-600 via-purple-600 to-cyan-500';
    heroTitle = projectName.includes('Gaming') ? projectName : `${projectName} — Next-Gen Gaming Portal`;
    heroSubtitle = 'Join thousands of competitive players, explore esports leagues, and experience ultra-low latency tournament arenas.';
  } else if (p.includes('food') || p.includes('restaurant') || p.includes('bistro') || p.includes('dining') || p.includes('cafe') || p.includes('pizza') || p.includes('bakery')) {
    category = 'Restaurant';
    primaryColor = '#f59e0b';
    secondaryColor = '#ef4444';
    bgDark = '#120f0d';
    previewGradient = 'from-amber-500 via-orange-600 to-red-600';
    heroTitle = projectName.includes('Bistro') || projectName.includes('Restaurant') ? projectName : `${projectName} — Culinary Craft & Artisanal Dining`;
    heroSubtitle = 'Experience masterfully prepared gourmet cuisine made with fresh, sustainable farm-to-table ingredients.';
  } else if (p.includes('saas') || p.includes('software') || p.includes('analytics') || p.includes('platform') || p.includes('dashboard') || p.includes('b2b') || p.includes('cloud')) {
    category = 'Business';
    primaryColor = '#3b82f6';
    secondaryColor = '#6366f1';
    bgDark = '#080d1a';
    previewGradient = 'from-blue-600 via-indigo-600 to-cyan-600';
    heroTitle = `${projectName} — Next Generation Cloud Platform`;
    heroSubtitle = 'Accelerate workflow productivity, automate repetitive data tasks, and scale infrastructure in seconds.';
  } else if (p.includes('store') || p.includes('shop') || p.includes('ecommerce') || p.includes('fashion') || p.includes('shoes') || p.includes('apparel') || p.includes('merch')) {
    category = 'E-commerce';
    primaryColor = '#10b981';
    secondaryColor = '#3b82f6';
    bgDark = '#0b1310';
    previewGradient = 'from-emerald-600 via-teal-600 to-blue-600';
    heroTitle = `${projectName} — Curated Essentials & New Arrivals`;
    heroSubtitle = 'Discover premium craftsmanship, sustainable materials, and timeless pieces designed for modern life.';
  } else if (p.includes('portfolio') || p.includes('resume') || p.includes('developer') || p.includes('designer') || p.includes('engineer') || p.includes('freelance')) {
    category = 'Portfolio';
    primaryColor = '#6366f1';
    secondaryColor = '#a855f7';
    bgDark = '#090d16';
    previewGradient = 'from-indigo-600 via-purple-600 to-pink-600';
    heroTitle = `${projectName} — Digital Architect & Creator`;
    heroSubtitle = 'Specializing in high-performance digital products, responsive interfaces, and seamless user experiences.';
  } else if (p.includes('edu') || p.includes('course') || p.includes('academy') || p.includes('school') || p.includes('learn') || p.includes('tutoring')) {
    category = 'Education';
    primaryColor = '#8b5cf6';
    secondaryColor = '#3b82f6';
    bgDark = '#0d0e1c';
    previewGradient = 'from-purple-600 via-indigo-600 to-blue-600';
    heroTitle = `${projectName} — Empower Your Learning Journey`;
    heroSubtitle = 'Interactive cohort courses, mentorship sessions, and hands-on projects guided by industry leaders.';
  } else if (p.includes('fitness') || p.includes('gym') || p.includes('workout') || p.includes('health') || p.includes('trainer')) {
    category = 'Personal';
    primaryColor = '#f97316';
    secondaryColor = '#e11d48';
    bgDark = '#100a08';
    previewGradient = 'from-orange-600 via-rose-600 to-red-700';
    heroTitle = `${projectName} — Transform Your Mind & Body`;
    heroSubtitle = 'Elite strength conditioning, personalized nutrition plans, and high-intensity workout coaching.';
  }

  // Generate complete HTML
  const htmlContent = `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName} — Official Website</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#f5f3ff',
              500: '${primaryColor}',
              600: '${primaryColor}',
              700: '${secondaryColor}',
            }
          },
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
          }
        }
      }
    }
  </script>
</head>
<body class="bg-[#0b0f19] text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white min-h-screen flex flex-col">

  <!-- NAVBAR -->
  <header class="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <a href="#" class="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white group">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
          ⚡
        </div>
        <span>${projectName}<span class="text-indigo-400">.</span></span>
      </a>

      <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
        <a href="#features" class="hover:text-white transition-colors">Features</a>
        <a href="#about" class="hover:text-white transition-colors">About</a>
        <a href="#showcase" class="hover:text-white transition-colors">Showcase</a>
        <a href="#contact" class="hover:text-white transition-colors">Contact</a>
      </nav>

      <div class="hidden sm:flex items-center gap-3">
        <button id="themeToggleBtn" class="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors" title="Toggle Mode">
          ✨
        </button>
        <a href="#contact" class="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/20 transition-all hover:scale-105">
          Get Started
        </a>
      </div>

      <!-- Mobile Menu Button -->
      <button id="mobileMenuBtn" class="md:hidden p-2 text-slate-400 hover:text-white focus:outline-none">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>

    <!-- Mobile Dropdown -->
    <div id="mobileMenu" class="hidden md:hidden px-4 pt-2 pb-6 bg-slate-950/95 border-b border-slate-800 space-y-3">
      <a href="#features" class="block py-2 text-sm text-slate-300 hover:text-white">Features</a>
      <a href="#about" class="block py-2 text-sm text-slate-300 hover:text-white">About</a>
      <a href="#showcase" class="block py-2 text-sm text-slate-300 hover:text-white">Showcase</a>
      <a href="#contact" class="block py-2 text-sm text-indigo-400 font-semibold">Get Started</a>
    </div>
  </header>

  <!-- MAIN CONTENT -->
  <main class="flex-1">
    <!-- HERO SECTION -->
    <section class="relative pt-20 pb-24 overflow-hidden text-center">
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none"></div>

      <div class="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-6">
          <span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
          <span>Official Launch 2026</span>
        </div>

        <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
          ${heroTitle}
        </h1>

        <p class="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          ${heroSubtitle}
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#contact" class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105">
            Explore Now &rarr;
          </a>
          <a href="#features" class="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-sm transition-all">
            Learn More
          </a>
        </div>
      </div>
    </section>

    <!-- METRICS / STATS -->
    <section class="py-12 border-y border-slate-800/60 bg-slate-950/40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div class="p-4">
          <div class="text-3xl sm:text-4xl font-extrabold text-white mb-1 counter" data-target="99.9">99.9%</div>
          <div class="text-xs text-slate-400 font-medium">Uptime Guarantee</div>
        </div>
        <div class="p-4">
          <div class="text-3xl sm:text-4xl font-extrabold text-white mb-1 counter" data-target="150">150k+</div>
          <div class="text-xs text-slate-400 font-medium">Active Users</div>
        </div>
        <div class="p-4">
          <div class="text-3xl sm:text-4xl font-extrabold text-white mb-1 counter" data-target="4.9">4.9/5</div>
          <div class="text-xs text-slate-400 font-medium">Client Rating</div>
        </div>
        <div class="p-4">
          <div class="text-3xl sm:text-4xl font-extrabold text-white mb-1 counter" data-target="24">24/7</div>
          <div class="text-xs text-slate-400 font-medium">Global Support</div>
        </div>
      </div>
    </section>

    <!-- FEATURES SECTION -->
    <section id="features" class="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider mb-2">Engineered For Performance</h2>
        <h3 class="text-3xl sm:text-4xl font-extrabold text-white">Everything You Need to Succeed</h3>
        <p class="text-slate-400 text-sm sm:text-base mt-3">Built with modern architecture to deliver speed, reliability, and precision at scale.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Feature 1 -->
        <div class="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 transition-all group hover:-translate-y-1">
          <div class="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
            ⚡
          </div>
          <h4 class="text-xl font-bold text-white mb-3">Ultra Fast Performance</h4>
          <p class="text-slate-400 text-sm leading-relaxed">
            Optimized for sub-second load times and silky smooth animations on any mobile or desktop screen.
          </p>
        </div>

        <!-- Feature 2 -->
        <div class="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 transition-all group hover:-translate-y-1">
          <div class="w-12 h-12 rounded-xl bg-purple-600/10 text-purple-400 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
            🛡️
          </div>
          <h4 class="text-xl font-bold text-white mb-3">Built-in Security</h4>
          <p class="text-slate-400 text-sm leading-relaxed">
            Enterprise-grade data encryption, automated protection layers, and privacy-first design principles.
          </p>
        </div>

        <!-- Feature 3 -->
        <div class="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 transition-all group hover:-translate-y-1">
          <div class="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">
            🎯
          </div>
          <h4 class="text-xl font-bold text-white mb-3">Intuitive Usability</h4>
          <p class="text-slate-400 text-sm leading-relaxed">
            Clean, distraction-free interface designed for seamless navigation and instant conversions.
          </p>
        </div>
      </div>
    </section>

    <!-- INTERACTIVE SHOWCASE / TABS -->
    <section id="showcase" class="py-20 bg-slate-950/60 border-y border-slate-800/60">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h3 class="text-3xl font-extrabold text-white">Interactive Experience</h3>
          <p class="text-slate-400 text-sm mt-2">Explore the core capabilities of the platform.</p>
        </div>

        <div class="max-w-3xl mx-auto p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div class="flex items-center justify-center gap-2 mb-6 border-b border-slate-800 pb-4">
            <button class="tab-btn active px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white" data-tab="tab-overview">Overview</button>
            <button class="tab-btn px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white" data-tab="tab-specs">Specifications</button>
            <button class="tab-btn px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white" data-tab="tab-faq">Quick FAQ</button>
          </div>

          <div id="tab-overview" class="tab-content text-slate-300 text-sm leading-relaxed space-y-4">
            <p>Welcome to <strong>${projectName}</strong>. This solution was dynamically generated and optimized for production deployment.</p>
            <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <div class="text-white font-semibold">Status Check</div>
                <div class="text-xs text-emerald-400">● All systems operational</div>
              </div>
              <button id="pingTestBtn" class="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 text-xs font-semibold hover:bg-indigo-600/30">
                Run Diagnostic
              </button>
            </div>
            <div id="diagnosticOutput" class="hidden p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs">
              ⚡ Diagnostic latency: 24ms | System health 100% | Zero packet drop
            </div>
          </div>

          <div id="tab-specs" class="tab-content hidden text-slate-300 text-sm space-y-3">
            <div class="flex justify-between py-2 border-b border-slate-800">
              <span class="text-slate-400">Framework</span>
              <span class="font-mono text-white">Semantic HTML5 + Tailwind</span>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-800">
              <span class="text-slate-400">Compatibility</span>
              <span class="font-mono text-white">Chrome, Safari, Firefox, Edge</span>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-800">
              <span class="text-slate-400">Bundle Size</span>
              <span class="font-mono text-emerald-400">&lt; 25 KB</span>
            </div>
          </div>

          <div id="tab-faq" class="tab-content hidden text-slate-300 text-sm space-y-3">
            <div>
              <strong class="text-white">How do I customize this project?</strong>
              <p class="text-slate-400 text-xs mt-1">You can edit the HTML, CSS, and JS files directly in VERVOX or export as a clean ZIP package.</p>
            </div>
            <div>
              <strong class="text-white">Is this website mobile responsive?</strong>
              <p class="text-slate-400 text-xs mt-1">Yes, it adapts smoothly across phones, tablets, and wide desktop displays.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CONTACT / CALL TO ACTION -->
    <section id="contact" class="py-24 max-w-4xl mx-auto px-4 sm:px-6">
      <div class="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 text-center relative overflow-hidden">
        <h3 class="text-3xl sm:text-4xl font-extrabold text-white mb-4">Ready to Get Started?</h3>
        <p class="text-slate-300 text-sm max-w-xl mx-auto mb-8">
          Join our growing community today. Send us a message or request an invitation to start immediately.
        </p>

        <form id="contactForm" class="max-w-md mx-auto space-y-3 text-left">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
            <input type="text" id="contactName" required placeholder="Alex Morgan" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input type="email" id="contactEmail" required placeholder="alex@example.com" class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Message</label>
            <textarea id="contactMessage" rows="3" required placeholder="Tell us about your project..." class="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"></textarea>
          </div>
          <button type="submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer">
            Send Message
          </button>
        </form>

        <div id="formSuccessMessage" class="hidden mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
          ✓ Thank you! Your message has been received. We will be in touch shortly.
        </div>
      </div>
    </section>
  </main>

  <!-- FOOTER -->
  <footer class="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-400">
    <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>© 2026 ${projectName}. All rights reserved.</div>
      <div class="flex items-center gap-6">
        <a href="#" class="hover:text-white transition-colors">Privacy Policy</a>
        <a href="#" class="hover:text-white transition-colors">Terms of Service</a>
        <a href="#" class="hover:text-white transition-colors">Contact</a>
      </div>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>`;

  const cssContent = `/* Custom Stylesheet for ${projectName} */
:root {
  --primary: ${primaryColor};
  --secondary: ${secondaryColor};
  --bg-dark: ${bgDark};
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--bg-dark);
}

/* Custom subtle scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #090d16;
}
::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #334155;
}

/* Interactive Card Effects */
.tab-btn.active {
  background-color: var(--primary);
  color: #ffffff;
}

/* Smooth Transitions */
button, a {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
`;

  const jsContent = `// Interactive Application Logic for ${projectName}
document.addEventListener('DOMContentLoaded', () => {
  console.log('${projectName} loaded successfully!');

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Interactive Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      
      tabBtns.forEach((b) => {
        b.classList.remove('active', 'bg-indigo-600', 'text-white');
        b.classList.add('text-slate-400');
      });
      tabContents.forEach((c) => c.classList.add('hidden'));

      btn.classList.add('active', 'bg-indigo-600', 'text-white');
      btn.classList.remove('text-slate-400');

      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.classList.remove('hidden');
      }
    });
  });

  // Diagnostic Ping Test
  const pingBtn = document.getElementById('pingTestBtn');
  const diagnosticOut = document.getElementById('diagnosticOutput');
  if (pingBtn && diagnosticOut) {
    pingBtn.addEventListener('click', () => {
      diagnosticOut.classList.remove('hidden');
      diagnosticOut.textContent = '⚡ Running diagnostic test...';
      setTimeout(() => {
        diagnosticOut.textContent = '✓ Diagnostic passed! Response time 18ms. Service 100% operational.';
      }, 500);
    });
  }

  // Contact Form Submission
  const contactForm = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccessMessage');

  if (contactForm && successMsg) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      contactForm.classList.add('opacity-50', 'pointer-events-none');
      
      setTimeout(() => {
        contactForm.reset();
        contactForm.classList.remove('opacity-50', 'pointer-events-none');
        successMsg.classList.remove('hidden');
        setTimeout(() => {
          successMsg.classList.add('hidden');
        }, 5000);
      }, 600);
    });
  }
});
`;

  const readmeContent = `# ${projectName}

Generated with **VERVOX AI**.

## Project Files
- \`index.html\`: Semantic HTML5 structure with responsive Tailwind layout.
- \`style.css\`: Custom color palette and UI utility styles.
- \`script.js\`: Interactive component handlers, mobile menu toggle, and tab switches.

## Running Locally
Open \`index.html\` directly in any web browser, or host on any static provider (Netlify, Vercel, GitHub Pages).
`;

  const files: ProjectFiles = {
    'index.html': htmlContent,
    'style.css': cssContent,
    'script.js': jsContent,
    'README.md': readmeContent,
  };

  const project: Project = {
    id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: 'user_active',
    name: projectName,
    description: heroSubtitle,
    category,
    files,
    thumbnailGradient: previewGradient,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'Ready',
    framework: 'HTML5 / Tailwind / Vanilla JS',
    versionNumber: 1,
  };

  return { project, files };
}

/**
 * Main AI Generator Orchestrator
 * Checks BYOK Gemini API key first, then falls back seamlessly to smart synthesizer
 */
export async function generateWebsiteResilient(
  prompt: string,
  category?: string
): Promise<{ success: boolean; project: Project; files: ProjectFiles; user: User; creditsDeducted: number }> {
  const currentUser = storage.getUser();
  const byokKey = storage.getByok() || localStorage.getItem('gemini_api_key') || (import.meta.env.VITE_GEMINI_API_KEY as string) || '';

  // 1. Try Gemini API directly if key is configured
  if (byokKey && byokKey.trim().length > 10) {
    const geminiResult = await generateWithGeminiDirect(prompt, category || 'Custom', byokKey);
    if (geminiResult) {
      const project: Project = {
        id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: currentUser.id || 'default_user',
        name: geminiResult.name,
        description: geminiResult.description,
        category: (geminiResult.category as any) || 'Custom',
        files: geminiResult.files,
        thumbnailGradient: 'from-blue-600 via-indigo-600 to-purple-700',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'Ready',
        framework: 'HTML5 / Tailwind / Vanilla JS',
        versionNumber: 1,
      };

      const updatedUser: User = {
        ...currentUser,
        usage: {
          ...currentUser.usage,
          creditsUsed: (currentUser.usage?.creditsUsed || 0) + 10,
          generationsUsed: (currentUser.usage?.generationsUsed || 0) + 1,
        },
      };
      storage.saveUser(updatedUser);

      return {
        success: true,
        project,
        files: geminiResult.files,
        user: updatedUser,
        creditsDeducted: 10,
      };
    }
  }

  // 2. Synthesize using our responsive template engine
  const synthesized = synthesizeWebsiteFromPrompt(prompt, category);
  const updatedUser: User = {
    ...currentUser,
    usage: {
      ...currentUser.usage,
      creditsUsed: (currentUser.usage?.creditsUsed || 0) + 10,
      generationsUsed: (currentUser.usage?.generationsUsed || 0) + 1,
    },
  };
  storage.saveUser(updatedUser);

  return {
    success: true,
    project: synthesized.project,
    files: synthesized.files,
    user: updatedUser,
    creditsDeducted: 10,
  };
}
