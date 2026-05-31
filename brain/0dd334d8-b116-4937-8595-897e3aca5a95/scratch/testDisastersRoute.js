import http from 'http';

function testRoute() {
  http.get('http://localhost:5000/api/disasters', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log("Disasters Status Code:", res.statusCode);
      console.log("Disasters Headers:", res.headers['content-type']);
      console.log("Disasters Data:", data.substring(0, 500));
    });
  }).on('error', (err) => {
    console.error("Fetch Error:", err.message);
  });
}

testRoute();
