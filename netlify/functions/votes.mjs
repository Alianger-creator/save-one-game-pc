// Community vote tally for Save One Game: PC Edition.
// Storage: Netlify Blobs. Each vote is its own key, so simultaneous votes never overwrite each other:
//   v/<year>/<gameId>/<voterId>  -> "1"        (one key per vote, counted by listing a year's prefix)
//   p/<voterId>/<year>           -> <gameId>   (what this browser picked, so changing a pick moves the vote)
import { getStore } from "@netlify/blobs";
import IDS from "./ids.mjs";

const VOTER = /^[A-Za-z0-9-]{16,64}$/;
const CACHE_MS = 5000;
const cache = new Map(); // year -> {at, data}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

async function tally(store, year, fresh = false) {
  const hit = cache.get(year);
  if (!fresh && hit && Date.now() - hit.at < CACHE_MS) return hit.data;
  const { blobs } = await store.list({ prefix: `v/${year}/` });
  const counts = {};
  for (const b of blobs) {
    const id = b.key.split("/")[2];
    counts[id] = (counts[id] || 0) + 1;
  }
  const data = { year, counts, total: blobs.length };
  cache.set(year, { at: Date.now(), data });
  return data;
}

export async function handle(req, store) {
  const url = new URL(req.url);
  if (req.method === "GET") {
    const year = Number(url.searchParams.get("year"));
    if (!IDS[year]) return json({ error: "bad year" }, 400);
    return json(await tally(store, year));
  }
  if (req.method === "POST") {
    let body;
    try { body = await req.json(); } catch { return json({ error: "bad json" }, 400); }
    const year = Number(body && body.year);
    const game = String(body && body.game || "");
    const voter = String(body && body.voter || "");
    if (!IDS[year] || !IDS[year].includes(game)) return json({ error: "unknown game" }, 400);
    if (!VOTER.test(voter)) return json({ error: "bad voter" }, 400);
    const pickKey = `p/${voter}/${year}`;
    const prev = await store.get(pickKey);
    if (prev !== game) {
      if (prev) await store.delete(`v/${year}/${prev}/${voter}`);
      await store.set(`v/${year}/${game}/${voter}`, "1");
      await store.set(pickKey, game);
    }
    return json(await tally(store, year, true));
  }
  return json({ error: "method not allowed" }, 405);
}

export default async (req) => handle(req, getStore({ name: "votes", consistency: "strong" }));

export const config = { path: "/api/votes" };
