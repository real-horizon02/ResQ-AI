import https from 'https';

const apiKey = '72abd696700e634b6d9eb1caaf534ea3';

function getUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    }).on('error', reject);
  });
}

async function test() {
  console.log("Testing 3.0 OneCall API...");
  try {
    const url3 = `https://api.openweathermap.org/data/3.0/onecall?lat=19.07&lon=72.87&exclude=minutely,daily&units=metric&appid=${apiKey}`;
    const res3 = await getUrl(url3);
    console.log("3.0 OneCall Status:", res3.status);
    console.log("3.0 OneCall Data:", JSON.stringify(res3.data).substring(0, 200));
  } catch (err) {
    console.error("3.0 OneCall Failed:", err.message);
  }

  console.log("\nTesting 2.5 Weather API...");
  try {
    const url2 = `https://api.openweathermap.org/data/2.5/weather?lat=19.07&lon=72.87&units=metric&appid=${apiKey}`;
    const res2 = await getUrl(url2);
    console.log("2.5 Weather Status:", res2.status);
    console.log("2.5 Weather Data:", JSON.stringify(res2.data).substring(0, 200));
  } catch (err) {
    console.error("2.5 Weather Failed:", err.message);
  }
}

test();
