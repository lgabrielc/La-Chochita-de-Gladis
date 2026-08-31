import { getSite } from "../_lib/site.js";
export async function onRequestGet(context) { if (!context.env.MEDIA_BUCKET) return Response.json({}); return Response.json(await getSite(context.env.MEDIA_BUCKET), { headers: { "Cache-Control": "no-store" } }); }
