// Test script to verify admin alert creation
async function testAdminAlertCreation() {
  try {
    console.log('Testing admin alert creation...');
    
    // Sample alert data
    const alertData = {
      childId: 'CCszlVoeOhtpRbm8YWUn', // Use an existing child ID
      type: 'missing',
      description: 'Test alert from admin',
      lastSeenLocation: 'Test location',
      lastSeenWearing: 'Test clothing',
      contactInfo: '123-456-7890',
      lastSeenDate: new Date().toISOString().split('T')[0],
      lastSeenTime: new Date().toTimeString().slice(0, 5)
    };
    
    // Make the API call
    const response = await fetch('/api/alerts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alertData),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Alert created successfully:', data);
    } else {
      console.error('Failed to create alert:', data);
    }
  } catch (error) {
    console.error('Error testing alert creation:', error);
  }
}

// Run the test when the button is clicked
document.getElementById('test-button')?.addEventListener('click', testAdminAlertCreation);