#!/usr/bin/env node

console.log('Script started');

// Test if we can even get past the shebang and basic execution
setTimeout(() => {
  console.log('Script is running');
  process.exit(0);
}, 100);

console.log('End of script reached');