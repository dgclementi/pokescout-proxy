import express from "express";
import cors from "cors";
import fetch from "node-fetch";
const app = express();
const SCRAPER_KEY = process.env.SCRAPER_KEY;
app.use(cors({ origin: "*" }));
app.get("/debug", (_, res) => res.json({ scraperKey: SCRAPER_KEY ? "set" : "missing", keyLength: SCRAPER_KEY?.length }));
app.get("/api/bestbuy/:sku", async (req, res) => {
  const url = "https://www.bestbuy.ca/api/2.0/json/product/" + req.params.sku + "/availability?storeId=" + req.query.storeId + "&lang=en-CA";
  const scraperUrl = "http://api.scraperapi.com?api_key=" + SCRAPER_KEY + "&url=" + encodeURIComponent(url) + "&country_code=ca";
  try {
    const r = await fetch(scraperUrl, { timeout: 15000 });
    const text = await r.text();
    res.json({ raw: text.slice(0, 500), status: r.status });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get("/health", (_, res) => res.json({ status: "ok" }));
app.use(express.static("."));
app.listen(3001, () => console.log("running"));
