// Simple script to start the Next.js server on port 3000
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Next.js server on port 3000...');

// Run next dev with explicit port
const nextProcess = spawn('npx', ['next', 'dev', '-p', '3000'], {
  cwd: path.resolve(__dirname),
  stdio: 'inherit',
  env: { ...process.env, PORT: '3000' }
});

nextProcess.on('error', (err) => {
  console.error('Failed to start server:', err);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping server...');
  nextProcess.kill('SIGINT');
  process.exit(0);
});