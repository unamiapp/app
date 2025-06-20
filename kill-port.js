const { execSync } = require('child_process');

try {
  console.log('Finding processes using port 3000...');
  const result = execSync('lsof -i :3000 -t').toString().trim();
  
  if (result) {
    const pids = result.split('\n');
    console.log(`Found ${pids.length} process(es) using port 3000`);
    
    pids.forEach(pid => {
      console.log(`Killing process ${pid}...`);
      try {
        execSync(`kill -9 ${pid}`);
        console.log(`Process ${pid} killed successfully`);
      } catch (error) {
        console.error(`Failed to kill process ${pid}:`, error.message);
      }
    });
    
    console.log('All processes killed. Port 3000 should now be available.');
  } else {
    console.log('No processes found using port 3000');
  }
} catch (error) {
  if (error.status === 1) {
    console.log('No processes found using port 3000');
  } else {
    console.error('Error checking port:', error.message);
  }
}