const http = require('http');

const vendors = [
  { name: 'Reliance Petrol Pump', type: 'Pump', contact: '9876543210', balance: 0 },
  { name: 'Indian Oil - Highway', type: 'Pump', contact: '9876543211', balance: 0 },
  { name: 'Bharat Petroleum City', type: 'Pump', contact: '9876543212', balance: 0 }
];

vendors.forEach(vendor => {
  const data = JSON.stringify(vendor);
  
  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/api/v1/resources/vendors',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = http.request(options, res => {
    console.log(`Added ${vendor.name} - Status: ${res.statusCode}`);
  });

  req.on('error', error => {
    console.error(`Error adding ${vendor.name}:`, error);
  });

  req.write(data);
  req.end();
});
