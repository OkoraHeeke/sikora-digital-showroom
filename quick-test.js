#!/usr/bin/env node

console.log('🚀 Quick Electron test - starting app directly...');
console.log('');
console.log('This will:');
console.log('1. Build the React app');
console.log('2. Start Electron with the new database integration');
console.log('3. Test if everything works');
console.log('');
console.log('Press Ctrl+C to stop when you see the app window.');
console.log('');

const { spawn } = require('child_process');

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command} ${args.join(' ')}`);

    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}

async function quickTest() {
  try {
    console.log('📦 Building React app...');
    await runCommand('npm', ['run', 'build']);

    console.log('🔬 Starting Electron app...');
    console.log('Look for database messages in the console!');
    console.log('');

    // This will open the app - user can close it manually
    await runCommand('npx', ['electron', 'electron/main-new.js']);

  } catch (error) {
    console.error('❌ Quick test failed:', error.message);
    console.log('');
    console.log('🔧 Try these alternatives:');
    console.log('1. npm run electron:dev-new');
    console.log('2. Check if Visual Studio Build Tools are installed');
    console.log('3. Try: npm install better-sqlite3 --build-from-source');
  }
}

quickTest();
