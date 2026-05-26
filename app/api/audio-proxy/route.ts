import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    const range = request.headers.get("range");

    const headers: HeadersInit = {
      "User-Agent": "Mozilla/5.0",
    };

    if (range) {
      headers.Range = range;
    }

    const response = await fetch(url, {
      redirect: "follow",
      headers,
    });

    if (!response.ok || !response.body) {
      return NextResponse.json(
        { error: `Audio fetch failed: ${response.status}` },
        { status: response.status || 502 }
      );
    }

    const responseHeaders = new Headers();

    const contentType = response.headers.get("content-type") || "audio/mpeg";
    const contentLength = response.headers.get("content-length");
    const contentRange = response.headers.get("content-range");
    const acceptRanges = response.headers.get("accept-ranges");

    responseHeaders.set("Content-Type", contentType);
    responseHeaders.set("Cache-Control", "public, max-age=3600");

    if (contentLength) responseHeaders.set("Content-Length", contentLength);
    if (contentRange) responseHeaders.set("Content-Range", contentRange);
    if (acceptRanges) responseHeaders.set("Accept-Ranges", acceptRanges);
    else responseHeaders.set("Accept-Ranges", "bytes");

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Audio proxy error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
