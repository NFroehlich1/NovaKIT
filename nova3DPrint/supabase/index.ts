import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const MESHY_API_KEY = Deno.env.get("Meshy");
const MESHY_API_URL = "https://api.meshy.ai/v2/text-to-3d";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};
// Utility to handle preflight requests
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") return handleOptions();
  const url = new URL(req.url);
  // POST: create a new Meshy task
  if (req.method === "POST") {
    try {
      const requestBody = await req.json();
      const response = await fetch(MESHY_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${MESHY_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: CORS_HEADERS
      });
    } catch (error) {
      return new Response(JSON.stringify({
        error: error.message
      }), {
        status: 500,
        headers: CORS_HEADERS
      });
    }
  }
  // GET: fetch task status OR proxy Meshy asset
  if (req.method === "GET") {
    const pathSegments = url.pathname.split("/").filter(Boolean);
    // If last segment is a Meshy asset URL param, proxy it
    const assetUrl = url.searchParams.get("asset_url");
    if (assetUrl) {
      try {
        const response = await fetch(assetUrl);
        const arrayBuffer = await response.arrayBuffer();
        const contentType = response.headers.get("content-type") || "application/octet-stream";
        return new Response(arrayBuffer, {
          headers: {
            "Content-Type": contentType,
            ...CORS_HEADERS
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          error: error.message
        }), {
          status: 500,
          headers: CORS_HEADERS
        });
      }
    }
    // Otherwise, treat as task status request
    const taskId = pathSegments.pop();
    if (!taskId) {
      return new Response(JSON.stringify({
        error: "Task ID is required"
      }), {
        status: 400,
        headers: CORS_HEADERS
      });
    }
    try {
      const response = await fetch(`${MESHY_API_URL}/${taskId}`, {
        headers: {
          "Authorization": `Bearer ${MESHY_API_KEY}`
        }
      });
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: CORS_HEADERS
      });
    } catch (error) {
      return new Response(JSON.stringify({
        error: error.message
      }), {
        status: 500,
        headers: CORS_HEADERS
      });
    }
  }
  return new Response(JSON.stringify({
    message: "Method not allowed"
  }), {
    status: 405,
    headers: CORS_HEADERS
  });
});
