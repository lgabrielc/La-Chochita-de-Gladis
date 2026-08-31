export async function onRequestGet(context) {
  const key = Array.isArray(context.params.key) ? context.params.key.join("/") : context.params.key;
  if (!key || !key.startsWith("photos/") || !context.env.MEDIA_BUCKET) return new Response("No encontrado", { status: 404 });
  const object = await context.env.MEDIA_BUCKET.get(key);
  if (!object) return new Response("No encontrado", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
}
