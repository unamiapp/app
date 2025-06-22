// Add this script to the login page to debug the login button issue
console.log('Login page debug script loaded');

// Monitor click events on the login button
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, looking for login form');
  
  // Wait a bit for React to render
  setTimeout(() => {
    const loginForm = document.querySelector('form');
    if (loginForm) {
      console.log('Login form found, adding debug listener');
      
      loginForm.addEventListener('submit', (event) => {
        console.log('Login form submitted');
        console.log('Form data:', {
          email: loginForm.querySelector('input[type="email"]')?.value || 'No email found',
          password: loginForm.querySelector('input[type="password"]') ? 'Password entered' : 'No password found',
          role: loginForm.querySelector('input[name="role"]')?.value || 'No role found'
        });
      });
      
      // Debug role buttons
      const roleButtons = document.querySelectorAll('button[type="button"]');
      roleButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          console.log('Role button clicked:', button.textContent);
        });
      });
    } else {
      console.log('Login form not found');
    }
  }, 1000);
});

// Monitor network requests
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('Fetch request:', args[0]);
  return originalFetch.apply(this, args)
    .then(response => {
      console.log('Fetch response:', response.url, response.status);
      return response;
    })
    .catch(error => {
      console.error('Fetch error:', error);
      throw error;
    });
};

// Monitor Firebase auth
if (window.firebase) {
  console.log('Firebase detected on window object');
} else {
  console.log('Firebase not detected on window object');
}