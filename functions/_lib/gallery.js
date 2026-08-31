export const DEFAULT_GALLERY = [
  ["img1.jpeg", "Casa de campo"], ["img2.jpeg", "Terraza"], ["img3.jpeg", "Sala"],
  ["img4.jpeg", "Sala"], ["img5.jpeg", "Juegos"], ["img6.jpeg", "Habitación"],
  ["img7.jpeg", "Mascota"], ["img8.jpeg", "Juegos niños"], ["img9.jpeg", "Piscina y vista"],
  ["img10.jpeg", "Piscina y vista"], ["img11.jpeg", "Piscina y vista"],
].map(([url, alt], index) => ({ id: `legacy-${index + 1}`, url: `/${url}`, alt, active: true }));

export async function getGallery(bucket) {
  const object = await bucket.get("gallery.json");
  if (!object) return DEFAULT_GALLERY;
  try { const data = await object.json(); return Array.isArray(data.photos) ? data.photos : DEFAULT_GALLERY; }
  catch { return DEFAULT_GALLERY; }
}

export function saveGallery(bucket, photos) {
  return bucket.put("gallery.json", JSON.stringify({ photos }), { httpMetadata: { contentType: "application/json; charset=utf-8" } });
}

export function isPhoto(photo) {
  return photo && typeof photo.id === "string" && typeof photo.alt === "string" &&
    (photo.active === undefined || typeof photo.active === "boolean") &&
    ((typeof photo.url === "string" && photo.url.startsWith("/")) || (typeof photo.key === "string" && photo.key.startsWith("photos/")));
}
