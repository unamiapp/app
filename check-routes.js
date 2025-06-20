const http = require('http');

const routes = [
  '/dashboard/parent/children',
  '/dashboard/parent/alerts',
  '/dashboard/parent/report',
  '/dashboard/admin/users'
];

const options = {
  hostname: 'localhost',
  port: 3002,
  method: 'GET'
};

routes.forEach(route => {
  const req = http.request({
    ...options,
    path: route
  }, res => {
    console.log(`${route}: ${res.statusCode}`);
  });

  req.on('error', error => {
    console.error(`Error checking ${route}:`, error.message);
  });

  req.end();
});