/* ═══════════════════════════════════════════════════════════════
   ThreatSense AI — Centralised API helpers
═══════════════════════════════════════════════════════════════ */

'use strict';

const API_URL =
    window.location.hostname === "localhost"
        ? "http://127.0.0.1:8000"
        : "https://threatsense-ai.onrender.com";

async function _get(path) {
  try {
    const r = await fetch(`${API_URL}${path}`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (e) {
    console.error(`[API] GET ${path}:`, e.message);
    throw e;
  }
}

async function _post(path, body) {
  try {
    const r = await fetch(`${API_URL}${path}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (e) {
    console.error(`[API] POST ${path}:`, e.message);
    throw e;
  }
}

const API = {
  predict:  (temperature, humidity, air_quality, device_id = "DEV-01") =>
              _post("/predict", { temperature, humidity, air_quality, device_id }),

  devices:  ()               => _get("/devices"),
  alerts:   (severity = "")  => _get(`/alerts${severity ? `?severity=${severity}` : ""}`),
  history:  (device_id = "")  => _get(`/history${device_id ? `?device_id=${device_id}` : ""}`),
  stats:    ()               => _get("/stats"),
  health:   ()               => _get("/health"),
};
