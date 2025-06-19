#!/usr/bin/env node

// Test script to verify API endpoints
const { spawn } = require('child_process');

console.log('Testing API endpoints...');

// Start the dev server
console.log('Starting development server...');
const devServer = spawn('npm', ['run', 'dev'], {
  cwd: process.cwd(),
  stdio: 'pipe'
});

let serverReady = false;

devServer.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('Server output:', output);
  
  if (output.includes('Ready') || output.includes('localhost:3000')) {
    serverReady = true;
    console.log('Server is ready!');
    testEndpoints();
  }
});

devServer.stderr.on('data', (data) => {
  const error = data.toString();
  console.error('Server error:', error);
  
  if (error.includes('Error') || error.includes('Failed')) {
    console.error('Server failed to start properly');
    process.exit(1);
  }
});

async function testEndpoints() {
  // Wait a bit for server to be fully ready
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    console.log('Testing admin-sdk check endpoint...');
    
    const response = await fetch('http://localhost:3000/api/admin-sdk/check');
    console.log('Check endpoint status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Check endpoint response:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('Check endpoint error:', errorText);
    }
    
  } catch (error) {
    console.error('Error testing endpoints:', error);
  } finally {
    // Kill the dev server
    devServer.kill();
    process.exit(0);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('Terminating...');
  devServer.kill();
  process.exit(0);
});