const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Подключение к БД SQLite
const db = new sqlite3.Database('./database.db');

// Создание таблиц при запуске
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        price INTEGER
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS signups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullname TEXT,
        phone TEXT,
        email TEXT,
        service_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    // Добавляем тестовые услуги
    db.get("SELECT count(*) as count FROM services", (err, row) => {
        if (row.count === 0) {
            const stmt = db.prepare("INSERT INTO services (name, price) VALUES (?, ?)");
            stmt.run("Групповые занятия", 500);
            stmt.run("Мини-группы", 1000);
            stmt.run("Персональный тренинг", 2000);
            stmt.finalize();
        }
    });
});

// API для получения услуг
app.get('/api/services', (req, res) => {
    db.all("SELECT * FROM services", [], (err, rows) => {
        res.json(rows);
    });
});

// API для записи на пробное занятие
app.post('/api/signup', (req, res) => {
    const { fullname, phone, email, service_id } = req.body;
    
    // Простейшая серверная валидация (основная на клиенте)
    if (!fullname || !phone || !email || !service_id) {
        return res.status(400).json({ error: "Все поля обязательны" });
    }

    const stmt = db.prepare(`INSERT INTO signups (fullname, phone, email, service_id) VALUES (?, ?, ?, ?)`);
    stmt.run(fullname, phone, email, service_id, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, id: this.lastID });
    });
    stmt.finalize();
});

app.listen(3000, () => {
    console.log('Сервер запущен на http://localhost:3000');
});