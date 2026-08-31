export const DEFAULT_GALLERY = [
  ["img1.jpeg", "Casa de campo"], ["img2.jpeg", "Terraza"], ["img3.jpeg", "Sala"],
  ["img4.jpeg", "Sala"], ["img5.jpeg", "Juegos"], ["img6.jpeg", "Habitación"],
  ["img7.jpeg", "Mascota"], ["img8.jpeg", "Juegos niños"], ["img9.jpeg", "Piscina y vista"],
  ["img10.jpeg", "Piscina y vista"], ["img11.jpeg", "Piscina y vista"],
].map(([url, alt], index) => ({ id: `legacy-${index + 1}`, url: `/${url}`, alt, active: true }));

export function defaultGalleryState() {
  return { photos: DEFAULT_GALLERY, carousel: DEFAULT_GALLERY.map((photo) => photo.id), hero: DEFAULT_GALLERY[0].id };
}

export async function getGalleryState(bucket) {
  const object = await bucket.get("gallery.json");
  if (!object) return defaultGalleryState();
  try {
    const data = await object.json();
    if (!Array.isArray(data.photos)) return defaultGalleryState();
    const ids = new Set(data.photos.map((photo) => photo.id));
    const carousel = Array.isArray(data.carousel) ? data.carousel.filter((id) => ids.has(id)) : data.photos.map((photo) => photo.id);
    const hero = ids.has(data.hero) ? data.hero : data.photos.find((photo) => photo.active !== false)?.id || null;
    return { photos: data.photos, carousel, hero };
  } catch { return defaultGalleryState(); }
}

export function saveGalleryState(bucket, state) {
  return bucket.put("gallery.json", JSON.stringify(state), { httpMetadata: { contentType: "application/json; charset=utf-8" } });
}

export function isPhoto(photo) {
  return photo && typeof photo.id === "string" && typeof photo.alt === "string" &&
    (photo.active === undefined || typeof photo.active === "boolean") &&
    ((typeof photo.url === "string" && photo.url.startsWith("/")) || (typeof photo.key === "string" && photo.key.startsWith("photos/")));
}
