import { getStore } from "@netlify/blobs";
export default async (req) => {
  const k = new URL(req.url).searchParams.get("k") || "";
  if (!/^[a-f0-9]{64}$/.test(k)) return new Response("bad key", { status: 400 });
  const store = getStore("mission-control");
  if (req.method === "GET") {
    const v = await store.get(k);
    return v === null
      ? new Response("none", { status: 404 })
      : new Response(v, { headers: { "content-type": "application/json", "cache-control": "no-store" } });
  }
  if (req.method === "PUT") {
    const body = await req.text();
    if (body.length > 900000) return new Response("too big", { status: 413 });
    try { const o = JSON.parse(body); if (o.v !== 1) throw 0; } catch { return new Response("bad data", { status: 400 }); }
    await store.set(k, body);
    return new Response("ok");
  }
  return new Response("method not allowed", { status: 405 });
};
export const config = { path: "/api/sync" };
