const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3847;

// Middleware
app.use(cors());
app.use(express.json());

// SQLite database
const db = new Database(path.join(__dirname, 'annotations.db'));
db.pragma('journal_mode = WAL');

// Create table
db.exec(`
    CREATE TABLE IF NOT EXISTS annotations (
        id TEXT PRIMARY KEY,
        x REAL,
        y REAL,
        x1 REAL, y1 REAL,
        x2 REAL, y2 REAL,
        shape TEXT DEFAULT 'pin',
        sentiment TEXT NOT NULL CHECK(sentiment IN ('like', 'dislike', 'neutral')),
        comment TEXT DEFAULT '',
        page_url TEXT DEFAULT '',
        created_at TEXT NOT NULL
    )
`);

// GET all annotations
app.get('/api/annotations', (req, res) => {
    const rows = db.prepare('SELECT * FROM annotations ORDER BY created_at DESC').all();
    res.json(rows);
});

// POST create annotation(s)
app.post('/api/annotations', (req, res) => {
    const items = Array.isArray(req.body) ? req.body : [req.body];
    const stmt = db.prepare(`
        INSERT INTO annotations (id, x, y, x1, y1, x2, y2, shape, sentiment, comment, page_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertMany = db.transaction((items) => {
        for (const a of items) {
            stmt.run(
                a.id || Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
                a.x || null, a.y || null,
                a.x1 || null, a.y1 || null,
                a.x2 || null, a.y2 || null,
                a.shape || 'pin',
                a.sentiment,
                a.comment || '',
                a.page_url || '',
                a.created_at || new Date().toISOString()
            );
        }
    });
    
    insertMany(items);
    res.json({ ok: true, count: items.length });
});

// DELETE single annotation
app.delete('/api/annotations/:id', (req, res) => {
    db.prepare('DELETE FROM annotations WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
});

// DELETE all annotations
app.delete('/api/annotations', (req, res) => {
    db.prepare('DELETE FROM annotations').run();
    res.json({ ok: true });
});

// GET stats
app.get('/api/stats', (req, res) => {
    const rows = db.prepare('SELECT sentiment, COUNT(*) as count FROM annotations GROUP BY sentiment').all();
    const stats = { like: 0, dislike: 0, neutral: 0, total: 0 };
    rows.forEach(r => { stats[r.sentiment] = r.count; stats.total += r.count; });
    res.json(stats);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔥 Flame Group API running on port ${PORT}`);
});
