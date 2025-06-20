// Simple script to check if a port is in use
const http = require('http');

const port = process.env.PORT || 3002;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Port check successful');
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Close the server after 5 seconds
setTimeout(() => {
  server.close(() => {
    console.log(`Server on port ${port} closed`);
  });
}, 5000);