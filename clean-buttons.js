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
      
      // Clean up the mess from the previous script
      content = content.replaceAll('bg-[#eef1fa] dark:bg-[#eef1fa] dark:bg-accent', 'bg-[#eef1fa]');
      content = content.replaceAll('bg-[#eef1fa] text-[#2148c4] dark:bg-[#eef1fa] dark:bg-accent dark:text-primary', 'bg-[#eef1fa] text-[#000000]');
      
      content = content.replaceAll('bg-[#eef1fa] dark:bg-accent', 'bg-[#eef1fa]');
      
      content = content.replaceAll('text-[#000000] dark:text-[#000000] dark:text-accent-foreground', 'text-[#000000]');
      content = content.replaceAll('text-[#000000] dark:text-accent-foreground', 'text-[#000000]');
      
      content = content.replaceAll('hover:bg-[#d7dceb] dark:hover:bg-[#d7dceb] dark:hover:bg-accent-hover', 'hover:bg-[#d7dceb]');
      content = content.replaceAll('hover:bg-[#d7dceb] dark:hover:bg-accent-hover', 'hover:bg-[#d7dceb]');
      
      content = content.replaceAll('dark:hover:bg-[#eef1fa] dark:bg-accent-hover', '');
      
      // Make sure brand icons etc. are just light blue with black text in both modes
      // The user explicitly requested light blue background with black text.
      // So bg-[#eef1fa] and text-[#000000] should just be universal for these buttons.

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Cleaned buttons in: ${fullPath}`);
      }
    }
  });
}

processDirectory(path.join(__dirname, 'app'));
processDirectory(path.join(__dirname, 'components'));
console.log('Cleanup complete.');
