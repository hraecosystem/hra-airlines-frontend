const fs = require('fs');
const path = require('path');

// Function to analyze and generate TypeScript interfaces
const analyzeAndGenerateInterfaces = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Look for any type annotations
    const anyUsageRegex = /:\s*any\b/g;
    let match;
    const variables = [];
    
    while ((match = anyUsageRegex.exec(content)) !== null) {
      // Find the variable name
      const line = content.substring(0, match.index).split('\n').pop();
      const varNameMatch = line.match(/\b(\w+)\s*:/);
      
      if (varNameMatch && varNameMatch[1]) {
        variables.push(varNameMatch[1]);
      }
    }
    
    if (variables.length > 0) {
      // Generate interface name based on file name
      const fileName = path.basename(filePath, path.extname(filePath));
      const interfaceName = `I${fileName.charAt(0).toUpperCase() + fileName.slice(1)}`;
      
      console.log(`\nIn file: ${filePath}`);
      console.log(`Consider replacing 'any' with structured types:`);
      
      // Generate sample interface
      console.log(`\ninterface ${interfaceName} {`);
      variables.forEach(varName => {
        console.log(`  ${varName}: unknown; // Replace with specific type`);
      });
      console.log('}\n');
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
};

// Helper function to walk through directories
const walkDir = (dir, callback) => {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (['.ts', '.tsx'].includes(path.extname(f))) {
        callback(path.join(dir, f));
      }
    }
  });
};

// Main execution
console.log('Analyzing TypeScript files for "any" type usage...');

// Process app directory
walkDir(path.join(__dirname, '..', 'app'), analyzeAndGenerateInterfaces);

// Process components directory
walkDir(path.join(__dirname, '..', 'components'), analyzeAndGenerateInterfaces);

// Process lib directory
walkDir(path.join(__dirname, '..', 'lib'), analyzeAndGenerateInterfaces);

console.log('Analysis complete. Consider implementing suggested interfaces above.'); 