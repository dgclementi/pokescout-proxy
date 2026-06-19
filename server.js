import express from "express";
import cors from "cors";
import fetch from "node-fetch";
const app = express();
const SCRAPER_KEY = process.env.SCRAPER_KEY;
app.use(cors({ origin: "*" }));
function scraperUrl(url) {
  return `http://api.scraperapi.com?api_key=${SCRAPER_KEY}&url=${encodeURIComponent(url)}&country_code=ca`;
}
app.get("/api/bestbuy/:sku", async (req, res) => {
  try {
    const url = "https://www.bestbuy.ca/api/2.0/json/product/" + req.params.sku + "/availability?storeId=" + req.query.storeId + "&lang=en-CA";
    const r = await fetch(scraperUrl(url), { timeout: 15000 });
    const text = await r.text();
    const d = JSON.parse(text);
    const s = d?.availabilities?.find(a => String(a.storeId) === String(req.query.storeId));
    res.json({ inStock: s?.pickup?.purchasable === true, quantity: s?.pickup?.quantityOnHand ?? null, price: d?.pricing?.customerPrice ?? null, source: "live" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get("/api/walmart/:upc", async (req, res) => {
  try {
    const url = "https://www.walmart.ca/api/product-page/find-in-store?latitude=" + req.query.lat + "&longitude=" + req.query.lon + "&lang=en&upc=" + req.params.upc;
    const r = await fetch(scraperUrl(url), { timeout: 15000 });
    const d = await r.json();
    res.json({ stores: (d?.info ?? []).map(s => ({ storeName: s.displayName, inStock: s.availabilityStatus === "IN_STOCK", quantity: s.stockLevel ?? null, price: d?.price?.displayPrice ?? null })), source: "live" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get("/health", (_, res) => res.json({ status: "ok" }));
app.use(express.static("."));
app.listen(3001, () => console.log("PokéScout running on http://localhost:3001"));
