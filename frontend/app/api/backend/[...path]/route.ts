import { NextRequest } from "next/server";

const DEFAULT_BACKEND_CANDIDATES = [
  process.env.BACKEND_API_URL,
  process.env.NEXT_PUBLIC_API_URL,
  "http://127.0.0.1:8000",
  "http://localhost:8000",
  "http://127.0.0.1:8001",
  "http://localhost:8001",
].filter(Boolean) as string[];

const REQUIRED_FEATURES = ["persona_prompt", "voice_synthesize"];

type BufferedUpstream = {
  status: number;
  statusText: string;
  contentType: string | null;
  body: ArrayBuffer;
};

let cachedCapableBackend: string | null = null;

async function bufferUpstreamResponse(upstream: Response): Promise<BufferedUpstream> {
  return {
    status: upstream.status,
    statusText: upstream.statusText,
    contentType: upstream.headers.get("content-type"),
    body: await upstream.arrayBuffer(),
  };
}

function responseFromBuffered(buffered: BufferedUpstream): Response {
  const responseHeaders = new Headers();
  if (buffered.contentType) {
    responseHeaders.set("content-type", buffered.contentType);
  }
  return new Response(buffered.body, {
    status: buffered.status,
    statusText: buffered.statusText,
    headers: responseHeaders,
  });
}

function normalizeBase(url: string) {
  return url.replace(/\/$/, "");
}

async function backendHasRequiredFeatures(baseUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${normalizeBase(baseUrl)}/health`, { cache: "no-store" });
    if (!res.ok) return false;
    const data = (await res.json()) as { features?: string[] };
    const features = data.features ?? [];
    return REQUIRED_FEATURES.every((feature) => features.includes(feature));
  } catch {
    return false;
  }
}

async function orderedBackends(): Promise<string[]> {
  if (cachedCapableBackend) {
    return [
      cachedCapableBackend,
      ...DEFAULT_BACKEND_CANDIDATES.map(normalizeBase).filter((url) => url !== cachedCapableBackend),
    ];
  }

  for (const baseUrl of DEFAULT_BACKEND_CANDIDATES) {
    const normalized = normalizeBase(baseUrl);
    if (await backendHasRequiredFeatures(normalized)) {
      cachedCapableBackend = normalized;
      return [
        normalized,
        ...DEFAULT_BACKEND_CANDIDATES.map(normalizeBase).filter((url) => url !== normalized),
      ];
    }
  }

  return DEFAULT_BACKEND_CANDIDATES.map(normalizeBase);
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const pathname = path.join("/");
  const query = request.nextUrl.search;
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  let lastError: unknown;
  let lastUpstream: BufferedUpstream | null = null;

  for (const baseUrl of await orderedBackends()) {
    const target = `${baseUrl}/${pathname}${query}`;
    try {
      const upstream = await fetch(target, {
        method: request.method,
        headers: {
          "Content-Type": request.headers.get("content-type") || "application/json",
        },
        body,
        cache: "no-store",
      });

      const buffered = await bufferUpstreamResponse(upstream);

      if (upstream.ok) {
        return responseFromBuffered(buffered);
      }

      lastUpstream = buffered;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastUpstream) {
    return responseFromBuffered(lastUpstream);
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
