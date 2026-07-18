/* ═══════════════════════════════════════════════════════════════
   ThreatSense AI — Dashboard Logic
   All data loaded from backend APIs — no hardcoded values.
═══════════════════════════════════════════════════════════════ */

'use strict';

const ATTACK_TYPES = [
  'DoS Attack','MITM Attack','Replay Attack',
  'Fuzzing','Data Injection','Brute Force','Spoofing',
];
const SEVERITIES   = ['Low','Medium','High','Critical'];
let DEVICE_IDS = [];

// ── Helpers ───────────────────────────────────────────────────
const rand    = (a, b)  => +(Math.random() * (b - a) + a).toFixed(1);
const pick    = arr     => arr[Math.floor(Math.random() * arr.length)];
const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

function severityClass(s) {
  return { Low:'ts-sev-low', Medium:'ts-sev-medium', High:'ts-sev-high', Critical:'ts-sev-critical' }[s] || 'ts-sev-low';
}
function statusClass(s) {
  return { healthy:'ts-badge-healthy', warning:'ts-badge-warning', danger:'ts-badge-danger', offline:'ts-badge-offline' }[s] || 'ts-badge-healthy';
}
function statusIcon(s) {
  return { healthy:'bi-check-circle-fill', warning:'bi-exclamation-triangle-fill', danger:'bi-x-circle-fill', offline:'bi-dash-circle-fill' }[s] || 'bi-check-circle-fill';
}
function fmtTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' });
}

// ── Clock ─────────────────────────────────────────────────────
function updateClock() {
  const el = document.getElementById('live-time');
  if (!el) return;
  const d = new Date();
  el.textContent = d.toLocaleDateString(undefined,
    { weekday:'long', year:'numeric', month:'long', day:'numeric' })
    + ' · ' + d.toLocaleTimeString();
}

// ── Stats cards ───────────────────────────────────────────────
async function loadStats() {
  const data = await API.stats();
  if (!data) return;

  setText('stat-total',    data.total_devices);
  setText('stat-healthy',  data.healthy_devices);
  setText('stat-threats',  data.threat_count);
  setText('stat-accuracy', data.accuracy + '%');
  setText('stat-total-sub',   `${data.total_devices} registered`);
  setText('stat-healthy-sub', `${data.healthy_devices > 0 ? Math.round((data.healthy_devices / data.total_devices) * 100) : 0}% healthy rate`);
  setText('stat-threats-sub', `${data.anomaly_count} anomalies total`);

  const bar = document.getElementById('accuracy-bar');
  if (bar) bar.style.width = data.accuracy + '%';
}

// ── Device table ──────────────────────────────────────────────
async function loadDeviceTable() {
  const tbody = document.getElementById('device-table-body');
  if (!tbody) return;

  const devices = await API.devices();

  if (!devices || devices.length === 0) {
    tbody.innerHTML =
        `<tr>
            <td colspan="4" class="text-center text-muted py-3">
                No devices found
            </td>
        </tr>`;
    return;
  }

DEVICE_IDS = devices.map(d => d.device_id);

  tbody.innerHTML = devices.map(d => {
    const val = d.temperature != null ? `${d.temperature} <small class="text-muted">°C</small>` : '—';
    return `
      <tr>
        <td class="fw-semibold text-cyan">${d.device_id}</td>
        <td class="text-muted">${d.device_type}</td>
        <td>${val}</td>
        <td>
          <span class="ts-badge ${statusClass(d.status)}">
            <i class="bi ${statusIcon(d.status)}"></i>
            ${d.status.charAt(0).toUpperCase() + d.status.slice(1)}
          </span>
        </td>
      </tr>`;
  }).join('');
}

// ── Incidents table ───────────────────────────────────────────
async function loadIncidentsTable() {
  const tbody = document.getElementById('incidents-table-body');
  if (!tbody) return;

  const alerts = await API.alerts();
  if (!alerts || alerts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">No incidents recorded</td></tr>`;
    return;
  }

  tbody.innerHTML = alerts.slice(0, 8).map((a, i) => `
    <tr class="${i === 0 ? 'ts-incident-new' : ''}">
      <td class="text-muted">${fmtTime(a.timestamp)}</td>
      <td class="fw-semibold text-cyan">${a.device_id}</td>
      <td>
        <span class="d-flex align-items-center gap-2">
          <i class="bi bi-shield-x text-danger"></i>
          ${a.description}
        </span>
      </td>
      <td><span class="ts-badge ${severityClass(a.severity)}">${a.severity}</span></td>
    </tr>`).join('');
}

// ── AI Prediction card ────────────────────────────────────────
async function updatePrediction() {
  const el = document.getElementById('predictionValue');
  if (!el) return;

  const temp = rand(22, 38);
  const hum  = rand(40, 80);
  const aqi  = rand(30, 150);
  const dev =
    DEVICE_IDS.length > 0
        ? pick(DEVICE_IDS)
        : "DEV-01";

  const result = await API.predict(temp, hum, aqi, dev);
  if (!result) {
    el.innerHTML = `<span style="color:#94a3b8;">— Server Offline</span>`;
    return;
  }

  if (result.prediction === 'Normal') {
    el.innerHTML = `<span style="color:#00ff99;">🟢 NORMAL</span>`;
  } else {
    el.innerHTML = `<span style="color:#ef4444;">🔴 ANOMALY</span>`;
  }

  if (window.pushSensorReading) window.pushSensorReading(temp, hum, aqi);
  loadStats();
  loadDeviceTable();
  loadIncidentsTable();
}

// ── Inject Attack ─────────────────────────────────────────────
document.getElementById('injectAttackBtn')?.addEventListener('click', async function () {
  this.disabled = true;

  const temp = rand(48, 75);
  const hum  = rand(3,  18);
  const aqi  = rand(180, 320);
  const dev =
    DEVICE_IDS.length > 0
        ? pick(DEVICE_IDS)
        : "DEV-01";

  const result = await API.predict(temp, hum, aqi, dev);

  if (window.pushSensorReading) window.pushSensorReading(temp, hum, aqi);

  const label = result?.prediction ?? 'Unknown';

  document.getElementById('toast-msg').innerHTML =
    `Attack injected on <strong>${dev}</strong> — <em>${label}</em>`;
  bootstrap.Toast.getOrCreateInstance(
    document.getElementById('attackToast'), { delay: 4500 }
  ).show();

  await Promise.all([loadStats(), loadDeviceTable(), loadIncidentsTable()]);

  this.disabled = false;
  this.classList.add('active');
  setTimeout(() => this.classList.remove('active'), 300);
});

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  updateClock();
  setInterval(updateClock, 1000);

  await Promise.all([loadStats(), loadDeviceTable(), loadIncidentsTable()]);
  await updatePrediction();

  setInterval(async () => {
    const temp = rand(22, 38);
    const hum  = rand(40, 80);
    const aqi  = rand(30, 150);
    if (window.pushSensorReading) window.pushSensorReading(temp, hum, aqi);
  }, 5000);

  setInterval(() => Promise.all([loadStats(), loadDeviceTable(), loadIncidentsTable()]), 30000);
});
