const fs = require('fs');
const files = ['app/login/login-form.tsx', 'app/signup-form.tsx'];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix the broken dark:hover string
    content = content.replaceAll('dark:hover:bg-[#eef1fa] dark:bg-accent-hover', 'dark:hover:bg-accent-hover');
    
    // Replace text-white with black in light mode for the button
    content = content.replaceAll('dark:hover:bg-accent-hover text-white rounded-[8px]', 'dark:hover:bg-accent-hover text-primary dark:text-white rounded-[8px]');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed', file);
  }
});
