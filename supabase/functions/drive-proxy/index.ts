// drive-proxy: streams Google Drive videos with correct CORS + range headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  "Access-Control-Expose-Headers": "Content-Type, Content-Length, Content-Range, Accept-Ranges",
};

function getFileId(url: string): string | null {
  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/,
    /docs\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
    /^[a-zA-Z0-9_-]{20,}$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const fileId = url.searchParams.get("id");
  const videoUrl = url.searchParams.get("url");

  if (!fileId && !videoUrl) {
    return new Response(JSON.stringify({ error: "Missing 'id' or 'url' parameter" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let id = fileId;
  if (!id && videoUrl) {
    id = getFileId(videoUrl);
  }
  if (!id) {
    return new Response(JSON.stringify({ error: "Could not extract file ID" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const driveUrl = `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`;

  try {
    const range = req.headers.get("range");
    const fetchHeaders: Record<string, string> = {};
    if (range) {
      fetchHeaders["Range"] = range;
    }

    const driveRes = await fetch(driveUrl, { headers: fetchHeaders });

    if (!driveRes.ok) {
      return new Response(JSON.stringify({ error: `Drive returned ${driveRes.status}` }), {
        status: driveRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const responseHeaders = new Headers(corsHeaders);
    responseHeaders.set("Content-Type", "video/mp4");
    responseHeaders.set("Accept-Ranges", "bytes");

    const contentRange = driveRes.headers.get("content-range");
    const contentLength = driveRes.headers.get("content-length");
    if (contentRange) responseHeaders.set("Content-Range", contentRange);
    if (contentLength) responseHeaders.set("Content-Length", contentLength);

    if (driveRes.status === 206) {
      return new Response(driveRes.body, { status: 206, headers: responseHeaders });
    }

    return new Response(driveRes.body, { status: 200, headers: responseHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Fetch failed", details: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
