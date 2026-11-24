const http = require('http');

const data = JSON.stringify({
  tripNumber: 'TRP-54723',
  route: 'Khandwa to Gujrat',
  startDate: '2026-09-08',
  freightAmount: 43484,
  status: 'Completed',
  vehicle: { id: 1 },
  driver: { id: 6 }
});

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/v1/fleet/trips/4',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);

  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
