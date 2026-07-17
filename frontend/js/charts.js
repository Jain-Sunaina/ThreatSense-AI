/* ═══════════════════════════════════════════════════════════════
   ThreatSense AI — Chart Initialisation (Chart.js)
═══════════════════════════════════════════════════════════════ */

'use strict';

// ── Shared chart defaults ─────────────────────────────────────
Chart.defaults.color          = '#64748b';
Chart.defaults.borderColor    = '#1e2d45';
Chart.defaults.font.family    = "'Segoe UI', system-ui, sans-serif";
Chart.defaults.font.size      = 11;

// ── Helpers ───────────────────────────────────────────────────
function buildGradient(ctx, canvas, colorTop, colorBot) {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.offsetHeight || 280);
  grad.addColorStop(0,   colorTop);
  grad.addColorStop(1,   colorBot);
  return grad;
}

function lastNLabels(n) {
  const labels = [];
  const now    = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const t = new Date(now - i * 5000);   // 5-second ticks
    labels.push(t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }
  return labels;
}

function randInRange(min, max) {
  return +(Math.random() * (max - min) + min).toFixed(2);
}

function seedData(n, min, max) {
  return Array.from({ length: n }, () => randInRange(min, max));
}

// ── Build the sensor line chart ───────────────────────────────
const POINTS = 20;

const sensorCtx    = document.getElementById('sensorChart').getContext('2d');
const canvasEl     = document.getElementById('sensorChart');

const tempGrad  = buildGradient(sensorCtx, canvasEl, 'rgba(99,102,241,.35)', 'rgba(99,102,241,0)');
const humGrad   = buildGradient(sensorCtx, canvasEl, 'rgba(0,212,255,.3)',   'rgba(0,212,255,0)');
const aqGrad    = buildGradient(sensorCtx, canvasEl, 'rgba(234,179,8,.3)',   'rgba(234,179,8,0)');

window.sensorChart = new Chart(sensorCtx, {
  type: 'line',
  data: {
    labels: lastNLabels(POINTS),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: seedData(POINTS, 22, 38),
        borderColor:     '#818cf8',
        backgroundColor: tempGrad,
        pointBackgroundColor: '#818cf8',
        pointRadius:  3,
        pointHoverRadius: 6,
        borderWidth:  2.5,
        tension: 0.45,
        fill: true,
      },
      {
        label: 'Humidity (%)',
        data: seedData(POINTS, 40, 80),
        borderColor:     '#00d4ff',
        backgroundColor: humGrad,
        pointBackgroundColor: '#00d4ff',
        pointRadius:  3,
        pointHoverRadius: 6,
        borderWidth:  2.5,
        tension: 0.45,
        fill: true,
      },
      {
        label: 'Air Quality (AQI)',
        data: seedData(POINTS, 30, 150),
        borderColor:     '#eab308',
        backgroundColor: aqGrad,
        pointBackgroundColor: '#eab308',
        pointRadius:  3,
        pointHoverRadius: 6,
        borderWidth:  2.5,
        tension: 0.45,
        fill: true,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    animation: { duration: 400 },
    plugins: {
      legend: {
        display: false,          // we use custom HTML legend
      },
      tooltip: {
        backgroundColor: '#1a2236',
        borderColor:     '#1e2d45',
        borderWidth:     1,
        titleColor:      '#e2e8f0',
        bodyColor:       '#94a3b8',
        padding:         10,
        callbacks: {
          label(ctx) {
            return ` ${ctx.dataset.label}: ${ctx.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid:   { color: 'rgba(30,45,69,.7)', drawTicks: false },
        ticks:  { maxTicksLimit: 6, color: '#475569', maxRotation: 0 },
        border: { display: false },
      },
      y: {
        grid:   { color: 'rgba(30,45,69,.7)', drawTicks: false },
        ticks:  { color: '#475569', padding: 8 },
        border: { display: false },
      },
    },
  },
});

// ── Live update: push new data point every 5 seconds ─────────
window.pushSensorReading = function (tempVal, humVal, aqVal) {
  const chart  = window.sensorChart;
  const label  = new Date().toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  chart.data.labels.push(label);
  chart.data.datasets[0].data.push(tempVal ?? randInRange(22, 38));
  chart.data.datasets[1].data.push(humVal  ?? randInRange(40, 80));
  chart.data.datasets[2].data.push(aqVal   ?? randInRange(30, 150));

  // Keep rolling window
  if (chart.data.labels.length > POINTS) {
    chart.data.labels.shift();
    chart.data.datasets.forEach(ds => ds.data.shift());
  }
  chart.update('none');   // no animation on live tick for performance
};
