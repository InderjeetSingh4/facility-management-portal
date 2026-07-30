const fs = require('fs');
const path = require('path');

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      // 1. Hardcoded blue buttons in login/signup
      content = content.replaceAll('bg-[#2148c4]', 'bg-[#eef1fa] dark:bg-accent');
      content = content.replaceAll('hover:bg-[#1a3aa0]', 'hover:bg-[#d7dceb] dark:hover:bg-accent-hover');
      
      // 2. Accent buttons
      content = content.replaceAll('bg-accent text-white hover:bg-accent-hover', 'bg-[#eef1fa] text-[#000000] hover:bg-[#d7dceb] dark:bg-accent dark:text-accent-foreground dark:hover:bg-accent-hover');
      content = content.replaceAll('bg-accent text-white', 'bg-[#eef1fa] text-[#000000] dark:bg-accent dark:text-accent-foreground');
      
      content = content.replaceAll('bg-accent text-accent-foreground', 'bg-[#eef1fa] text-[#000000] dark:bg-accent dark:text-accent-foreground');
      
      content = content.replaceAll('bg-accent px-', 'bg-[#eef1fa] dark:bg-accent px-');
      content = content.replaceAll('text-accent-foreground', 'text-[#000000] dark:text-accent-foreground');

      // 3. For ComplaintBox which has 'bg-accent ... text-primary'
      content = content.replaceAll('bg-accent', 'bg-[#eef1fa] dark:bg-accent');
      content = content.replaceAll('hover:bg-accent-hover', 'hover:bg-[#d7dceb] dark:hover:bg-accent-hover');
      
      // Fix double replacements
      content = content.replaceAll('bg-[#eef1fa] dark:bg-[#eef1fa] dark:bg-accent', 'bg-[#eef1fa] dark:bg-accent');
      content = content.replaceAll('text-[#000000] dark:text-[#000000] dark:text-accent-foreground', 'text-[#000000] dark:text-accent-foreground');
      content = content.replaceAll('hover:bg-[#d7dceb] dark:hover:bg-[#d7dceb] dark:hover:bg-accent-hover', 'hover:bg-[#d7dceb] dark:hover:bg-accent-hover');
      
      // Exclude text-accent (keep it for links)
      // We didn't touch text-accent, only text-accent-foreground, which is safe.
      
      // Restore specific safe classes that shouldn't be touched:
      // bg-accent/10 and bg-accent/20 
      content = content.replaceAll('bg-[#eef1fa] dark:bg-accent/10', 'bg-accent/10');
      content = content.replaceAll('bg-[#eef1fa] dark:bg-accent/20', 'bg-accent/20');
      content = content.replaceAll('bg-[#eef1fa] dark:bg-accent/5', 'bg-accent/5');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated buttons in: ${fullPath}`);
      }
    }
  });
}

processDirectory(path.join(__dirname, 'app'));
processDirectory(path.join(__dirname, 'components'));
console.log('Button update complete.');
