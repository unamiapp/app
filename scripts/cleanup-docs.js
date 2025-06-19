// Script to clean up duplicate documentation files
const fs = require('fs');
const path = require('path');

// Files to keep
const filesToKeep = [
  'PROJECT_DOCUMENTATION.md',
  'IMPLEMENTATION_SUMMARY_UPDATED.md',
  'README.md'
];

// Files to remove (these are duplicates or outdated)
const filesToRemove = [
  'DASHBOARD_ARCHITECTURE.md',
  'DASHBOARD_CRUD_GUIDE.md',
  'DASHBOARD_IMPROVEMENTS.md',
  'FIREBASE_DEPLOYMENT_GUIDE.md',
  'FIREBASE_SECURITY_REPORT.md',
  'FIREBASE_SETUP.md',
  'FIRESTORE_SCHEMA_UPDATE.md',
  'HOLISTIC_ASSESSMENT.md',
  'HOLISTIC_FIXES.md',
  'IMPLEMENTATION_GUIDE.md',
  'IMPLEMENTATION_PLAN.md',
  'IMPLEMENTATION_SUMMARY.md',
  'NEXT_STEPS_IMPLEMENTATION.md',
  'NEXT_STEPS.md',
  'PRODUCTION_DEPLOYMENT_CHECKLIST.md',
  'PRODUCTION_READINESS_REPORT.md',
  'PROJECT_STATUS.md',
  'readme1.md',
  'SECURITY_IMPLEMENTATION.md',
  'STORAGE_RULES_FIX.md',
  'TEST_ACCOUNTS.md',
  'VERIFYME.md'
];

// Function to archive files
function archiveFiles() {
  // Create archive directory if it doesn't exist
  const archiveDir = path.join(process.cwd(), 'docs-archive');
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir);
  }
  
  console.log('Archiving duplicate documentation files...');
  
  // Move files to archive
  filesToRemove.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    const archivePath = path.join(archiveDir, file);
    
    if (fs.existsSync(filePath)) {
      try {
        // Copy to archive
        fs.copyFileSync(filePath, archivePath);
        console.log(`Archived: ${file}`);
        
        // Delete original
        fs.unlinkSync(filePath);
        console.log(`Removed: ${file}`);
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    } else {
      console.log(`File not found: ${file}`);
    }
  });
  
  console.log('Documentation cleanup completed!');
}

// Run the archive function
archiveFiles();