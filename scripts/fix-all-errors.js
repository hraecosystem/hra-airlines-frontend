const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting comprehensive error fixing process...');

// Function to run a command and log its output
const runCommand = (command) => {
  try {
    console.log(`\n🔄 Running: ${command}\n`);
    execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    return true;
  } catch (error) {
    console.error(`❌ Error running command: ${command}`);
    return false;
  }
};

// Step 1: Fix unused imports
console.log('\n📦 Step 1: Removing unused imports...');
require('./fix-lint-errors');

// Step 2: Fix unused expressions
console.log('\n🔍 Step 2: Fixing unused expressions...');
require('./fix-unused-expressions');

// Step 3: Run ESLint with --fix flag to auto-fix what it can
console.log('\n🧹 Step 3: Running ESLint auto-fixes...');
runCommand('npm run lint:fix');

// Step 4: Convert <img> to Next.js <Image> components
console.log('\n🖼️ Step 4: Analyzing image components...');
// This is more complex - we'll output a list of files that need manual attention
const imgElementFiles = [];

// Helper function to find files with <img> tags
const findImgElements = (dir) => {
  fs.readdirSync(dir).forEach(f => {
    let filePath = path.join(dir, f);
    let isDirectory = fs.statSync(filePath).isDirectory();
    
    if (isDirectory) {
      findImgElements(filePath);
    } else if (['.tsx', '.jsx'].includes(path.extname(f))) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('<img ')) {
        imgElementFiles.push(filePath);
      }
    }
  });
};

// Find files with <img> elements
findImgElements(path.join(__dirname, '..', 'app'));
findImgElements(path.join(__dirname, '..', 'components'));

// List files that need attention for <img> to <Image> conversion
if (imgElementFiles.length > 0) {
  console.log('\n⚠️ The following files contain <img> elements that should be converted to Next.js <Image> components:');
  imgElementFiles.forEach(file => {
    console.log(`   - ${path.relative(path.join(__dirname, '..'), file)}`);
  });
}

// Step 5: Provide summary and recommendations
console.log('\n✅ Error fixing process completed!');
console.log('\nRemaining tasks:');
console.log('1. Replace "any" types with specific interfaces (run "npm run analyze-types" for suggestions)');
console.log('2. Convert <img> elements to Next.js <Image> components in the files listed above');
console.log('3. Run "npm run build" to check for remaining issues');
console.log('\nHappy coding! 🎉'); 