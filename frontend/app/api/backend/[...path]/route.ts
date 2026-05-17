import { NextRequest } from "next/server";

const DEFAULT_BACKEND_CANDIDATES = [
  process.env.BACKEND_API_URL,
  process.env.NEXT_PUBLIC_API_URL,
  "http://127.0.0.1:8000",
  "http://localhost:8000",
  "http://127.0.0.1:8001",
  "http://localhost:8001",
].filter(Boolean) as string[];

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const pathname = path.join("/");
  const query = request.nextUrl.search;
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  let lastError: unknown;
  let lastUpstream: Response | null = null;

  for (const baseUrl of DEFAULT_BACKEND_CANDIDATES) {
    const target = `${baseUrl.replace(/\/$/, "")}/${pathname}${query}`;
    try {
      const upstream = await fetch(target, {
        method: request.method,
        headers: {
          "Content-Type": request.headers.get("content-type") || "application/json",
        },
        body,
        cache: "no-store",
      });

      if (upstream.status >= 500) {
        lastError = new Error(`Upstream ${upstream.status} from ${baseUrl}`);
        lastUpstream = upstream;
        continue;
      }

      const responseHeaders = new Headers();
      const contentType = upstream.headers.get("content-type");
      if (contentType) {
        responseHeaders.set("content-type", contentType);
      }

      return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders,
      });
    } catch (error) {
      lastError = error;
    }
  }

  if (lastUpstream) {
    const responseHeaders = new Headers();
    const contentType = lastUpstream.headers.get("content-type");
    if (contentType) {
      responseHeaders.set("content-type", contentType);
    }
    return new Response(lastUpstream.body, {
      status: lastUpstream.status,
      statusText: lastUpstream.statusText,
      headers: responseHeaders,
    });
  }

  return Response.json(
    {
      error: "Backend unavailable",
      detail: lastError instanceof Error ? lastError.message : "No backend responded.",
      tried: DEFAULT_BACKEND_CANDIDATES,
    },
    { status: 502 },
  );
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context);
}
