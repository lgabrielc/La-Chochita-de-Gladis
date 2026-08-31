import { getGalleryState, isPhoto, saveGalleryState } from "../../_lib/gallery.js";

const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const TYPES = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"]]);
const json = (data, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

function authorized(request, env) {
  if (!env.ADMIN_PASSWORD) return false;
  return request.headers.get("X-Admin-Password") === env.ADMIN_PASSWORD;
}

function unauthorized() {
  return json({ error: "Contraseña incorrecta o secreto no configurado." }, 401);
}

export async function onRequest(context) {
  const { request, env } = context;
  if (!env.MEDIA_BUCKET) return json({ error: "Falta enlazar el bucket R2." }, 503);
  if (!authorized(request, env)) return unauthorized();
  const path = new URL(request.url).pathname.replace("/api/admin", "") || "/";
  const bucket = env.MEDIA_BUCKET;

  if (request.method === "GET" && path === "/gallery") return json(await getGalleryState(bucket));

  if (request.method === "POST" && path === "/upload") {
    const form = await request.formData();
    const photo = form.get("photo");
    if (!photo || typeof photo.arrayBuffer !== "function") return json({ error: "Elige una foto." }, 400);
    if (!TYPES.has(photo.type)) return json({ error: "Usa una imagen JPG, PNG o WebP." }, 400);
    if (photo.size > MAX_IMAGE_BYTES) return json({ error: "Cada foto puede pesar como máximo 12 MB." }, 400);
    const key = `photos/${crypto.randomUUID()}.${TYPES.get(photo.type)}`;
    await bucket.put(key, await photo.arrayBuffer(), { httpMetadata: { contentType: photo.type } });
    const state = await getGalleryState(bucket);
    const newPhoto = { id: crypto.randomUUID(), key, alt: photo.name.replace(/\.[^.]+$/, "") || "Foto de La Chocita", active: true };
    state.photos.push(newPhoto);
    await saveGalleryState(bucket, state);
    return json({ ...state, photo: newPhoto }, 201);
  }

  if (request.method === "PUT" && path === "/gallery") {
    const body = await request.json().catch(() => null);
    if (!body || !Array.isArray(body.photos) || !body.photos.every(isPhoto)) return json({ error: "La galería no es válida." }, 400);
    const state = await getGalleryState(bucket);
    state.photos = body.photos;
    state.carousel = state.carousel.filter((id) => state.photos.some((photo) => photo.id === id && photo.active !== false));
    if (!state.photos.some((photo) => photo.id === state.hero && photo.active !== false)) state.hero = state.photos.find((photo) => photo.active !== false)?.id || null;
    await saveGalleryState(bucket, state);
    return json(state);
  }

  if (request.method === "PATCH" && path === "/photo") {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.id !== "string" || typeof body.active !== "boolean") return json({ error: "Foto no válida." }, 400);
    const state = await getGalleryState(bucket);
    const photo = state.photos.find((item) => item.id === body.id);
    if (!photo) return json({ error: "Foto no encontrada." }, 404);
    photo.active = body.active;
    if (state.hero === photo.id && !photo.active) state.hero = state.photos.find((item) => item.active !== false)?.id || null;
    if (!photo.active) state.carousel = state.carousel.filter((id) => id !== photo.id);
    await saveGalleryState(bucket, state);
    return json(state);
  }

  if (request.method === "PUT" && path === "/carousel") {
    const body = await request.json().catch(() => null);
    const state = await getGalleryState(bucket);
    const carousel = Array.isArray(body) ? body : body?.carousel;
    if (!Array.isArray(carousel) || !carousel.every((id) => typeof id === "string" && id.length > 0 && id.length < 200)) return json({ error: "Carrusel no válido." }, 400);
    const activeIds = new Set(state.photos.filter((photo) => photo.active !== false).map((photo) => photo.id));
    state.carousel = [...new Set(carousel.filter((id) => activeIds.has(id)))];
    await saveGalleryState(bucket, state);
    return json(state);
  }

  if (request.method === "PUT" && path === "/hero") {
    const body = await request.json().catch(() => null);
    const state = await getGalleryState(bucket);
    if (!body || typeof body.hero !== "string" || !state.photos.some((photo) => photo.id === body.hero && photo.active !== false)) return json({ error: "Portada no válida." }, 400);
    state.hero = body.hero;
    await saveGalleryState(bucket, state);
    return json(state);
  }
  return json({ error: "Ruta no encontrada." }, 404);
}
