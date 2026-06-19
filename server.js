import express from "express";
import cors from "cors";
import fetch from "node-fetch";
const app = express();
app.use(cors({ origin: "*" }));
app.get("/", (_, res) => res.sendFile(process.cwd() + "/index.html"));
app.get("/api/bestbuy/:sku", async (req, res) => {
  try {
    const r = await fetch("https://www.bestbuy.ca/api/2.0/json/product/" + req.params.sku + "/availability?storeId=" + req.query.storeId + "&lang=en-CA", { headers: {
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "en-CA,en;q=0.9",
      "Referer": "https://www.bestbuy.ca/en-ca/brand/pokemon",
      "Origin": "https://www.bestbuy.ca",
      "sec-ch-ua": '"Chromium";v="120"',
      "sec-ch-ua-mobile": "?1",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin"
    }});
    const text = await r.text();
    const d = JSON.parse(text);
    const s = d?.availabilities?.find(a => String(a.storeId) === String(req.query.storeId));
    res.json({ inStock: s?.pickup?.purchasable === true, quantity: s?.pickup?.quantityOnHand ?? null, price: d?.pricing?.customerPrice ?? null, source: "live" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get("/api/walmart/:upc", async (req, res) => {
  try {
    const r = await fetch("https://www.walmart.ca/api/product-page/find-in-store?latitude=" + req.query.lat + "&longitude=" + req.query.lon + "&lang=en&upc=" + req.params.upc, { headers: {
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "en-CA,en;q=0.9",
      "Referer": "https://www.walmart.ca/search?q=pokemon",
      "Origin": "https://www.walmart.ca"
    }});
    const d = await r.json();
    res.json({ stores: (d?.info ?? []).map(s => ({ storeName: s.displayName, inStock: s.availabilityStatus === "IN_STOCK", quantity: s.stockLevel ?? null, price: d?.price?.displayPrice ?? null })), source: "live" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get("/health", (_, res) => res.json({ status: "ok" }));
app.listen(3001, () => console.log("PokéScout running on http://localhost:3001"));
