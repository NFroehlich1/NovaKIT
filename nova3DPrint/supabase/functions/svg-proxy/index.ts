import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SVGIO_API_KEY = Deno.env.get("SVGIO_API_KEY");
const SVGIO_API_URL = "https://api.svg.io/v1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const { pathname } = url;

  // Handle image generation
  if (pathname.endsWith("/generate-image") && req.method === "POST") {
    try {
      const requestBody = await req.json();
      const response = await fetch(`${SVGIO_API_URL}/generate-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SVGIO_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status
      });
    } catch (e) {
      const error = e as Error;
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // Handle getting image details (which includes polling)
  if (pathname.includes("/get-image/") && req.method === "GET") {
    const imageId = pathname.split('/').pop();
    if (!imageId) {
      return new Response(JSON.stringify({ error: "Image ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    try {
      const response = await fetch(`${SVGIO_API_URL}/get-image/${imageId}`, {
        headers: { 'Authorization': `Bearer ${SVGIO_API_KEY}` }
      });
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status
      });
    } catch (e) {
      const error = e as Error;
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
  
    // Handle asset proxying for downloads
  const assetUrl = url.searchParams.get("asset_url");
  if (req.method === "GET" && assetUrl) {
    try {
      const assetResponse = await fetch(assetUrl);
      if (!assetResponse.ok) {
        throw new Error(`Failed to fetch asset: ${assetResponse.statusText}`);
      }
      
      const headers = new Headers(assetResponse.headers);
      const extension = new URL(assetUrl).pathname.split('.').pop() || 'svg';
      headers.set("Content-Disposition", `attachment; filename="generated-image.${extension}"`);
      
      // Add CORS headers to the asset response
      for (const [key, value] of Object.entries(corsHeaders)) {
        headers.set(key, value);
      }

      return new Response(assetResponse.body, {
        headers: headers,
        status: assetResponse.status,
      });
    } catch (e) {
      const error = e as Error;
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }


  return new Response(JSON.stringify({ message: "Route not found or method not allowed" }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});
