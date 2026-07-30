const fs = require('fs');
const path = require('path');

const directories = ['app', 'components'];
const fileExtensions = ['.tsx', '.ts'];

const replacements = {
  // Backgrounds & Surfaces
  'bg-\\[#0f172a\\]': 'bg-background',
  'bg-slate-950': 'bg-background',
  'bg-slate-900': 'bg-surface-solid',
  'bg-slate-800': 'bg-surface-muted',
  'bg-slate-700': 'bg-surface-muted',
  'bg-white/5': 'bg-surface',
  'bg-white/10': 'bg-surface-muted',
  'bg-white/20': 'bg-surface-muted',
  
  // Borders
  'border-white/5': 'border-border',
  'border-white/10': 'border-border',
  'border-white/20': 'border-border-strong',
  'border-slate-800': 'border-border',
  'border-slate-700': 'border-border',
  
  // Text Colors
  'text-slate-100': 'text-primary',
  'text-slate-200': 'text-primary',
  'text-slate-300': 'text-secondary',
  'text-slate-400': 'text-muted',
  'text-slate-500': 'text-muted',
  
  // Accent Colors
  'bg-indigo-600': 'bg-accent',
  'bg-indigo-500': 'bg-accent-hover',
  'hover:bg-indigo-500': 'hover:bg-accent-hover',
  'text-indigo-400': 'text-accent',
  'text-indigo-500': 'text-accent',
  
  // Blurs/Ambience
  'bg-indigo-900/20': 'bg-accent/10',
  'bg-purple-900/15': 'bg-accent/5',
};

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fileExtensions.includes(path.extname(fullPath))) {
      // Don't touch AuthIllustration, login-form, or signup-form because we already manually perfected them
      if (['AuthIllustration.tsx', 'login-form.tsx', 'signup-form.tsx', 'page.tsx'].some(f => fullPath.endsWith(f) && fullPath.includes('login') || fullPath.includes('signup'))) {
         // wait, app/portal/page.tsx should be processed. We only skip app/login/page.tsx, app/signup/page.tsx, and their forms.
         if (fullPath.includes('login') || fullPath.includes('signup') || fullPath.includes('AuthIllustration')) {
             return;
         }
      }

      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const [search, replace] of Object.entries(replacements)) {
        // We use regex to match whole words/classes where appropriate
        const regex = new RegExp(`\\b${search.replace(/[-\\/\\^$*+?.()|[\\]{}]/g, '\\$&')}\\b`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, replace);
          modified = true;
        }
      }
      
      // Also catch dynamic template string instances without word boundary for specific symbols
      for (const [search, replace] of Object.entries(replacements)) {
         if (search.includes('[')) { // like bg-[#0f172a]
            const rawRegex = new RegExp(search.replace(/[-\\/\\^$*+?.()|[\\]{}]/g, '\\$&'), 'g');
            if (rawRegex.test(content)) {
               content = content.replace(rawRegex, replace);
               modified = true;
            }
         }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  });
}

directories.forEach(dir => processDirectory(path.join(__dirname, dir)));
console.log('Codemod complete.');
