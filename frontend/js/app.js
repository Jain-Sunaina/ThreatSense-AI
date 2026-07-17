
/* ═══════════════════════════════════════════════════════════════
   ThreatSense AI — Dashboard Logic (vanilla JS)
═══════════════════════════════════════════════════════════════ */

'use strict';

// ── Device data ───────────────────────────────────────────────
const DEVICE_TYPES = ['Temp Sensor', 'Humidity Sensor', 'Air Quality', 'Water Flow', 'Traffic Cam', 'Voltage Meter'];

const devices = [
  { id: 'DEV-01', type: 'Temp Sensor',      value: 29.4,  unit: '°C',  status: 'healthy'  },
  { id: 'DEV-02', type: 'Humidity Sensor',   value: 61.2,  unit: '%',   status: 'healthy'  },
  { id: 'DEV-03', type: 'Air Quality',       value: 88.0,  unit: 'AQI', status: 'warning'  },
  { id: 'DEV-04', type: 'Water Flow',        value: 14.5,  unit: 'L/m', status: 'healthy'  },
  { id: 'DEV-05', type: 'Voltage Meter',     value: 218.3, unit: 'V',   status: 'healthy'  },
  { id: 'DEV-06', type: 'Traffic Cam',       value: 72,    unit: 'veh', status: 'healthy'  },
  { id: 'DEV-07', type: 'Temp Sensor',       value: 47.8,  unit: '°C',  status: 'danger'   },
  { id: 'DEV-08', type: 'Humidity Sensor',   value: 11.0,  unit: '%',   status: 'warning'  },
  { id: 'DEV-09', type: 'Air Quality',       value: 34.0,  unit: 'AQI', status: 'healthy'  },
  { id: 'DEV-10', type: 'Voltage Meter',     value: 0,     unit: 'V',   status: 'offline'  },
];

// ── Incident data ─────────────────────────────────────────────
const ATTACK_TYPES = [
  'DoS Attack', 'MITM Attack', 'Replay Attack',
  'Fuzzing', 'Data Injection', 'Brute Force', 'Spoofing',
];

const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

const initialIncidents = [
  { time: '14:32:08', device: 'DEV-07', attack: 'DoS Attack',     severity: 'Critical' },
  { time: '13:58:44', device: 'DEV-03', attack: 'Data Injection',  severity: 'High'     },
  { time: '12:20:31', device: 'DEV-08', attack: 'Replay Attack',   severity: 'Medium'   },
  { time: '11:47:19', device: 'DEV-05', attack: 'Fuzzing',         severity: 'Low'      },
  { time: '10:15:02', device: 'DEV-02', attack: 'MITM Attack',     severity: 'High'     },
];

let incidents = [...initialIncidents];

// ── Helpers ───────────────────────────────────────────────────
function rand(min, max) { return (Math.random() * (max - min) + min).toFixed(1); }
function randInt(arr)   { return arr[Math.floor(Math.random() * arr.length)]; }

function now() {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function severityClass(sev) {
  const map = { Low: 'ts-sev-low', Medium: 'ts-sev-medium', High: 'ts-sev-high', Critical: 'ts-sev-critical' };
  return map[sev] || 'ts-sev-low';
}

function statusClass(status) {
  const map = { healthy: 'ts-badge-healthy', warning: 'ts-badge-warning', danger: 'ts-badge-danger', offline: 'ts-badge-offline' };
  return map[status] || 'ts-badge-healthy';
}

function statusIcon(status) {
  const map = {
    healthy: 'bi-check-circle-fill',
    warning: 'bi-exclamation-triangle-fill',
    danger:  'bi-x-circle-fill',
    offline: 'bi-dash-circle-fill',
  };
  return map[status] || 'bi-check-circle-fill';
}

// ── Live clock ────────────────────────────────────────────────
function updateClock() {
  const el = document.getElementById('live-time');
  if (el) {
    const d = new Date();
    el.textContent = d.toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    }) + ' · ' + d.toLocaleTimeString();
  }
}

// ── Render device table ───────────────────────────────────────
function renderDeviceTable() {
  const tbody = document.getElementById('device-table-body');
  if (!tbody) return;

  tbody.innerHTML = devices.map(d => `
    <tr>
      <td class="fw-semibold text-cyan">${d.id}</td>
      <td class="text-muted">${d.type}</td>
      <td>${d.value} <small class="text-muted">${d.unit}</small></td>
      <td>
        <span class="ts-badge ${statusClass(d.status)}">
          <i class="bi ${statusIcon(d.status)}"></i>
          ${d.status.charAt(0).toUpperCase() + d.status.slice(1)}
        </span>
      </td>
    </tr>
  `).join('');
}

// ── Render incidents table ────────────────────────────────────
function renderIncidentsTable() {
  const tbody = document.getElementById('incidents-table-body');
  if (!tbody) return;

  tbody.innerHTML = incidents.slice(0, 8).map((inc, idx) => `
    <tr class="${idx === 0 ? 'ts-incident-new' : ''}">
      <td class="text-muted">${inc.time}</td>
      <td class="fw-semibold text-cyan">${inc.device}</td>
      <td>
        <span class="d-flex align-items-center gap-2">
          <i class="bi bi-shield-x text-danger"></i>
          ${inc.attack}
        </span>
      </td>
      <td>
        <span class="ts-badge ${severityClass(inc.severity)}">
          ${inc.severity}
        </span>
      </td>
    </tr>
  `).join('');
}

// ── Update stat cards ─────────────────────────────────────────
function updateStats() {
  const healthy  = devices.filter(d => d.status === 'healthy').length;
  const threats  = devices.filter(d => d.status === 'danger').length;
  const total    = devices.length;
  const accuracy = (94.2 + (Math.random() * 2 - 1)).toFixed(1);

  document.getElementById('stat-total').textContent    = total;
  document.getElementById('stat-healthy').textContent  = healthy;
  document.getElementById('stat-threats').textContent  = threats;
  document.getElementById('stat-accuracy').textContent = accuracy + '%';

  const bar = document.getElementById('accuracy-bar');
  if (bar) bar.style.width = accuracy + '%';
}

// ── Simulate live sensor fluctuation ─────────────────────────
function simulateLiveData() {
  devices.forEach(d => {
    if (d.status === 'offline') return;
    // small random drift
    const bump = (Math.random() * 2 - 1);
    d.value = parseFloat((parseFloat(d.value) + bump).toFixed(1));
  });

  renderDeviceTable();

  // Push new reading to chart
  if (window.pushSensorReading) {
    const temp = parseFloat(rand(22, 38));
    const hum  = parseFloat(rand(40, 80));
    const aqi  = parseFloat(rand(30, 150));
    window.pushSensorReading(temp, hum, aqi);
  }
}

// ── Inject Attack button ──────────────────────────────────────
document.getElementById('injectAttackBtn').addEventListener('click', function () {
  // Pick a random non-offline device and mark as danger
  const targets = devices.filter(d => d.status !== 'offline');
  const target  = targets[Math.floor(Math.random() * targets.length)];
  target.status = 'danger';

  const attack   = randInt(ATTACK_TYPES);
  const severity = randInt(SEVERITIES);

  const newIncident = {
    time:    now(),
    device:  target.id,
    attack,
    severity,
  };

  incidents.unshift(newIncident);

  // Update UI
  renderDeviceTable();
  renderIncidentsTable();
  updateStats();

  // Show toast
  document.getElementById('toast-msg').innerHTML =
    `Attack injected on <strong>${target.id}</strong> — <em>${attack}</em>`;

  const toastEl = document.getElementById('attackToast');
  bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 4000 }).show();

  // Spike the chart
  if (window.pushSensorReading) {
    window.pushSensorReading(
      parseFloat(rand(45, 70)),   // abnormal temp spike
      parseFloat(rand(5,  20)),   // abnormal humidity drop
      parseFloat(rand(180, 300)), // abnormal AQI spike
    );
  }

  // Flash button
  this.classList.add('active');
  setTimeout(() => this.classList.remove('active'), 300);
});



// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateClock();
  renderDeviceTable();
  renderIncidentsTable();
  updateStats();
  updatePrediction();

  // Tick every second for clock
  setInterval(updateClock, 1000);

  // Live sensor simulation every 5 seconds
  setInterval(simulateLiveData, 5000);
  setInterval(updatePrediction, 5000);
});

// ── AI Prediction ─────────────────────────────────────────────
/**
 * Read current sensor values from the device list, send them to
 * the backend, and update the #predictionValue element if present.
 */
async function updatePrediction() {
  // Pull live values from the in-memory device array
  const tempDevice = devices.find(d => d.type === 'Temp Sensor'     && d.status !== 'offline');
  const humDevice  = devices.find(d => d.type === 'Humidity Sensor'  && d.status !== 'offline');
  const aqDevice   = devices.find(d => d.type === 'Air Quality'      && d.status !== 'offline');

  const temperature = tempDevice ? tempDevice.value : 25.0;
  const humidity    = humDevice  ? humDevice.value  : 55.0;
  const air_quality = aqDevice   ? aqDevice.value   : 50.0;

  const result = await getPrediction(temperature, humidity, air_quality);

  const predictionEl = document.getElementById('predictionValue');
  if (!predictionEl) return;

  if (result.prediction === 'Normal') {
    predictionEl.innerHTML = '<span style="color:#00ff99;">🟢 NORMAL</span>';
  } else if (result.prediction === 'Anomaly') {
    predictionEl.innerHTML = '<span style="color:#ef4444;">🔴 ANOMALY DETECTED</span>';
  } else {
    predictionEl.innerHTML = `<span style="color:#94a3b8;">— ${result.prediction}</span>`;
  }
}