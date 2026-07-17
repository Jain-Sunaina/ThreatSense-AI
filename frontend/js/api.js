/* ═══════════════════════════════════════════════════════════════
   ThreatSense AI — API helpers
═══════════════════════════════════════════════════════════════ */

const API_URL = "http://127.0.0.1:8000";

/**
 * Send sensor readings to the backend and get an AI prediction.
 * @param {number} temperature  - e.g. 29.4
 * @param {number} humidity     - e.g. 61.2
 * @param {number} air_quality  - e.g. 88
 * @returns {Promise<{prediction: string}>}  "Normal" | "Anomaly"
 */
async function getPrediction(temperature, humidity, air_quality) {
  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ temperature, humidity, air_quality }),
    });

    if (!response.ok) {
      console.error(`[ThreatSense] /predict returned HTTP ${response.status}`);
      return { prediction: "Error" };
    }

    return await response.json();
  } catch (error) {
    console.error("[ThreatSense] Could not reach backend:", error);
    return { prediction: "Server Offline" };
  }
}
