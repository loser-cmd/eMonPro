const express = require("express");
const cors = require("cors");
const multer = require("multer");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./database.db");

// === INIT DATABASE ===
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT,
    role TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS proyek (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT,
    lokasi TEXT,
    nilai TEXT,
    progres INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS laporan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    proyek_id INTEGER,
    keterangan TEXT,
    tanggal TEXT,
    foto TEXT
  )`);
});

// === FILE UPLOAD ===
const upload = multer({ dest: "uploads/" });

// === AUTH ===
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username=? AND password=?", [username, password], (err, row) => {
    if (row) res.json(row);
    else res.status(401).json({ error: "Login gagal" });
  });
});

// === PROYEK ===
app.post("/proyek", (req, res) => {
  const { nama, lokasi, nilai } = req.body;
  db.run("INSERT INTO proyek (nama,lokasi,nilai) VALUES (?,?,?)", [nama, lokasi, nilai]);
  res.json({ success: true });
});

app.get("/proyek", (req, res) => {
  db.all("SELECT * FROM proyek", (err, rows) => res.json(rows));
});

// === LAPORAN ===
app.post("/laporan", upload.single("foto"), (req, res) => {
  const { proyek_id, keterangan, tanggal } = req.body;
  const foto = req.file ? req.file.filename : "";
  db.run("INSERT INTO laporan (proyek_id,keterangan,tanggal,foto) VALUES (?,?,?,?)",
    [proyek_id, keterangan, tanggal, foto]);
  res.json({ success: true });
});

app.get("/laporan/:proyek_id", (req, res) => {
  db.all("SELECT * FROM laporan WHERE proyek_id=?", [req.params.proyek_id], (err, rows) => res.json(rows));
});

// === DASHBOARD ===
app.get("/dashboard", (req, res) => {
  db.all("SELECT * FROM proyek", (err, proyek) => {
    db.all("SELECT COUNT(*) as total FROM laporan", (err, laporan) => {
      res.json({ proyek, totalLaporan: laporan[0].total });
    });
  });
});

// === SERVER START ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
