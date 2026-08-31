import { getGallery } from "../_lib/gallery.js";

export async function onRequestGet(context) {
  if (!context.env.MEDIA_BUCKET) return Response.json({ photos: [] }, { headers: { "Cache-Control": "no-store" } });
  const photos = await getGallery(context.env.MEDIA_BUCKET);
  return Response.json({ photos: photos.filter((photo) => photo.active !== false) }, { headers: { "Cache-Control": "no-store" } });
}
