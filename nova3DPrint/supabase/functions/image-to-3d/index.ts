import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const MESHY_API_KEY = Deno.env.get('Meshy');
const MESHY_API_URL = 'https://api.meshy.ai/v1/image-to-3d';

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

function handleOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return handleOptions();
  const url = new URL(req.url);

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
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: (error as Error).message }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }
  }

  if (req.method === "GET") {
    const pathSegments = url.pathname.split("/").filter(Boolean);
    const taskId = pathSegments.pop();
    if (!taskId) {
      return new Response(JSON.stringify({ error: "Task ID is required" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }
    try {
      // Try the image-to-3d status endpoint first; if not available, fall back to generic tasks endpoint
      let response = await fetch(`${MESHY_API_URL}/${taskId}`, {
        headers: { "Authorization": `Bearer ${MESHY_API_KEY}` }
      });
      if (!response.ok) {
        response = await fetch(`https://api.meshy.ai/v1/tasks/${taskId}`, {
          headers: { "Authorization": `Bearer ${MESHY_API_KEY}` }
        });
      }
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: (error as Error).message }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }
  }

  return new Response(JSON.stringify({ message: "Method not allowed" }), {
    status: 405,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
  });
});


