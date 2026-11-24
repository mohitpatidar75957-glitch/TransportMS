const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const cssFiles = walk('./src');

cssFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const replaceMap = {
    'background-color: #1a1a24;': 'background-color: var(--sidebar-bg);',
    'background-color: rgba(255, 255, 255, 0.05);': 'background-color: var(--hover-color);',
    'border: 1px solid rgba(255, 255, 255, 0.05);': 'border: 1px solid var(--border-color);',
    'color: #f0f0f0;': 'color: var(--text-primary);',
    'color: #9090a0;': 'color: var(--text-secondary);'
  };

  for (const [key, value] of Object.entries(replaceMap)) {
    if (content.includes(key)) {
      content = content.split(key).join(value);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
