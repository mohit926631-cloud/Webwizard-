import { ProjectFiles } from '../types';
import { TEMPLATES } from './templateData';

/**
 * Generate a full website project in VERVOX Demo Mode
 */
export function generateDemoWebsite(prompt: string, category?: string): { files: ProjectFiles; description: string } {
  const p = prompt.toLowerCase();

  // Keyword matching against available templates
  if (p.includes('game') || p.includes('gaming') || p.includes('cyber') || p.includes('esports')) {
    const t = TEMPLATES.find((x) => x.id === 'cyber-gaming') || TEMPLATES[1];
    return { files: { ...t.files }, description: 'Generated a high-octane Esports & Gaming portal with dark cyber theme.' };
  }

  if (p.includes('restaurant') || p.includes('food') || p.includes('bistro') || p.includes('dining') || p.includes('cafe') || p.includes('menu')) {
    const t = TEMPLATES.find((x) => x.id === 'gourmet-bistro') || TEMPLATES[2];
    return { files: { ...t.files }, description: 'Generated a luxury dining restaurant website with interactive menu tabs.' };
  }

  if (p.includes('saas') || p.includes('analytics') || p.includes('business') || p.includes('b2b') || p.includes('software') || p.includes('platform')) {
    const t = TEMPLATES.find((x) => x.id === 'saas-nexus') || TEMPLATES[3];
    return { files: { ...t.files }, description: 'Generated a modern B2B SaaS analytics platform landing page.' };
  }

  if (p.includes('school') || p.includes('course') || p.includes('edu') || p.includes('academy') || p.includes('learn') || p.includes('university')) {
    const t = TEMPLATES.find((x) => x.id === 'edu-academy') || TEMPLATES[4];
    return { files: { ...t.files }, description: 'Generated an online academy & education portal with course cards.' };
  }

  if (p.includes('agency') || p.includes('studio') || p.includes('creative') || p.includes('design')) {
    const t = TEMPLATES.find((x) => x.id === 'agency-vanguard') || TEMPLATES[5];
    return { files: { ...t.files }, description: 'Generated a digital product studio agency landing page.' };
  }

  if (p.includes('store') || p.includes('shop') || p.includes('ecommerce') || p.includes('product') || p.includes('buy')) {
    const t = TEMPLATES.find((x) => x.id === 'ecom-minimal') || TEMPLATES[6];
    return { files: { ...t.files }, description: 'Generated a minimalist e-commerce storefront with product cards.' };
  }

  // Default to developer portfolio
  const defaultTemplate = TEMPLATES[0];
  // Customize portfolio title & name if prompt includes a custom topic
  let customizedHtml = defaultTemplate.files['index.html'];
  const titleMatch = prompt.match(/for\s+([a-zA-Z\s]+)/i);
  if (titleMatch && titleMatch[1]) {
    const name = titleMatch[1].trim();
    customizedHtml = customizedHtml.replace(/Alex Rivera/g, name);
  }

  return {
    files: {
      ...defaultTemplate.files,
      'index.html': customizedHtml,
    },
    description: `Generated a modern responsive website tailored to: "${prompt.slice(0, 50)}..."`,
  };
}

/**
 * Edit existing project files in VERVOX Demo Mode
 */
export function editDemoWebsite(prompt: string, files: ProjectFiles): { updatedFiles: ProjectFiles; explanation: string } {
  const p = prompt.toLowerCase();
  const newFiles = { ...files };
  let html = newFiles['index.html'] || '';
  let css = newFiles['style.css'] || '';
  let js = newFiles['script.js'] || '';
  let explanation = 'Applied requested updates to your project.';

  if (p.includes('color') || p.includes('theme') || p.includes('purple') || p.includes('gradient')) {
    css += `\n\n/* Added custom gradient theme via VERVOX AI */\n:root { --accent-primary: #8b5cf6; --accent-secondary: #ec4899; }\n.hero h1, .brand span { background: linear-gradient(135deg, #a855f7, #ec4899) !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; }\n`;
    explanation = 'Updated color theme to vibrant purple/pink gradient styling.';
  } else if (p.includes('testimonial') || p.includes('review') || p.includes('feedback')) {
    const testimonialSnippet = `
  <section class="testimonials-section" style="max-width: 1000px; margin: 4rem auto; padding: 0 1.5rem; text-align: center;">
    <h2 style="font-size: 2rem; margin-bottom: 2rem; color: #fff;">What Clients Say</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
      <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        <p style="color: #cbd5e1; font-style: italic; margin-bottom: 1rem;">"VERVOX completely transformed how fast we build landing pages."</p>
        <strong style="color: #3b82f6;">— Sarah Jenkins, CEO at TechFlow</strong>
      </div>
      <div style="background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        <p style="color: #cbd5e1; font-style: italic; margin-bottom: 1rem;">"The AI customization is remarkably accurate and saved weeks of work."</p>
        <strong style="color: #3b82f6;">— David Chen, Lead Product Designer</strong>
      </div>
    </div>
  </section>`;
    html = html.replace('</main>', `${testimonialSnippet}\n</main>`);
    if (!html.includes('</main>')) {
      html = html.replace('</body>', `${testimonialSnippet}\n</body>`);
    }
    explanation = 'Added a testimonials section with client reviews and styled cards.';
  } else if (p.includes('hero') || p.includes('bigger') || p.includes('headline')) {
    css += `\n.hero h1 { font-size: 4rem !important; font-weight: 900 !important; line-height: 1.1 !important; }\n.hero { padding-top: 8rem !important; padding-bottom: 8rem !important; }\n`;
    explanation = 'Increased hero section dimensions and made headlines bigger and bolder.';
  } else if (p.includes('contact') || p.includes('form')) {
    const formSnippet = `
  <section id="contact-form-section" style="max-width: 600px; margin: 4rem auto; padding: 2rem; background: rgba(30,41,59,0.6); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
    <h2 style="color: #fff; margin-bottom: 1rem; text-align: center;">Get in Touch</h2>
    <form id="aiContactForm" style="display: flex; flex-direction: column; gap: 1rem;">
      <input type="text" placeholder="Full Name" required style="padding: 0.8rem; background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff;">
      <input type="email" placeholder="Email Address" required style="padding: 0.8rem; background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff;">
      <textarea placeholder="Your message..." rows="4" required style="padding: 0.8rem; background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff;"></textarea>
      <button type="submit" style="background: #3b82f6; color: white; border: none; padding: 0.9rem; border-radius: 8px; font-weight: 600; cursor: pointer;">Send Message</button>
    </form>
  </section>`;
    html = html.replace('</body>', `${formSnippet}\n</body>`);
    js += `\ndocument.getElementById('aiContactForm')?.addEventListener('submit', (e) => { e.preventDefault(); alert('Message sent successfully!'); e.target.reset(); });\n`;
    explanation = 'Added a contact form section with submit event listeners.';
  } else if (p.includes('mobile') || p.includes('responsive')) {
    css += `\n@media (max-width: 768px) { h1 { font-size: 2.2rem !important; } .grid { grid-template-columns: 1fr !important; } .nav-links { gap: 1rem !important; font-size: 0.85rem !important; } }\n`;
    explanation = 'Enhanced mobile responsiveness with responsive breakpoints and layout adaptations.';
  } else {
    css += `\n/* Enhanced via VERVOX AI */\n.card, .btn-primary, .btn-secondary { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }\n`;
    explanation = `Enhanced project files based on: "${prompt}"`;
  }

  newFiles['index.html'] = html;
  newFiles['style.css'] = css;
  newFiles['script.js'] = js;

  return { updatedFiles: newFiles, explanation };
}

export const demoAIEngine = {
  generateFromPrompt: (prompt: string, category?: string): ProjectFiles => {
    return generateDemoWebsite(prompt, category).files;
  },
  editFiles: (files: ProjectFiles, prompt: string): ProjectFiles => {
    return editDemoWebsite(prompt, files).updatedFiles;
  },
  generateDemoWebsite,
  editDemoWebsite,
};
