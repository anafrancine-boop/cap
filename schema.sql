-- ════════════════════════════════════════════════════════════════
--  Drainage Monitoring System — Database Schema
--  Run this once in MySQL Workbench or via: mysql -u root -p < schema.sql
-- ════════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS drainage_db;
USE drainage_db;

-- ── All raw sensor readings from the ESP32 ──────────────────────
CREATE TABLE IF NOT EXISTS sensor_readings (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  water_level_cm    DECIMAL(6,2)   NOT NULL,
  drainage_location VARCHAR(120)   DEFAULT 'Purok 2, Balungao',
  recorded_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_recorded (recorded_at)
);

-- ── Alert events (high water, low flow, system events) ──────────
CREATE TABLE IF NOT EXISTS alert_logs (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  alert_type        ENUM('HIGH_WATER_LEVEL','LOW_FLOW_RATE','SYSTEM_EVENT') NOT NULL,
  drainage_location VARCHAR(120)   DEFAULT 'Purok 2, Balungao',
  water_level_cm    DECIMAL(6,2)   NULL,
  triggered_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type    (alert_type),
  INDEX idx_time    (triggered_at)
);

-- ── Blade activation log ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS blade_activations (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  triggered_by    VARCHAR(50)    DEFAULT 'LOW_FLOW_RATE',
  activated_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  deactivated_at  TIMESTAMP      NULL,
  duration_sec    INT            NULL
);
