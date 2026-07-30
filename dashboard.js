/* ═══════════════════════════════════════════════════════════════════
   dashboard.js — Analytics Dashboard (MongoDB Version)
═══════════════════════════════════════════════════════════════════ */

const API_BASE = "";

function api(path) {
  return `${API_BASE}${path}`;
}

/* ── Clock ───────────────────────────────────────────────────── */

function updateClock() {
  const el = document.getElementById("clock");

  if (!el) return;

  el.textContent =
    new Date().toLocaleTimeString(
      "en-PH",
      {
        hour12: false
      }
    );
}

updateClock();

setInterval(
  updateClock,
  1000
);

/* ── Month Filters ───────────────────────────────────────────── */

(function buildMonthFilters() {

  const container =
    document.getElementById(
      "month-filters"
    );

  if (!container) return;

  const now =
    new Date();

  for (
    let i = 2;
    i >= 0;
    i--
  ) {

    const d =
      new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

    const btn =
      document.createElement(
        "button"
      );

    btn.className =
      "month-btn";

    if (i === 0) {
      btn.classList.add(
        "active"
      );
    }

    btn.textContent =
      d.toLocaleString(
        "en-US",
        {
          month:
            "short"
        }
      );

    btn.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(
            ".month-btn"
          )
          .forEach(
            b =>
              b.classList.remove(
                "active"
              )
          );

        btn.classList.add(
          "active"
        );

        fetchAndRender(
          btn.textContent
        );

      }
    );

    container.appendChild(
      btn
    );

  }

})();

/* ── Charts ─────────────────────────────────────────────────── */

Chart.defaults.color =
"#8b949e";

Chart.defaults.font.family =
"'DM Sans', sans-serif";

let chartWL =
null;

let chartBL =
null;

const labels =
[
"Week 1",
"Week 2",
"Week 3",
"Week 4"
];

function renderChart(
id,
data,
colors
){

const ctx =
document
.getElementById(
id
)
?.getContext(
"2d"
);

if(
!ctx
)
return;

return new Chart(
ctx,
{
type:
"bar",

data:{

labels,

datasets:[
{

data,

backgroundColor:
colors,

borderRadius:
4

}
]

},

options:{

responsive:
true,

plugins:{

legend:{
display:
false
}

}

}

}
);

}

function drawCharts(
wl,
bl
){

if(
chartWL
)
chartWL.destroy();

if(
chartBL
)
chartBL.destroy();

chartWL =
renderChart(
"chartWaterLevel",
wl,
[
"#fb923c",
"#fbbf24",
"#fcd34d",
"#fde68a"
]
);

chartBL =
renderChart(
"chartBlockage",
bl,
[
"#f87171",
"#fb7185",
"#fca5a5",
"#fecaca"
]
);

}

/* ── Analytics ─────────────────────────────────────────────── */

async function fetchAndRender(
month
){

try{

const res =
await fetch(
month
?
api(
`/api/analytics?month=${month}`
)
:
api(
"/api/analytics"
)
);

if(
!res.ok
){

throw new Error();

}

const data =
await res.json();

const wl =
data.waterLevelCount || 0;

const bl =
data.blockageCount || 0;

const sys =
data.systemEvents || 0;

document.getElementById(
"stat-wl"
).textContent =
wl;

document.getElementById(
"stat-bl"
).textContent =
bl;

document.getElementById(
"stat-total"
).textContent =
wl + bl + sys;

document.getElementById(
"sum-wl"
).textContent =
`${wl} ALERTS`;

document.getElementById(
"sum-bl"
).textContent =
`${bl} ALERTS`;

document.getElementById(
"sum-sys"
).textContent =
`${sys} EVENTS`;

drawCharts(
data.wlByWeek ||
[0,0,0,0],

data.blByWeek ||
[0,0,0,0]
);

}catch{

document.getElementById(
"stat-wl"
).textContent =
"0";

document.getElementById(
"stat-bl"
).textContent =
"0";

document.getElementById(
"stat-total"
).textContent =
"0";

drawCharts(
[0,0,0,0],
[0,0,0,0]
);

}

}

fetchAndRender();

/* ── Notifications ───────────────────────────────────────── */

const panel =
document.getElementById(
"notif-panel"
);

async function loadRecentNotifs(){

if(
!panel
)
return;

try{

const res =
await fetch(
api(
"/api/alerts?limit=3"
)
);

const alerts =
await res.json();

panel.innerHTML =
"";

if(
alerts.length
===
0
){

panel.innerHTML =
`
<div data-placeholder>
No alerts yet
</div>
`;

return;

}

alerts
.reverse()
.forEach(
a=>{

const div =
document.createElement(
"div"
);

div.className =
"notif-card";

div.innerHTML =
`
<div>
${a.alert_type}
</div>

<div>
${new Date(
a.triggered_at
).toLocaleTimeString()}
</div>
`;

panel.appendChild(
div
);

}
);

}catch{

panel.innerHTML =
`
<div data-placeholder>
Notifications unavailable
</div>
`;

}

}

loadRecentNotifs();

/* ── Refresh ─────────────────────────────────────────────── */

setInterval(
()=>{

const active =
document.querySelector(
".month-btn.active"
);

fetchAndRender(
active?.textContent
);

loadRecentNotifs();

},
5000
);