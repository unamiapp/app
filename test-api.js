#!/usr/bin/env node

// Simple test script to verify API endpoints
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing API endpoints...');
    
    // Test the admin-sdk check endpoint
    const checkResponse = await fetch('http://localhost:3000/api/admin-sdk/check');
    console.log('Check endpoint status:', checkResponse.status);
    
    if (checkResponse.ok) {
      const checkData = await checkResponse.json();
      console.log('Check endpoint response:', checkData);
    } else {
      console.log('Check endpoint failed:', await checkResponse.text());
    }
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAPI();