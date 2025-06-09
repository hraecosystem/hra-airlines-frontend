const fs = require('fs');
const path = require('path');

// Function to remove unused imports
const removeUnusedImports = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Get list of imports that are marked as unused
    const lines = content.split('\n');
    const importLines = lines.filter(line => line.includes('import '));
    
    // Parse the imports to find variables
    for (const importLine of importLines) {
      const match = importLine.match(/import\s+{([^}]+)}\s+from/);
      if (match) {
        const imports = match[1].split(',').map(i => i.trim());
        
        // Check each import variable
        imports.forEach(importVar => {
          // If it's not used elsewhere in the file (simple check)
          if (content.split(importVar).length <= 2) { // only appears in import
            content = content.replace(new RegExp(`\\b${importVar}\\b,?\\s*`, 'g'), '');
            // Clean up any empty import statements or trailing commas
            content = content.replace(/import\s*{\s*}\s*from\s*['"][^'"]+['"];?/g, '');
            content = content.replace(/import\s*{\s*,\s*}/g, 'import {');
            content = content.replace(/,\s*}/g, ' }');
          }
        });
      }
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Processed: ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
};

const walkDir = (dir, callback) => {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(f))) {
        callback(path.join(dir, f));
      }
    }
  });
};

// Process files
console.log('Starting to fix lint errors...');

// Process app directory
walkDir(path.join(__dirname, '..', 'app'), removeUnusedImports);

// Process components directory
walkDir(path.join(__dirname, '..', 'components'), removeUnusedImports);

// Process lib directory
walkDir(path.join(__dirname, '..', 'lib'), removeUnusedImports);

console.log('Done fixing lint errors. Please run "npm run lint" to check for remaining issues.'); 