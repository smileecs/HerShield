async function test() {
  const lat = 28.6139;
  const lng = 77.2090;

  let queryBody = '';
  queryBody += `nwr["amenity"="police"](around:2000,${lat},${lng});`;
  queryBody += `nwr["amenity"~"hospital|pharmacy"](around:1500,${lat},${lng});`;
  queryBody += `nwr["railway"~"station|subway_entrance"](around:1200,${lat},${lng});`;
  queryBody += `nwr["amenity"="bus_station"](around:1200,${lat},${lng});`;
  queryBody += `nwr["shop"~"convenience|supermarket"](around:1000,${lat},${lng});`;

  const overpassQuery = `[out:json][timeout:15];(${queryBody});out center;`;
  console.log('Query:', overpassQuery);

  const OVERPASS_SERVERS = [
    'https://overpass-api.de/api/interpreter',
    'https://lz4.overpass-api.de/api/interpreter',
    'https://z.overpass-api.de/api/interpreter'
  ];

  for (const url of OVERPASS_SERVERS) {
    try {
      console.log('Trying server:', url);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(overpassQuery)}`
      });
      console.log('Status:', res.status);
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        console.log('Success! Number of elements:', json.elements ? json.elements.length : 0);
        if (json.elements && json.elements.length > 0) {
          console.log('First 3 elements:', json.elements.slice(0, 3));
        }
      } catch (e) {
        console.log('Response text:', text.slice(0, 500));
      }
    } catch (err) {
      console.log('Error on', url, err.message);
    }
  }
}

test();
