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
      
      // Replace bg-accent text-primary with bg-accent text-white
      if (content.includes('bg-accent text-primary')) {
        content = content.replaceAll('bg-accent text-primary', 'bg-accent text-white');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed: ${fullPath}`);
      }
    }
  });
}

processDirectory(path.join(__dirname, 'app'));
processDirectory(path.join(__dirname, 'components'));
console.log('Fix complete.');
