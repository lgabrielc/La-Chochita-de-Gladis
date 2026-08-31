export const DEFAULT_SITE = {
  seoTitle: "La Chocita de Gladis - Casa de Campo",
  seoDescription: "Casa de campo privada en Larancocha, Santa Rosa de Quives. Piscina, parrilla, juegos y más. Pet friendly.",
  title: "La Chocita de Gladis",
  subtitle: "Casa de Campo privada en Larancocha, Santa Rosa de Quives",
  welcomeTitle: "¡Escápate al corazón de la naturaleza!",
  welcomeText: "Disfruta de una experiencia única en nuestra casa de campo privada, rodeada de montañas, aire puro, piscina y espacios para toda la familia. Relájate, celebra y explora lo mejor de Santa Rosa de Quives, a solo 1 hora de Lima.",
  whatsapp: "51990422342", checkIn: "8:00 a.m.", checkOut: "6:00 p.m.",
  weekday: ["S/ 500", "S/ 700", "S/ 800"], weekend: ["S/ 700", "S/ 900", "S/ 1100"],
  facebook: "https://www.facebook.com/profile.php?id=61564052660386&locale=es_LA", tiktok: "https://www.tiktok.com/@lachocitadegladis?lang=jv-ID",
  payments: ["Cuenta BCP Soles: 00219110426567506150", "CCI: 1910426567506150", "Yape/Plin: 902 363 083", "Titular: Jesús Gladis Enciso Ahuanari"],
  terms: ["Reserva con 50% (no se aceptan cancelaciones el mismo día).", "Cambios de fecha solo con 7 días de anticipación.", "No se realizan devoluciones de dinero.", "El cliente es responsable de daños o pérdidas.", "Ofertas válidas solo en fechas indicadas.", "Coordinación previa para videollamada o visita."],
};
export async function getSite(bucket) { const object = await bucket.get("site.json"); if (!object) return DEFAULT_SITE; try { return { ...DEFAULT_SITE, ...(await object.json()) }; } catch { return DEFAULT_SITE; } }
export function saveSite(bucket, site) { return bucket.put("site.json", JSON.stringify(site), { httpMetadata: { contentType: "application/json; charset=utf-8" } }); }
