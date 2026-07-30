// const express  = require('express');
// const http     = require('http');
// const cors     = require('cors');
// const path     = require('path');
// const mysql    = require('mysql2/promise');
// require('dotenv').config();

// const app    = express();
// const server = http.createServer(app);

// app.use(cors());
// app.use(express.json());
// app.use(express.static(__dirname));

// // ── Thresholds ────────────────────────────────────────────────────
// const WL_THRESHOLD = 5.0;
// const FR_THRESHOLD = 0.6;

// function classifyReading(reading = {}) {
//   const waterLevel = Number(reading.water_level_cm ?? 0);
//   const flowRate = Number(reading.flow_rate_ls ?? 0);
//   const highWater = waterLevel >= WL_THRESHOLD;
//   const lowFlow = flowRate < FR_THRESHOLD;

//   return {
//     waterLevel,
//     flowRate,
//     highWater,
//     lowFlow,
//     clogged: lowFlow,
//     bladeActive: lowFlow,
//     severity: lowFlow ? 'critical' : highWater ? 'warning' : 'normal',
//     statusLabel: lowFlow ? 'Clogged' : highWater ? 'High water' : 'Normal',
//     actionLabel: lowFlow ? 'Blade active' : highWater ? 'Alert only' : 'Monitoring',
//   };
// }

// // ── Create DB pool directly here (no db.js needed) ───────────────
// const pool = mysql.createPool({
//   host:     process.env.DB_HOST     || 'localhost',
//   user:     process.env.DB_USER     || 'root',
//   password: process.env.DB_PASSWORD || 'capstone123.',
//   database: process.env.DB_NAME     || 'drainage_db',
//   waitForConnections: true,
//   connectionLimit: 10,
// });

// // ── Test DB connection ────────────────────────────────────────────
// async function testDB() {
//   try {
//     const conn = await pool.getConnection();
//     console.log('✅ MySQL connected successfully');
//     conn.release();
//     return true;
//   } catch (err) {
//     console.error('❌ MySQL connection failed:', err.message);
//     return false;
//   }
// }

// // ── POST /api/sensor-data (ESP32 sends here) ─────────────────────
// app.post('/api/sensor-data', async (req, res) => {
//   const { water_level_cm, flow_rate_ls, location } = req.body;
//   const loc = location || 'Purok 2, Balungao';

//   if (water_level_cm === undefined || flow_rate_ls === undefined)
//     return res.status(400).json({ error: 'Missing sensor values' });

//   try {
//     await pool.query(
//       'INSERT INTO sensor_readings (water_level_cm, flow_rate_ls, drainage_location) VALUES (?,?,?)',
//       [water_level_cm, flow_rate_ls, loc]
//     );


//    let bladeActive = false;

// if (parseFloat(water_level_cm) >= WL_THRESHOLD) {
//   await pool.query(
//     'INSERT INTO alert_logs (alert_type, drainage_location, water_level_cm, flow_rate_ls) VALUES (?,?,?,?)',
//     ['HIGH_WATER_LEVEL', loc, water_level_cm, flow_rate_ls]
//   );
// }

// if (parseFloat(flow_rate_ls) < FR_THRESHOLD) {
//   bladeActive = true;

//   await pool.query(
//     'INSERT INTO alert_logs (alert_type, drainage_location, water_level_cm, flow_rate_ls) VALUES (?,?,?,?)',
//     ['LOW_FLOW_RATE', loc, water_level_cm, flow_rate_ls]
//   );

//   await pool.query(
//     'INSERT INTO blade_activations (triggered_by) VALUES (?)',
//     ['LOW_FLOW_RATE']
//   );
// }

// res.json({
//   success: true,
//   blade_active: bladeActive,
//   status: classifyReading({ water_level_cm, flow_rate_ls })
// });

//   } catch (err) {
//     console.error('sensor-data error:', err.message);
//     res.status(500).json({ error: err.message });
//   }
// });

// // ── GET /api/latest ───────────────────────────────────────────────
// app.get('/api/latest', async (req, res) => {
//   try {
//     const [rows] = await pool.query(
//       'SELECT * FROM sensor_readings ORDER BY recorded_at DESC LIMIT 1'
//     );
//     res.json(rows[0] || {});
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get('/api/status', async (req, res) => {
//   try {
//     const [[latest]] = await pool.query(
//       'SELECT * FROM sensor_readings ORDER BY recorded_at DESC LIMIT 1'
//     );
//     const [[alertRow]] = await pool.query(
//       `SELECT COUNT(*) AS total,
//         SUM(alert_type='HIGH_WATER_LEVEL') AS high_water,
//         SUM(alert_type='LOW_FLOW_RATE') AS low_flow
//        FROM alert_logs
//        WHERE triggered_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
//     );
//     const [[bladeRow]] = await pool.query(
//       `SELECT COUNT(*) AS activations
//        FROM blade_activations
//        WHERE activated_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
//     );

//     const status = classifyReading(latest);
//     res.json({
//       latest: latest || null,
//       thresholds: {
//         water_level_cm: WL_THRESHOLD,
//         flow_rate_ls: FR_THRESHOLD,
//       },
//       status,
//       last_seen: latest?.recorded_at || null,
//       alerts_24h: {
//         total: Number(alertRow?.total || 0),
//         high_water: Number(alertRow?.high_water || 0),
//         low_flow: Number(alertRow?.low_flow || 0),
//       },
//       blade_activations_24h: Number(bladeRow?.activations || 0),
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get('/api/readings', async (req, res) => {
//   const limit = Math.min(parseInt(req.query.limit) || 24, 100);
//   try {
//     const [rows] = await pool.query(
//       'SELECT * FROM sensor_readings ORDER BY recorded_at DESC LIMIT ?',
//       [limit]
//     );
//     res.json(rows.reverse());
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ── GET /api/alerts ───────────────────────────────────────────────
// app.get('/api/alerts', async (req, res) => {
//   const limit  = Math.min(parseInt(req.query.limit)  || 20, 100);
//   const offset = parseInt(req.query.offset) || 0;
//   try {
//     const [rows] = await pool.query(
//       'SELECT * FROM alert_logs ORDER BY triggered_at DESC LIMIT ? OFFSET ?',
//       [limit, offset]
//     );
//     res.json(rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ── GET /api/analytics ────────────────────────────────────────────
// app.get('/api/analytics', async (req, res) => {
//   try {
//     const monthParam = req.query.month;
//     let year  = new Date().getFullYear();
//     let month = new Date().getMonth();

//     if (monthParam) {
//       const parsed = new Date(`${monthParam} 1, ${year}`);
//       if (!isNaN(parsed)) month = parsed.getMonth();
//     }

//     const startOfMonth = new Date(year, month, 1);
//     const endOfMonth   = new Date(year, month + 1, 0, 23, 59, 59);

//     const [[wlRow]]  = await pool.query(
//       `SELECT COUNT(*) AS cnt FROM alert_logs WHERE alert_type='HIGH_WATER_LEVEL' AND triggered_at BETWEEN ? AND ?`,
//       [startOfMonth, endOfMonth]
//     );
//     const [[blRow]]  = await pool.query(
//       `SELECT COUNT(*) AS cnt FROM alert_logs WHERE alert_type='LOW_FLOW_RATE' AND triggered_at BETWEEN ? AND ?`,
//       [startOfMonth, endOfMonth]
//     );
//     const [[sysRow]] = await pool.query(
//       `SELECT COUNT(*) AS cnt FROM alert_logs WHERE alert_type='SYSTEM_EVENT' AND triggered_at BETWEEN ? AND ?`,
//       [startOfMonth, endOfMonth]
//     );

//     async function weekCounts(alertType) {
//       const weeks = [0, 0, 0, 0];
//       const [rows] = await pool.query(
//         `SELECT DAY(triggered_at) AS d, COUNT(*) AS cnt FROM alert_logs
//          WHERE alert_type=? AND triggered_at BETWEEN ? AND ? GROUP BY DAY(triggered_at)`,
//         [alertType, startOfMonth, endOfMonth]
//       );
//       rows.forEach(r => {
//         const w = Math.min(Math.floor((r.d - 1) / 7), 3);
//         weeks[w] += r.cnt;
//       });
//       return weeks;
//     }

//     const [[avgRow]] = await pool.query(
//       `SELECT AVG(water_level_cm) AS avgWaterLevel, AVG(flow_rate_ls) AS avgFlowRate
//        FROM sensor_readings WHERE recorded_at BETWEEN ? AND ?`,
//       [startOfMonth, endOfMonth]
//     );
//     const [[bladeRow]] = await pool.query(
//       `SELECT COUNT(*) AS cnt FROM blade_activations WHERE activated_at BETWEEN ? AND ?`,
//       [startOfMonth, endOfMonth]
//     );

//     res.json({
//       waterLevelCount: wlRow.cnt,
//       blockageCount:   blRow.cnt,
//       systemEvents:    sysRow.cnt,
//       wlByWeek:        await weekCounts('HIGH_WATER_LEVEL'),
//       blByWeek:        await weekCounts('LOW_FLOW_RATE'),
//       averageWaterLevel: Number(avgRow.avgWaterLevel || 0),
//       averageFlowRate: Number(avgRow.avgFlowRate || 0),
//       bladeActivations: Number(bladeRow.cnt || 0),
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// // ── Start server ──────────────────────────────────────────────────
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, async () => {
//   console.log(`\n🚀 Server running at http://localhost:${PORT}`);
//   console.log(`📡 ESP32 should POST to http://<your-ip>:${PORT}/api/sensor-data\n`);

//   const connected = await testDB();
//   if (connected) {
//     try {
//       await pool.query(
//         `INSERT INTO alert_logs (alert_type, drainage_location) VALUES ('SYSTEM_EVENT', 'Purok 2, Balungao')`
//       );
//       console.log('✓ System startup event logged');
//     } catch (err) {
//       console.warn('Could not log startup event:', err.message);
//     }
//   }
// });


const express = require("express");
const http = require("http");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./db");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});
app.use(express.static(__dirname));

const WL_THRESHOLD = 5.0;
const FR_THRESHOLD = 0.6;

function classifyReading(reading = {}) {
const waterLevel = Number(reading.water_level_cm ?? 0);
const flowRate = Number(reading.flow_rate_ls ?? 0);

const highWater = waterLevel >= WL_THRESHOLD;
const lowFlow = flowRate < FR_THRESHOLD;

return {
waterLevel,
flowRate,
highWater,
lowFlow,
clogged: lowFlow,
bladeActive: lowFlow,
severity:
lowFlow
? "critical"
: highWater
? "warning"
: "normal",

// ```
statusLabel:
  lowFlow
    ? "Clogged"
    : highWater
    ? "High water"
    : "Normal",

actionLabel:
  lowFlow
    ? "Blade active"
    : highWater
    ? "Alert only"
    : "Monitoring"
// ```

};
}

async function db() {
return await connectDB();
}

app.post("/api/sensor-data", async (req, res) => {
try {
const {
water_level_cm,
flow_rate_ls,
location
} = req.body;

```
if (
  water_level_cm === undefined ||
  flow_rate_ls === undefined
) {
  return res.status(400).json({
    error: "Missing sensor values"
  });
}

const database = await db();

const reading = {
  water_level_cm,
  flow_rate_ls,
  drainage_location:
    location ||
    "Purok 2, Balungao",

  recorded_at:
    new Date()
};

await database
  .collection(
    "sensor_readings"
  )
  .insertOne(reading);

let bladeActive = false;

if (
  Number(
    water_level_cm
  ) >= WL_THRESHOLD
) {
  await database
    .collection(
      "alert_logs"
    )
    .insertOne({
      alert_type:
        "HIGH_WATER_LEVEL",

      water_level_cm,

      flow_rate_ls,

      drainage_location:
        reading.drainage_location,

      triggered_at:
        new Date()
    });
}

if (
  Number(
    flow_rate_ls
  ) < FR_THRESHOLD
) {
  bladeActive = true;

  await database
    .collection(
      "alert_logs"
    )
    .insertOne({
      alert_type:
        "LOW_FLOW_RATE",

      water_level_cm,

      flow_rate_ls,

      drainage_location:
        reading.drainage_location,

      triggered_at:
        new Date()
    });

  await database
    .collection(
      "blade_activations"
    )
    .insertOne({
      triggered_by:
        "LOW_FLOW_RATE",

      activated_at:
        new Date()
    });
}

res.json({
  success: true,
  blade_active:
    bladeActive,

  status:
    classifyReading(
      reading
    )
});
```

} catch (err) {

```
console.error(
  err
);

res
  .status(500)
  .json({
    error:
      err.message
  });
```

}
});

app.get(
"/api/latest",
async (
req,
res
)=>{

try{

const database =
await db();

const latest =
await database
.collection(
"sensor_readings"
)
.findOne(
{},
{
sort:{
recorded_at:-1
}
}
);

res.json(
latest ||
{}
);

}catch(err){

res
.status(
500
)
.json({
error:
err.message
});

}

});

app.get(
"/api/readings",
async(
req,
res
)=>{

try{

const database =
await db();

const limit =
Math.min(
Number(
req.query.limit
)||
24,
100
);

const rows =
await database
.collection(
"sensor_readings"
)
.find()
.sort({
recorded_at:
-1
})
.limit(
limit
)
.toArray();

res.json(
rows.reverse()
);

}catch(
err
){

res
.status(
500
)
.json({
error:
err.message
});

}

});

app.get(
"/api/alerts",
async(
req,
res
)=>{

try{

const database =
await db();

const limit =
Number(
req.query.limit
)||
20;

const rows =
await database
.collection(
"alert_logs"
)
.find()
.sort({
triggered_at:
-1
})
.limit(
limit
)
.toArray();

res.json(
rows
);

}catch(
err
){

res
.status(
500
)
.json({
error:
err.message
});

}

});

app.get(
"/api/status",
async(
req,
res
)=>{

try{

const database =
await db();

const latest =
await database
.collection(
"sensor_readings"
)
.findOne(
{},
{
sort:{
recorded_at:-1
}
}
);

res.json({

latest,

thresholds:{
water_level_cm:
WL_THRESHOLD,

flow_rate_ls:
FR_THRESHOLD
},

status:
classifyReading(
latest
),

last_seen:
latest
?.recorded_at

});

}catch(
err
){

res
.status(
500
)
.json({
error:
err.message
});

}

});

const PORT =
process.env.PORT
||
3000;

server.listen(
PORT,
()=>{

console.log(
`Server running on ${PORT}`
);

}
);
