import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { readFileSync } from "fs";
const app = express();
app.use(cors({ origin: "*" }));
app.get("/", (_, res) => res.sendFile(process.cwd() + "/index.html"));
app.get("/api/bestbuy/:sku", async (req, res) => {
  try {
    const r = await fetch("https://www.bestbuy.ca/api/2.0/json/product/" + req.params.sku + "/availability?storeId=" + req.query.storeId + "&lang=en-CA", { headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://www.bestbuy.ca/" } });
    const d = await r.json();
    const s = d?.availabilities?.find(a => String(a.storeId) === String(req.query.storeId));
    res.json({ inStock: s?.pickup?.purchasable === true, quantity: s?.pickup?.quantityOnHand ?? null, price: d?.pricing?.customerPrice ?? null, source: "live" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get("/api/walmart/:upc", async (req, res) => {
  try {
    const r = await fetch("https://www.walmart.ca/api/product-page/find-in-store?latitude=" + req.query.lat + "&longitude=" + req.query.lon + "&lang=en&upc=" + req.params.upc, { headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://www.walmart.ca/" } });
    const d = await r.json();
    res.json({ stores: (d?.info ?? []).map(s => ({ storeName: s.displayName, inStock: s.availabilityStatus === "IN_STOCK", quantity: s.stockLevel ?? null, price: d?.price?.displayPrice ?? null })), source: "live" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get("/health", (_, res) => res.json({ status: "ok" }));
app.listen(3001, () => console.log("PokéScout running on http://localhost:3001"));
