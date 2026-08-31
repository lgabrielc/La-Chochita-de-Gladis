import { getGallery } from "../_lib/gallery.js";

export async function onRequestGet(context) {
  if (!context.env.MEDIA_BUCKET) return Response.json({ photos: [] }, { headers: { "Cache-Control": "no-store" } });
  return Response.json({ photos: await getGallery(context.env.MEDIA_BUCKET) }, { headers: { "Cache-Control": "no-store" } });
}
