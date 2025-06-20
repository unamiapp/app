// Test script to verify alert creation
async function testCreateAlert() {
  try {
    console.log('Testing alert creation...');
    
    // Sample alert data
    const alertData = {
      childId: 'CCszlVoeOhtpRbm8YWUn', // Use an existing child ID
      type: 'test-alert',
      description: 'This is a test alert',
      lastSeenLocation: 'Test location',
      lastSeenWearing: 'Test clothing',
      contactInfo: '123-456-7890'
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
document.getElementById('test-button')?.addEventListener('click', testCreateAlert);