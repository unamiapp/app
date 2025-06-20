const { execSync } = require('child_process');
const net = require('net');

function findAvailablePort(startPort) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    
    server.on('error', () => {
      // Port is in use, try the next one
      resolve(findAvailablePort(startPort + 1));
    });
  });
}

async function startWithAvailablePort() {
  try {
    const port = await findAvailablePort(3000);
    console.log(`Starting Next.js on available port: ${port}`);
    execSync(`next dev -p ${port}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startWithAvailablePort();