const express = require("express");
const cors = require("cors");
const multer = require("multer");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./database.db");

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
  keterangan TEXT

