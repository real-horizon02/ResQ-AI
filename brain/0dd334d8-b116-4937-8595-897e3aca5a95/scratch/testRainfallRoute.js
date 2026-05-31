import http from 'http';

function testRoute() {
  http.get('http://localhost:5000/api/rainfall', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log("Status Code:", res.statusCode);
      console.log("Headers:", res.headers['content-type']);
      console.log("Data:", data.substring(0, 300));
    });
  }).on('error', (err) => {
    console.error("Fetch Error:", err.message);
  });
}

testRoute();
