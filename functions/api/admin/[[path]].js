import { getGallery, isPhoto, saveGallery } from "../../_lib/gallery.js";

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const TYPES = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"]]);
const json = (data, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

function authorized(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  const value = request.headers.get("Authorization") || "";
  if (!value.startsWith("Basic ")) return false;
  try { return atob(value.slice(6)).split(":").slice(1).join(":") === env.ADMIN_PASSWORD; }
  catch { return false; }
}

function unauthorized() {
  return new Response("No autorizado", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Galería privada"' } });
}

export async function onRequest(context) {
  const { request, env } = context;
  if (!env.MEDIA_BUCKET) return json({ error: "Falta enlazar el bucket R2." }, 503);
  if (!authorized(request, env)) return unauthorized();
  const path = new URL(request.url).pathname.replace("/api/admin", "") || "/";
  const bucket = env.MEDIA_BUCKET;

  if (request.method === "GET" && path === "/gallery") return json({ photos: await getGallery(bucket) });

  if (request.method === "POST" && path === "/upload") {
    const form = await request.formData();
    const photo = form.get("photo");
    if (!photo || typeof photo.arrayBuffer !== "function") return json({ error: "Elige una foto." }, 400);
    if (!TYPES.has(photo.type)) return json({ error: "Usa una imagen JPG, PNG o WebP." }, 400);
    if (photo.size > MAX_IMAGE_BYTES) return json({ error: "Cada foto puede pesar como máximo 12 MB." }, 400);
    const key = `photos/${crypto.randomUUID()}.${TYPES.get(photo.type)}`;
    await bucket.put(key, await photo.arrayBuffer(), { httpMetadata: { contentType: photo.type } });
    const photos = await getGallery(bucket);
    const newPhoto = { id: crypto.randomUUID(), key, alt: photo.name.replace(/\.[^.]+$/, "") || "Foto de La Chocita" };
    photos.push(newPhoto);
    await saveGallery(bucket, photos);
    return json({ photos, photo: newPhoto }, 201);
  }

  if (request.method === "PUT" && path === "/gallery") {
    const body = await request.json().catch(() => null);
    if (!body || !Array.isArray(body.photos) || !body.photos.every(isPhoto)) return json({ error: "La galería no es válida." }, 400);
    await saveGallery(bucket, body.photos);
    return json({ photos: body.photos });
  }

  if (request.method === "DELETE" && path === "/photo") {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.id !== "string") return json({ error: "Foto no válida." }, 400);
    const photos = await getGallery(bucket);
    const photo = photos.find((item) => item.id === body.id);
    if (!photo) return json({ error: "Foto no encontrada." }, 404);
    if (photo.key) await bucket.delete(photo.key);
    const nextPhotos = photos.filter((item) => item.id !== body.id);
    await saveGallery(bucket, nextPhotos);
    return json({ photos: nextPhotos });
  }
  return json({ error: "Ruta no encontrada." }, 404);
}
