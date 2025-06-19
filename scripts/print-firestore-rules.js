const fs = require('fs');
const path = require('path');

// Read the rules file
const rulesPath = path.join(__dirname, '..', 'firestore.rules');
const rules = fs.readFileSync(rulesPath, 'utf8');

console.log('\nFirestore rules for manual deployment:\n');
console.log('------------------------------------');
console.log(rules);
console.log('------------------------------------');
console.log('To deploy these rules:');
console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
console.log('2. Select your project: your-project');
console.log('3. Navigate to Firestore Database');
console.log('4. Click on "Rules" tab\n');
console.log('5. Copy and paste the rules above');
console.log('6. Click "Publish"');