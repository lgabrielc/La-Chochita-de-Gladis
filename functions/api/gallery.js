import { getGalleryState } from "../_lib/gallery.js";

export async function onRequestGet(context) {
  if (!context.env.MEDIA_BUCKET) return Response.json({ photos: [], carousel: [], hero: null }, { headers: { "Cache-Control": "no-store" } });
  const state = await getGalleryState(context.env.MEDIA_BUCKET);
  const photos = state.photos.filter((photo) => photo.active !== false);
  const byId = new Map(photos.map((photo) => [photo.id, photo]));
  const carousel = state.carousel.map((id) => byId.get(id)).filter(Boolean);
  const hero = byId.get(state.hero) || photos[0] || null;
  return Response.json({ photos, carousel, hero }, { headers: { "Cache-Control": "no-store" } });
}
