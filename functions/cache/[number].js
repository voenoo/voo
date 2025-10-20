export async function onRequest({ request, params }) {
  const { number } = params;  // Access the dynamic 'number' parameter from the URL

  // Ensure the 'number' is valid
  if (!number || isNaN(number)) {
    return new Response('Invalid number', { status: 400 });
  }

  // Create a cache key based on the full URL (this includes the dynamic 'number' part)
  const cacheKey = new URL(request.url).toString();
  const cache = caches.default; // Cloudflare cache API
  let response = await cache.match(cacheKey); // Check if the content is cached

  if (!response) {
    // If no cache hit, generate a new response
    response = new Response(JSON.stringify({ message: `Handling cache for ${number}` }), {
      headers: { 'Content-Type': 'application/json' },
    });

    // Add Cache-Control headers to allow Cloudflare CDN to cache the response
    response = new Response(response.body, response);
    response.headers.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    // Store the response in the Cloudflare cache for future requests
    event.waitUntil(cache.put(cacheKey, response.clone()));
  }

  // Return the cached or newly generated response
  return response;
}
