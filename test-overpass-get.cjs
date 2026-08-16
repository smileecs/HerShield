async function test() {
  const query = `[out:json][timeout:10];(node["amenity"="police"](around:3000,28.6139,77.2090);node["amenity"="hospital"](around:3000,28.6139,77.2090););out;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  console.log('Fetching:', url);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    console.log('Status:', res.status);
    const json = await res.json();
    console.log('Response elements length:', json.elements ? json.elements.length : 0);
    if (json.elements && json.elements.length > 0) {
      console.log('Elements:', json.elements.slice(0, 5));
    }
  } catch (err) {
    console.log('Error:', err);
  }
}

test();
