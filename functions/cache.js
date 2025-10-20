export async function onRequest({ request, params }) {
  const { number } = params; // Extract the 'number' parameter from the URL

  // Ensure that the 'number' parameter is valid
  if (!number || isNaN(number)) {
    return new Response('Invalid number', { status: 400 });
  }

  // Define a cache key based on the 'number' (the URL itself can be the cache key)
  const cacheKey = new URL(request.url).toString();

  // Try to fetch the cached response from Cloudflare's edge cache
  const cache = caches.default; // Cloudflare cache API
  let response = await cache.match(cacheKey); // Check if the content is cached

  if (!response) {
    // If no cache hit, generate a new response (e.g., simulate processing)
    response = new Response(JSON.stringify({ message: `Handling cache for ${number}` }), {
      headers: { 'Content-Type': 'application/json' },
    });

    // Add cache-control headers to indicate how long to cache the response
    // Cache for 1 hour, and allow public caching by Cloudflare CDN
    response = new Response(response.body, response);
    response.headers.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    // Store the response in the Cloudflare cache for future requests
    event.waitUntil(cache.put(cacheKey, response.clone()));
  }

  // Return the cached or newly generated response
  return response;
}
